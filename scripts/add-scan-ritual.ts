#!/usr/bin/env tsx
/**
 * Add TODO scanning ritual to database
 */

import { prisma } from '../src/lib/db'

async function addRitual() {
  // Find or create "seth" project
  let project = await prisma.project.findFirst({
    where: { name: 'seth' }
  })

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'seth',
        type: 'business',
        status: 'active',
        color: '#000000'
      }
    })
  }

  // Check if ritual already exists
  const existing = await prisma.ritual.findFirst({
    where: {
      name: 'scan-todos',
      projectId: project.id
    }
  })

  if (existing) {
    console.log('✅ Ritual already exists:', existing.name)
    console.log('   Cron:', existing.cron)
    console.log('   Enabled:', existing.enabled)
    return
  }

  // Create ritual
  const ritual = await prisma.ritual.create({
    data: {
      name: 'scan-todos',
      projectId: project.id,
      cron: '0,30 * * * *', // Every 30 minutes
      enabled: true
    }
  })

  console.log('✅ Created TODO scanning ritual')
  console.log('   ID:', ritual.id)
  console.log('   Cron:', ritual.cron, '(every 30 minutes)')
  console.log('   Project:', project.name)
  console.log('\n💡 This ritual will automatically scan all project directories for TODOs')
  console.log('   Configure it at: http://localhost:3001/command-center/rituals')
}

addRitual()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
