// Remove duplicate tasks and projects
// Run with: npx tsx scripts/remove-duplicates.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeDuplicates() {
  console.log('🧹 Cleaning up duplicates...\n');

  // Find duplicate projects (keep the one with most tasks, or newest if tied)
  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true }
      }
    }
  });

  const projectsByName = new Map();
  for (const project of projects) {
    const nameLower = project.name.toLowerCase();
    if (!projectsByName.has(nameLower)) {
      projectsByName.set(nameLower, []);
    }
    projectsByName.get(nameLower).push(project);
  }

  for (const [name, duplicates] of projectsByName) {
    if (duplicates.length > 1) {
      // Sort by task count (desc), then by createdAt (desc)
      duplicates.sort((a, b) => {
        if (b._count.tasks !== a._count.tasks) {
          return b._count.tasks - a._count.tasks;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const keep = duplicates[0];
      const toDelete = duplicates.slice(1);

      console.log(`📁 Found ${duplicates.length} projects named "${name}"`);
      console.log(`   ✅ Keeping: ${keep.name} (${keep._count.tasks} tasks, ID: ${keep.id})`);

      for (const dup of toDelete) {
        // Move tasks from duplicate to keeper
        if (dup._count.tasks > 0) {
          const moved = await prisma.task.updateMany({
            where: { projectId: dup.id },
            data: { projectId: keep.id }
          });
          console.log(`   🔀 Moved ${moved.count} tasks from duplicate`);
        }

        // Delete the duplicate project
        await prisma.project.delete({
          where: { id: dup.id }
        });
        console.log(`   ❌ Deleted: ${dup.name} (ID: ${dup.id})`);
      }
      console.log();
    }
  }

  // Find duplicate tasks (same title + project)
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const tasksByKey = new Map();
  for (const task of tasks) {
    const key = `${task.projectId}:${task.title.toLowerCase().trim()}`;
    if (!tasksByKey.has(key)) {
      tasksByKey.set(key, []);
    }
    tasksByKey.get(key).push(task);
  }

  let duplicateTasksDeleted = 0;
  for (const [key, duplicates] of tasksByKey) {
    if (duplicates.length > 1) {
      // Keep the newest one
      const keep = duplicates[0];
      const toDelete = duplicates.slice(1);

      console.log(`📝 Found ${duplicates.length} tasks: "${keep.title}"`);
      console.log(`   ✅ Keeping: ${keep.id} (${keep.createdAt.toISOString()})`);

      for (const dup of toDelete) {
        await prisma.task.delete({
          where: { id: dup.id }
        });
        console.log(`   ❌ Deleted: ${dup.id} (${dup.createdAt.toISOString()})`);
        duplicateTasksDeleted++;
      }
      console.log();
    }
  }

  // Summary
  console.log('\n📊 Final Status:');
  const finalProjects = await prisma.project.findMany({
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

  console.log(`\n   Projects with tasks: ${finalProjects.length}`);
  for (const project of finalProjects) {
    console.log(`   - ${project.name}: ${project._count.tasks} tasks`);
  }

  const totalTasks = await prisma.task.count();
  console.log(`\n   Total tasks: ${totalTasks}`);
  console.log(`   Duplicates removed: ${duplicateTasksDeleted}`);

  await prisma.$disconnect();
  console.log('\n🎉 Cleanup complete!');
}

removeDuplicates();
