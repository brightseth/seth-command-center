// Update existing tasks to use new project names
// Run with: npx tsx scripts/update-task-projects.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateTaskProjects() {
  console.log('🔄 Updating task projects to match new real project names...\n');

  // Get all projects
  const projects = await prisma.project.findMany();
  const projectMap = Object.fromEntries(
    projects.map(p => [p.name, p.id])
  );

  // Update task mappings
  const updates = [
    { oldProject: 'BM', newProject: 'Variant Portfolio', taskKeyword: 'Variant' },
    { oldProject: 'BM', newProject: 'NODE Artist Relations', taskKeyword: 'NODE' },
    { oldProject: 'Relocation', newProject: 'Residency', taskKeyword: null }, // All relocation tasks
    { oldProject: 'Eden', newProject: 'Abraham', taskKeyword: 'Abraham' },
    { oldProject: 'Eden', newProject: 'MIYOMI', taskKeyword: 'MIYOMI' },
    { oldProject: 'Eden', newProject: 'MIYOMI', taskKeyword: 'Dome' },
    { oldProject: 'Eden', newProject: 'SOLIENNE', taskKeyword: 'SOLIENNE' },
  ];

  for (const update of updates) {
    const oldProjectId = projectMap[update.oldProject];
    const newProjectId = projectMap[update.newProject];

    if (!oldProjectId || !newProjectId) {
      console.log(`⏭️  Skipping: ${update.oldProject} → ${update.newProject} (project not found)`);
      continue;
    }

    const whereClause = {
      projectId: oldProjectId,
      ...(update.taskKeyword ? { title: { contains: update.taskKeyword } } : {})
    };

    const result = await prisma.task.updateMany({
      where: whereClause,
      data: { projectId: newProjectId }
    });

    if (result.count > 0) {
      console.log(`✅ Moved ${result.count} tasks: ${update.oldProject} → ${update.newProject}`);
    }
  }

  // Show task distribution
  console.log('\n📊 Task Distribution by Project:\n');

  const tasksByProject = await prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true }
      }
    },
    where: {
      tasks: {
        some: {}
      }
    },
    orderBy: { name: 'asc' }
  });

  for (const project of tasksByProject) {
    console.log(`   ${project.name}: ${project._count.tasks} tasks`);
  }

  await prisma.$disconnect();
  console.log('\n🎉 Task projects updated!');
}

updateTaskProjects();
