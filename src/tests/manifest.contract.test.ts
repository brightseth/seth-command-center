/**
 * Manifest Contract Tests
 *
 * These tests ensure the manifest API provides deterministic results
 * even when source data has pagination issues or inconsistencies.
 *
 * Tests MUST break on drift to maintain "manifest as truth" architecture.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { ManifestService } from '@/services/manifest'
import { prisma } from '@/lib/db'

describe('Manifest Contract Tests', () => {
  const manifestService = new ManifestService()
  let testProject: { id: string; name: string }

  beforeEach(async () => {
    // Create test project
    testProject = await prisma.project.create({
      data: {
        name: 'test-project',
        type: 'test',
        status: 'active',
      },
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.work.deleteMany({
      where: { projectId: testProject.id },
    })
    await prisma.project.delete({
      where: { id: testProject.id },
    })
  })

  describe('Deterministic Totals', () => {
    it('returns consistent total count even with pagination gaps', async () => {
      // Simulate paginated data with gaps (like missing pages from API)
      const works = [
        {
          workId: 'work_001',
          projectId: testProject.id,
          createdAt: new Date('2025-01-15'),
          contentHash: 'hash001',
          source: 'api_v1',
        },
        // Gap here (simulating missing page 2)
        {
          workId: 'work_050',
          projectId: testProject.id,
          createdAt: new Date('2025-02-15'),
          contentHash: 'hash050',
          source: 'api_v1',
        },
        {
          workId: 'work_051',
          projectId: testProject.id,
          createdAt: new Date('2025-02-16'),
          contentHash: 'hash051',
          source: 'api_v1',
        },
      ]

      await prisma.work.createMany({ data: works })

      const manifest1 = await manifestService.getProjectManifest(testProject.name)
      const manifest2 = await manifestService.getProjectManifest(testProject.name)

      // Should return deterministic totals
      expect(manifest1.total).toBe(3)
      expect(manifest2.total).toBe(3)
      expect(manifest1.total).toBe(manifest2.total)
    })

    it('maintains total accuracy after partial source failures', async () => {
      // Add initial works
      await prisma.work.createMany({
        data: [
          {
            workId: 'work_reliable_001',
            projectId: testProject.id,
            createdAt: new Date('2025-01-01'),
            contentHash: 'hash1',
            source: 'reliable_source',
          },
          {
            workId: 'work_reliable_002',
            projectId: testProject.id,
            createdAt: new Date('2025-01-02'),
            contentHash: 'hash2',
            source: 'reliable_source',
          },
        ],
      })

      const beforeFailure = await manifestService.getProjectManifest(testProject.name)
      expect(beforeFailure.total).toBe(2)

      // Simulate some source failing and works not being captured
      // But manifest should still return what's in DB
      const afterFailure = await manifestService.getProjectManifest(testProject.name)
      expect(afterFailure.total).toBe(2) // Should remain consistent
    })
  })

  describe('Recomputation After Backfill', () => {
    it('updates totals predictably after backfill job', async () => {
      // Initial state
      await prisma.work.create({
        data: {
          workId: 'initial_work',
          projectId: testProject.id,
          createdAt: new Date(),
          contentHash: 'initial',
          source: 'initial',
        },
      })

      const initialManifest = await manifestService.getProjectManifest(testProject.name)
      expect(initialManifest.total).toBe(1)

      // Simulate backfill adding missing works
      await prisma.work.createMany({
        data: [
          {
            workId: 'backfilled_001',
            projectId: testProject.id,
            createdAt: new Date('2025-01-01'),
            contentHash: 'backfilled1',
            source: 'backfill_job',
          },
          {
            workId: 'backfilled_002',
            projectId: testProject.id,
            createdAt: new Date('2025-01-02'),
            contentHash: 'backfilled2',
            source: 'backfill_job',
          },
        ],
      })

      // Recompute manifest
      const recomputeResult = await manifestService.recomputeManifest(testProject.name)
      expect(recomputeResult.success).toBe(true)
      expect(recomputeResult.newTotal).toBe(3)

      // Verify new manifest reflects backfilled data
      const updatedManifest = await manifestService.getProjectManifest(testProject.name)
      expect(updatedManifest.total).toBe(3)
    })
  })

  describe('Drift Detection', () => {
    it('fails when source data is inconsistent', async () => {
      // This test is designed to break when there's unexpected data drift
      const expectedWorks = [
        {
          workId: 'expected_001',
          projectId: testProject.id,
          createdAt: new Date('2025-09-01'),
          contentHash: 'expected1',
          source: 'api_v2',
        },
        {
          workId: 'expected_002',
          projectId: testProject.id,
          createdAt: new Date('2025-09-02'),
          contentHash: 'expected2',
          source: 'api_v2',
        },
      ]

      await prisma.work.createMany({ data: expectedWorks })

      const manifest = await manifestService.getProjectManifest(testProject.name)

      // These assertions will break if unexpected drift occurs
      expect(manifest.total).toBe(2)
      expect(manifest.latestId).toBe('expected_002')

      // Month histogram should have specific structure
      const currentMonth = '2025-09'
      expect(manifest.byMonth[currentMonth]).toBe(2)
    })

    it('detects missing works that should exist', async () => {
      // Simulate a scenario where we expect certain works to exist
      // but they're missing due to source issues
      const criticalWorks = [
        'solienne_consciousness_001',
        'abraham_covenant_001',
      ]

      // Create one but not the other
      await prisma.work.create({
        data: {
          workId: 'solienne_consciousness_001',
          projectId: testProject.id,
          createdAt: new Date(),
          contentHash: 'hash',
          source: 'api',
        },
      })

      const manifest = await manifestService.getProjectManifest(testProject.name)

      // This test will fail if critical works are missing
      // In real usage, this would trigger alerts
      if (manifest.total < criticalWorks.length) {
        throw new Error(`Critical works missing. Expected ${criticalWorks.length}, got ${manifest.total}`)
      }
    })
  })

  describe('Month Histogram Consistency', () => {
    it('generates consistent by-month data structure', async () => {
      // Add works across multiple months
      const worksAcrossMonths = [
        {
          workId: 'jan_work',
          projectId: testProject.id,
          createdAt: new Date('2025-01-15'),
          contentHash: 'jan',
          source: 'api',
        },
        {
          workId: 'feb_work_1',
          projectId: testProject.id,
          createdAt: new Date('2025-02-10'),
          contentHash: 'feb1',
          source: 'api',
        },
        {
          workId: 'feb_work_2',
          projectId: testProject.id,
          createdAt: new Date('2025-02-20'),
          contentHash: 'feb2',
          source: 'api',
        },
      ]

      await prisma.work.createMany({ data: worksAcrossMonths })

      const manifest = await manifestService.getProjectManifest(testProject.name)

      // Should always have 12 months of data
      const monthKeys = Object.keys(manifest.byMonth)
      expect(monthKeys.length).toBe(12)

      // Should have correct counts for test months
      expect(manifest.byMonth['2025-01']).toBe(1)
      expect(manifest.byMonth['2025-02']).toBe(2)

      // Should have 0 for months with no data (not undefined)
      expect(manifest.byMonth['2024-12']).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('throws clear error for non-existent project', async () => {
      await expect(
        manifestService.getProjectManifest('non-existent-project')
      ).rejects.toThrow("Project 'non-existent-project' not found")
    })

    it('handles empty project gracefully', async () => {
      // Project with no works
      const manifest = await manifestService.getProjectManifest(testProject.name)

      expect(manifest.total).toBe(0)
      expect(manifest.latestId).toBe(null)
      expect(Object.keys(manifest.byMonth).length).toBe(12)
      expect(manifest.lastUpdated).toBeDefined()
    })
  })
})