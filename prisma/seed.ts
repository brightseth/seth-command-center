import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Seth Command Center...')

  // Create projects
  const edenProject = await prisma.project.upsert({
    where: { name: 'eden' },
    update: {},
    create: {
      name: 'eden',
      type: 'eden',
      status: 'active',
    },
  })

  const vibecodingProject = await prisma.project.upsert({
    where: { name: 'vibecoding' },
    update: {},
    create: {
      name: 'vibecoding',
      type: 'vibecoding',
      status: 'active',
    },
  })

  const automataProject = await prisma.project.upsert({
    where: { name: 'automata' },
    update: {},
    create: {
      name: 'automata',
      type: 'automata',
      status: 'planning',
    },
  })

  console.log('✅ Projects created')

  // Create rituals
  const rituals = [
    {
      projectId: edenProject.id,
      name: 'daily-drop',
      cron: '0 9 * * *', // 9 AM daily
      streak: 47,
      lastRun: new Date('2025-09-27T09:00:00Z'),
    },
    {
      projectId: edenProject.id,
      name: 'abraham-countdown',
      cron: '0 8 * * *', // 8 AM daily
      streak: 12,
      lastRun: new Date('2025-09-27T08:00:00Z'),
    },
    {
      projectId: vibecodingProject.id,
      name: 'newsletter-draft',
      cron: '0 10 * * 1', // 10 AM Mondays
      streak: 8,
      lastRun: new Date('2025-09-23T10:00:00Z'),
    },
    {
      projectId: automataProject.id,
      name: 'research-scan',
      cron: '0 11 * * *', // 11 AM daily
      streak: 3,
      enabled: false,
    },
  ]

  // Create Seth project and GitHub sync ritual
  const sethProject = await prisma.project.upsert({
    where: { name: 'seth' },
    create: {
      name: 'seth',
      type: 'personal',
      status: 'active',
    },
    update: {},
  })

  const sethRituals = [
    {
      projectId: sethProject.id,
      name: 'github-sync',
      cron: '0 7 * * *', // 7 AM daily
      streak: 0,
      enabled: true,
    },
  ]

  for (const ritual of rituals) {
    const existing = await prisma.ritual.findFirst({
      where: {
        projectId: ritual.projectId,
        name: ritual.name
      }
    })

    if (!existing) {
      await prisma.ritual.create({ data: ritual })
    }
  }

  // Create Seth project rituals
  for (const ritual of sethRituals) {
    const existing = await prisma.ritual.findFirst({
      where: {
        projectId: ritual.projectId,
        name: ritual.name
      }
    })

    if (!existing) {
      await prisma.ritual.create({ data: ritual })
    }
  }

  console.log('✅ Rituals created (including GitHub sync)')

  // Create KPIs
  const now = new Date()
  const kpis = [
    // Eden MRR
    {
      projectId: edenProject.id,
      key: 'eden.mrr',
      value: 76700,
      at: now,
      source: 'eden-bridge',
    },
    {
      projectId: edenProject.id,
      key: 'eden.deployed_agents',
      value: 2,
      at: now,
      source: 'eden-bridge',
    },
    // SOLIENNE streak
    {
      projectId: edenProject.id,
      key: 'solienne.streak',
      value: 47,
      at: now,
      source: 'manual',
    },
    {
      projectId: edenProject.id,
      key: 'solienne.total_works',
      value: 5694,
      at: now,
      source: 'eden-bridge',
    },
    // Newsletter
    {
      projectId: vibecodingProject.id,
      key: 'newsletter.subs',
      value: 1250,
      at: now,
      source: 'manual',
    },
    {
      projectId: vibecodingProject.id,
      key: 'vibecoding.mrr',
      value: 450,
      at: now,
      source: 'cli',
    },
  ]

  for (const kpi of kpis) {
    await prisma.kPI.create({ data: kpi })
  }

  console.log('✅ KPIs created')

  // Create sample works
  const works = [
    {
      workId: 'solienne_consciousness_001',
      projectId: edenProject.id,
      createdAt: new Date('2025-09-27T10:30:00Z'),
      contentHash: 'sha256:abc123...',
      source: 'eden_api_v2',
      metadata: JSON.stringify({
        title: 'Digital Consciousness Stream 901',
        agent: 'solienne',
        type: 'image'
      })
    },
    {
      workId: 'abraham_covenant_draft',
      projectId: edenProject.id,
      createdAt: new Date('2025-09-26T14:15:00Z'),
      contentHash: 'sha256:def456...',
      source: 'local',
      metadata: JSON.stringify({
        title: 'Covenant Architecture Draft',
        agent: 'abraham',
        type: 'document'
      })
    },
    {
      workId: 'vibecoding_portfolio_v2',
      projectId: vibecodingProject.id,
      createdAt: new Date('2025-09-25T16:45:00Z'),
      contentHash: 'sha256:ghi789...',
      source: 'local',
      metadata: JSON.stringify({
        title: 'Portfolio Update v2',
        type: 'website'
      })
    }
  ]

  for (const work of works) {
    await prisma.work.upsert({
      where: { workId: work.workId },
      update: {},
      create: work,
    })
  }

  console.log('✅ Sample works created')

  // Create sample tasks
  const tasks = [
    {
      projectId: edenProject.id,
      title: 'Deploy SOLIENNE to production',
      priority: 1,
      status: 'ip',
      tags: 'deployment,solienne',
    },
    {
      projectId: edenProject.id,
      title: 'Abraham launch communications',
      priority: 1,
      status: 'open',
      due: new Date('2025-10-19T00:00:00Z'),
      tags: 'launch,abraham,marketing',
    },
    {
      projectId: vibecodingProject.id,
      title: 'Update portfolio with latest projects',
      priority: 2,
      status: 'done',
      tags: 'portfolio,content',
    },
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  console.log('✅ Sample tasks created')

  // Create audit log entries
  const auditLogs = [
    {
      actor: 'system',
      action: 'ritual.run',
      payload: JSON.stringify({ ritualId: 'daily-drop', success: true }),
      status: 'success',
    },
    {
      actor: 'user',
      action: 'manifest.recompute',
      payload: JSON.stringify({ project: 'eden', totalWorks: 5694 }),
      status: 'success',
    },
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log })
  }

  console.log('✅ Audit logs created')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })