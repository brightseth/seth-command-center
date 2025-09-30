import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Seth Command Center...')

  // Create @Seth todos projects (personal task management)
  const bmProject = await prisma.project.upsert({
    where: { name: 'BM' },
    update: {},
    create: {
      name: 'BM',
      type: 'personal',
      status: 'active',
      color: '#FF6B6B', // Red accent
    },
  })

  const relocationProject = await prisma.project.upsert({
    where: { name: 'Relocation' },
    update: {},
    create: {
      name: 'Relocation',
      type: 'personal',
      status: 'active',
      color: '#4ECDC4', // Teal accent
    },
  })

  const irsProject = await prisma.project.upsert({
    where: { name: 'IRS' },
    update: {},
    create: {
      name: 'IRS',
      type: 'personal',
      status: 'active',
      color: '#45B7D1', // Blue accent
    },
  })

  // Create projects
  const edenProject = await prisma.project.upsert({
    where: { name: 'Eden' },
    update: {},
    create: {
      name: 'Eden',
      type: 'eden',
      status: 'active',
      color: '#96CEB4', // Green accent
    },
  })

  const vibecodingProject = await prisma.project.upsert({
    where: { name: 'Vibecoding' },
    update: {},
    create: {
      name: 'Vibecoding',
      type: 'vibecoding',
      status: 'active',
      color: '#FFEAA7', // Yellow accent
    },
  })

  const automataProject = await prisma.project.upsert({
    where: { name: 'Automata' },
    update: {},
    create: {
      name: 'Automata',
      type: 'automata',
      status: 'planning',
      color: '#DDA0DD', // Purple accent
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
    {
      projectId: sethProject.id,
      name: 'ai-session-sync',
      cron: '*/30 * * * *', // Every 30 minutes
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

  // Create @Seth todos sample tasks (as per spec)
  const tasks = [
    // BM site/email tasks
    {
      projectId: bmProject.id,
      title: 'Update BM site with latest portfolio',
      notes: 'Include new Eden work and Vibecoding projects',
      priority: 2,
      status: 'open',
      due: new Date('2025-10-15T00:00:00Z'),
      source: 'email',
      tags: 'website,portfolio',
      energy: 2, // normal energy
    },
    {
      projectId: bmProject.id,
      title: 'Pay Paris Photo fee',
      notes: 'Invoice received via email, due Oct 1',
      priority: 1,
      status: 'open',
      due: new Date('2025-10-01T00:00:00Z'),
      source: 'email',
      tags: 'finance,event',
      energy: 3, // light energy
    },
    // Abraham/Eden deck tasks
    {
      projectId: edenProject.id,
      title: 'Abraham launch deck final review',
      notes: 'Review covenant architecture slides before Oct 19 launch',
      priority: 1,
      status: 'doing',
      due: new Date('2025-10-12T00:00:00Z'),
      source: 'slash',
      tags: 'launch,abraham,deck',
      energy: 1, // deep energy
    },
    {
      projectId: edenProject.id,
      title: 'Deploy SOLIENNE consciousness gallery',
      priority: 1,
      status: 'open',
      tags: 'deployment,solienne',
      energy: 2,
    },
    // Automata deck
    {
      projectId: automataProject.id,
      title: 'Automata vision deck v2',
      notes: 'Update with latest research findings and technical architecture',
      priority: 2,
      status: 'open',
      source: 'manual',
      tags: 'deck,vision,research',
      energy: 1, // deep energy
    },
    // COBRA/Expats (IRS/Relocation)
    {
      projectId: irsProject.id,
      title: 'Submit COBRA paperwork',
      notes: 'Health insurance continuation forms',
      priority: 1,
      status: 'blocked',
      due: new Date('2025-10-05T00:00:00Z'),
      source: 'calendar',
      tags: 'health,insurance,legal',
      energy: 3, // light energy
    },
    {
      projectId: relocationProject.id,
      title: 'Research expat tax implications',
      notes: 'Consult with international tax advisor',
      priority: 2,
      status: 'open',
      source: 'manual',
      tags: 'tax,legal,research',
      energy: 1, // deep energy
    },
    {
      projectId: relocationProject.id,
      title: 'Book flights for location scouting',
      priority: 2,
      status: 'snoozed',
      due: new Date('2025-11-01T00:00:00Z'),
      tags: 'travel,planning',
      energy: 3, // light energy
    },
    // Vibecoding tasks
    {
      projectId: vibecodingProject.id,
      title: 'Newsletter draft - AI agent update',
      notes: 'Cover Abraham launch and SOLIENNE gallery',
      priority: 2,
      status: 'open',
      due: new Date('2025-10-07T00:00:00Z'),
      source: 'ritual',
      tags: 'newsletter,content',
      energy: 2, // normal energy
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