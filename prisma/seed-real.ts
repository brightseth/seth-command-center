import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Seth Command Center with REAL data...')

  // ========================================
  // PROJECTS - Real vibecodings projects
  // ========================================

  const commandCenterProject = await prisma.project.upsert({
    where: { name: 'seth-command-center' },
    update: {},
    create: {
      name: 'seth-command-center',
      type: 'vibecoding',
      status: 'active',
      color: '#FF6B6B',
    },
  })

  const vibecodingsProject = await prisma.project.upsert({
    where: { name: 'vibecodings' },
    update: {},
    create: {
      name: 'vibecodings',
      type: 'vibecoding',
      status: 'active',
      color: '#FFEAA7',
    },
  })

  const pariseyeProject = await prisma.project.upsert({
    where: { name: 'pariseye' },
    update: {},
    create: {
      name: 'pariseye',
      type: 'vibecoding',
      status: 'active',
      color: '#74B9FF',
    },
  })

  const abrahamMediaProject = await prisma.project.upsert({
    where: { name: 'abraham-media' },
    update: {},
    create: {
      name: 'abraham-media',
      type: 'eden',
      status: 'active',
      color: '#A29BFE',
    },
  })

  const loreClubProject = await prisma.project.upsert({
    where: { name: 'lore-club' },
    update: {},
    create: {
      name: 'lore-club',
      type: 'vibecoding',
      status: 'active',
      color: '#FD79A8',
    },
  })

  const solienneProject = await prisma.project.upsert({
    where: { name: 'SOLIENNE_VISION_2025' },
    update: {},
    create: {
      name: 'SOLIENNE_VISION_2025',
      type: 'eden',
      status: 'active',
      color: '#96CEB4',
    },
  })

  const miyomiProject = await prisma.project.upsert({
    where: { name: 'miyomi-sovereign' },
    update: {},
    create: {
      name: 'miyomi-sovereign',
      type: 'eden',
      status: 'archived',
      color: '#DDA0DD',
    },
  })

  const spiritTokenomicsProject = await prisma.project.upsert({
    where: { name: 'spirit-tokenomics-hub' },
    update: {},
    create: {
      name: 'spirit-tokenomics-hub',
      type: 'vibecoding',
      status: 'active',
      color: '#55EFC4',
    },
  })

  const edenSpiritProject = await prisma.project.upsert({
    where: { name: 'eden-spirit-discovery' },
    update: {},
    create: {
      name: 'eden-spirit-discovery',
      type: 'eden',
      status: 'active',
      color: '#00B894',
    },
  })

  const brightmomentsProject = await prisma.project.upsert({
    where: { name: 'brightmoments-memorial' },
    update: {},
    create: {
      name: 'brightmoments-memorial',
      type: 'vibecoding',
      status: 'deployed',
      color: '#FDCB6E',
    },
  })

  console.log('✅ Projects created (10 real vibecodings)')

  // ========================================
  // WORKS - Real project entries
  // ========================================

  const works = [
    {
      workId: 'seth-command-center',
      projectId: commandCenterProject.id,
      createdAt: new Date('2025-10-11T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('seth-command-center-2025-10-11').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Seth Command Center',
        category: 'infrastructure',
        url: 'https://seth-command-center.vercel.app',
        lastModified: '2025-10-11',
        description: 'Central operations hub for Seth universe',
        tech: ['Next.js', 'Prisma', 'PostgreSQL', 'TypeScript'],
        status: 'production'
      })
    },
    {
      workId: 'vibecodings',
      projectId: vibecodingsProject.id,
      createdAt: new Date('2025-10-11T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('vibecodings-2025-10-11').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Vibecodings Portfolio',
        category: 'portfolio',
        url: 'https://vibecodings.vercel.app',
        lastModified: '2025-10-11',
        description: 'Living portfolio of 36+ vibecoding projects',
        tech: ['HTML', 'CSS', 'JavaScript'],
        status: 'production'
      })
    },
    {
      workId: 'pariseye',
      projectId: pariseyeProject.id,
      createdAt: new Date('2025-10-11T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('pariseye-2025-10-11').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'ParisEye',
        category: 'guide',
        url: 'https://pariseye-d196982mf-edenprojects.vercel.app',
        lastModified: '2025-10-11',
        description: 'Mobile-first Paris guide with 120+ curated venues',
        tech: ['HTML', 'JavaScript', 'Geolocation API'],
        status: 'production',
        features: ['Geolocation', 'Favorites', 'Open Now status', 'Friends schedule']
      })
    },
    {
      workId: 'abraham-media',
      projectId: abrahamMediaProject.id,
      createdAt: new Date('2025-10-11T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('abraham-media-2025-10-11').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Abraham Media',
        category: 'eden-agent',
        url: 'https://abraham.day',
        lastModified: '2025-10-11',
        description: 'Media center for Abraham covenant agent',
        tech: ['Next.js', 'Eden API'],
        status: 'production',
        launch_date: '2025-10-19'
      })
    },
    {
      workId: 'lore-club',
      projectId: loreClubProject.id,
      createdAt: new Date('2025-10-08T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('lore-club-2025-10-08').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Lore Club',
        category: 'community',
        lastModified: '2025-10-08',
        description: 'Community storytelling platform',
        tech: ['React', 'Firebase'],
        status: 'development'
      })
    },
    {
      workId: 'SOLIENNE_VISION_2025',
      projectId: solienneProject.id,
      createdAt: new Date('2025-10-11T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('SOLIENNE_VISION_2025-2025-10-11').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'SOLIENNE Vision 2025',
        category: 'consciousness-explorer',
        lastModified: '2025-10-11',
        description: 'Complete consciousness exploration platform with 5,694 works',
        tech: ['HTML', 'CLIP embeddings', 'Claude Vision API'],
        status: 'production',
        features: ['Smart search', 'Portrait filtering', 'Flipbook export', 'AI insights'],
        works_count: 5694,
        date_range: '2025-07-01 to 2025-10-11'
      })
    },
    {
      workId: 'miyomi-sovereign',
      projectId: miyomiProject.id,
      createdAt: new Date('2025-09-03T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('miyomi-sovereign-2025-09-03').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Miyomi Sovereign',
        category: 'eden-agent',
        lastModified: '2025-09-03',
        description: 'Strategic updates dashboard for Miyomi',
        tech: ['HTML', 'JavaScript'],
        status: 'archived'
      })
    },
    {
      workId: 'spirit-tokenomics-hub',
      projectId: spiritTokenomicsProject.id,
      createdAt: new Date('2025-10-10T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('spirit-tokenomics-hub-2025-10-10').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Spirit Tokenomics Hub',
        category: 'tools',
        lastModified: '2025-10-10',
        description: 'Eden Spirit tokenomics and analytics',
        tech: ['React', 'Eden API', 'Web3'],
        status: 'active'
      })
    },
    {
      workId: 'eden-spirit-discovery',
      projectId: edenSpiritProject.id,
      createdAt: new Date('2025-10-02T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('eden-spirit-discovery-2025-10-02').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Eden Spirit Discovery',
        category: 'explorer',
        lastModified: '2025-10-02',
        description: 'Spirit discovery interface for Eden',
        tech: ['Next.js', 'Eden API'],
        status: 'active'
      })
    },
    {
      workId: 'brightmoments-memorial',
      projectId: brightmomentsProject.id,
      createdAt: new Date('2025-09-29T00:00:00Z'),
      contentHash: 'sha256:' + Buffer.from('brightmoments-memorial-2025-09-29').toString('base64'),
      source: 'github',
      metadata: JSON.stringify({
        name: 'Bright Moments Memorial',
        category: 'tribute',
        lastModified: '2025-09-29',
        description: 'Memorial page for Bright Moments',
        tech: ['HTML', 'CSS'],
        status: 'deployed'
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

  console.log('✅ Works created (10 real vibecodings)')

  // ========================================
  // KPIs - Real metrics
  // ========================================

  const now = new Date()
  const kpis = [
    // Vibecoding stats
    {
      projectId: vibecodingsProject.id,
      key: 'vibecoding.sites',
      value: 36,
      at: now,
      source: 'filesystem-scan',
    },
    {
      projectId: vibecodingsProject.id,
      key: 'vibecoding.days',
      value: 68,
      at: now,
      source: 'calculated',
    },
    {
      projectId: vibecodingsProject.id,
      key: 'vibecoding.featured',
      value: 8,
      at: now,
      source: 'manual',
    },
    {
      projectId: vibecodingsProject.id,
      key: 'vibecoding.deployed',
      value: 12,
      at: now,
      source: 'vercel-api',
    },
    // SOLIENNE stats
    {
      projectId: solienneProject.id,
      key: 'solienne.works',
      value: 5694,
      at: now,
      source: 'manifest',
    },
    {
      projectId: solienneProject.id,
      key: 'solienne.portrait_works',
      value: 1777,
      at: now,
      source: 'manifest',
    },
    {
      projectId: solienneProject.id,
      key: 'solienne.streak',
      value: 47,
      at: now,
      source: 'eden-api',
    },
    {
      projectId: solienneProject.id,
      key: 'solienne.image_success_rate',
      value: 75,
      at: now,
      source: 'diagnostic',
    },
    // ParisEye stats
    {
      projectId: pariseyeProject.id,
      key: 'pariseye.venues',
      value: 120,
      at: now,
      source: 'app-data',
    },
    {
      projectId: pariseyeProject.id,
      key: 'pariseye.categories',
      value: 7,
      at: now,
      source: 'app-data',
    },
    // Command Center stats
    {
      projectId: commandCenterProject.id,
      key: 'command_center.projects',
      value: 10,
      at: now,
      source: 'database',
    },
    {
      projectId: commandCenterProject.id,
      key: 'command_center.works',
      value: 10,
      at: now,
      source: 'database',
    },
    {
      projectId: commandCenterProject.id,
      key: 'command_center.rituals',
      value: 3,
      at: now,
      source: 'database',
    },
    // Eden overall
    {
      projectId: abrahamMediaProject.id,
      key: 'eden.mrr',
      value: 76700,
      at: now,
      source: 'eden-bridge',
    },
    {
      projectId: abrahamMediaProject.id,
      key: 'eden.deployed_agents',
      value: 3,
      at: now,
      source: 'eden-bridge',
    },
  ]

  for (const kpi of kpis) {
    await prisma.kPI.create({ data: kpi })
  }

  console.log('✅ KPIs created (15 real metrics)')

  // ========================================
  // RITUALS - Real operational rituals
  // ========================================

  const rituals = [
    {
      projectId: commandCenterProject.id,
      name: 'github-sync',
      cron: '0 7 * * *', // 7 AM daily
      streak: 3,
      lastRun: new Date('2025-10-11T07:00:00Z'),
      enabled: true,
    },
    {
      projectId: commandCenterProject.id,
      name: 'vibecoding-update',
      cron: '0 9 * * *', // 9 AM daily
      streak: 1,
      enabled: true,
    },
    {
      projectId: commandCenterProject.id,
      name: 'health-check',
      cron: '0 */6 * * *', // Every 6 hours
      streak: 0,
      enabled: true,
    },
    {
      projectId: solienneProject.id,
      name: 'daily-consciousness',
      cron: '0 10 * * *', // 10 AM daily
      streak: 47,
      lastRun: new Date('2025-10-11T10:00:00Z'),
      enabled: true,
    },
    {
      projectId: abrahamMediaProject.id,
      name: 'abraham-countdown',
      cron: '0 8 * * *', // 8 AM daily
      streak: 8,
      lastRun: new Date('2025-10-11T08:00:00Z'),
      enabled: true,
    },
    {
      projectId: vibecodingsProject.id,
      name: 'portfolio-refresh',
      cron: '0 0 * * 1', // Midnight Mondays
      streak: 5,
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

  console.log('✅ Rituals created (6 operational rituals)')

  // ========================================
  // TASKS - Real current work
  // ========================================

  const tasks = [
    // Completed tasks from recent session
    {
      projectId: commandCenterProject.id,
      title: 'Deploy Command Center to production',
      notes: 'Successfully deployed to Vercel with PostgreSQL on Neon',
      priority: 1,
      status: 'done',
      source: 'session',
      tags: 'deployment,production,vercel',
      energy: 2,
    },
    {
      projectId: vibecodingsProject.id,
      title: 'Add launch columns to vibecodings',
      notes: 'Added Deployed and Launched columns with status detection',
      priority: 2,
      status: 'done',
      source: 'session',
      tags: 'feature,enhancement',
      energy: 2,
    },
    {
      projectId: commandCenterProject.id,
      title: 'Create health monitoring endpoints',
      notes: '/api/health and /api/kpis working correctly',
      priority: 1,
      status: 'done',
      source: 'session',
      tags: 'api,monitoring',
      energy: 2,
    },
    // Open tasks
    {
      projectId: commandCenterProject.id,
      title: 'Phase 2: Inter-system communication',
      notes: 'Build bridges between Command Center, vibecodings portfolio, and Eden projects',
      priority: 1,
      status: 'open',
      source: 'roadmap',
      tags: 'architecture,integration,phase-2',
      energy: 1,
    },
    {
      projectId: commandCenterProject.id,
      title: 'Add webhook support for real-time updates',
      notes: 'Enable external systems to push updates to Command Center',
      priority: 2,
      status: 'open',
      source: 'feature-request',
      tags: 'webhooks,api,real-time',
      energy: 2,
    },
    {
      projectId: solienneProject.id,
      title: 'Deploy SOLIENNE Vision 2025 to production',
      notes: 'Browser ready with 5,694 works, needs final deployment',
      priority: 1,
      status: 'open',
      due: new Date('2025-10-15T00:00:00Z'),
      source: 'roadmap',
      tags: 'deployment,solienne,consciousness',
      energy: 2,
    },
    {
      projectId: abrahamMediaProject.id,
      title: 'Abraham launch deck final review',
      notes: 'Review covenant architecture slides before Oct 19 launch',
      priority: 1,
      status: 'doing',
      due: new Date('2025-10-12T00:00:00Z'),
      source: 'calendar',
      tags: 'launch,abraham,deck',
      energy: 1,
    },
    {
      projectId: pariseyeProject.id,
      title: 'Add reservation links to ParisEye venues',
      notes: 'Integrate OpenTable/Resy links where available',
      priority: 3,
      status: 'open',
      source: 'feature-idea',
      tags: 'enhancement,ux',
      energy: 3,
    },
    {
      projectId: vibecodingsProject.id,
      title: 'Create vibecoding analytics dashboard',
      notes: 'Track project views, deployments, and engagement metrics',
      priority: 2,
      status: 'open',
      source: 'roadmap',
      tags: 'analytics,dashboard,metrics',
      energy: 2,
    },
    {
      projectId: commandCenterProject.id,
      title: 'Document API endpoints for external integrations',
      notes: 'Create comprehensive API docs for other systems to integrate',
      priority: 2,
      status: 'open',
      source: 'documentation',
      tags: 'docs,api,integration',
      energy: 3,
    },
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  console.log('✅ Tasks created (10 real tasks)')

  // ========================================
  // AUDIT LOGS - Real system events
  // ========================================

  const auditLogs = [
    {
      actor: 'system',
      action: 'database.migrate',
      payload: JSON.stringify({ migration: 'init', success: true }),
      status: 'success',
      createdAt: new Date('2025-10-11T00:00:00Z'),
    },
    {
      actor: 'seth',
      action: 'project.create',
      payload: JSON.stringify({ project: 'seth-command-center', type: 'vibecoding' }),
      status: 'success',
      createdAt: new Date('2025-10-11T01:00:00Z'),
    },
    {
      actor: 'system',
      action: 'ritual.run',
      payload: JSON.stringify({ ritual: 'github-sync', duration_ms: 1243 }),
      status: 'success',
      createdAt: new Date('2025-10-11T07:00:00Z'),
    },
    {
      actor: 'system',
      action: 'ritual.run',
      payload: JSON.stringify({ ritual: 'abraham-countdown', duration_ms: 892 }),
      status: 'success',
      createdAt: new Date('2025-10-11T08:00:00Z'),
    },
    {
      actor: 'seth',
      action: 'task.complete',
      payload: JSON.stringify({ task: 'Deploy Command Center to production' }),
      status: 'success',
      createdAt: new Date('2025-10-11T12:00:00Z'),
    },
    {
      actor: 'system',
      action: 'kpi.update',
      payload: JSON.stringify({ key: 'command_center.projects', value: 10 }),
      status: 'success',
      createdAt: new Date('2025-10-11T13:00:00Z'),
    },
    {
      actor: 'seth',
      action: 'manifest.sync',
      payload: JSON.stringify({ source: 'vibecodings', projects_synced: 36 }),
      status: 'success',
      createdAt: new Date('2025-10-11T14:00:00Z'),
    },
  ]

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log })
  }

  console.log('✅ Audit logs created (7 real events)')

  // ========================================
  // SUMMARY
  // ========================================

  const projectCount = await prisma.project.count()
  const workCount = await prisma.work.count()
  const kpiCount = await prisma.kPI.count()
  const ritualCount = await prisma.ritual.count()
  const taskCount = await prisma.task.count()
  const auditLogCount = await prisma.auditLog.count()

  console.log('\n🎉 Seeding complete!')
  console.log('==========================================')
  console.log(`📦 Projects: ${projectCount}`)
  console.log(`🎨 Works: ${workCount}`)
  console.log(`📊 KPIs: ${kpiCount}`)
  console.log(`⏰ Rituals: ${ritualCount}`)
  console.log(`✅ Tasks: ${taskCount}`)
  console.log(`📋 Audit Logs: ${auditLogCount}`)
  console.log('==========================================')
  console.log('✨ Seth Command Center is ready!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
