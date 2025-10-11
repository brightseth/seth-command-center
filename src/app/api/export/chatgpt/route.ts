import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/export/chatgpt
 *
 * Exports tasks in ChatGPT-friendly markdown format
 * Use this to sync your Seth Command Center with ChatGPT
 */
export async function GET(request: NextRequest) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: {
          in: ['open', 'doing', 'blocked']
        }
      },
      include: {
        project: {
          select: { name: true, color: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { due: 'asc' }
      ]
    });

    const completedToday = await prisma.task.findMany({
      where: {
        status: 'done',
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Generate markdown
    let markdown = `# Seth TODO List - Live Sync\n`;
    markdown += `**Last Updated:** ${new Date().toISOString()}\n`;
    markdown += `**Source:** Seth Command Center\n\n`;

    // Completed today
    if (completedToday.length > 0) {
      markdown += `## ✅ Completed Today\n\n`;
      for (const task of completedToday) {
        markdown += `- [x] ${task.title} (${task.project.name})\n`;
      }
      markdown += `\n`;
    }

    // Group by priority
    const highPriority = tasks.filter(t => t.priority === 1);
    const mediumPriority = tasks.filter(t => t.priority === 2);
    const lowPriority = tasks.filter(t => t.priority === 3);

    if (highPriority.length > 0) {
      markdown += `## 🔥 High Priority (${highPriority.length})\n\n`;
      for (const task of highPriority) {
        const checkbox = task.status === 'doing' ? '[→]' : '[ ]';
        const dueStr = task.due ? ` → Due: ${new Date(task.due).toLocaleDateString()}` : '';
        markdown += `- ${checkbox} **${task.title}** (${task.project.name})${dueStr}\n`;
        if (task.notes) {
          markdown += `  - ${task.notes}\n`;
        }
      }
      markdown += `\n`;
    }

    if (mediumPriority.length > 0) {
      markdown += `## ⚡ Medium Priority (${mediumPriority.length})\n\n`;
      for (const task of mediumPriority) {
        const checkbox = task.status === 'doing' ? '[→]' : '[ ]';
        const dueStr = task.due ? ` → Due: ${new Date(task.due).toLocaleDateString()}` : '';
        markdown += `- ${checkbox} ${task.title} (${task.project.name})${dueStr}\n`;
      }
      markdown += `\n`;
    }

    if (lowPriority.length > 0) {
      markdown += `## 💡 Low Priority (${lowPriority.length})\n\n`;
      for (const task of lowPriority) {
        markdown += `- [ ] ${task.title} (${task.project.name})\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    markdown += `**Stats:** ${tasks.length} active tasks | ${completedToday.length} completed today\n`;
    markdown += `**Sync:** http://localhost:3001/api/export/chatgpt\n`;

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'inline; filename="todo.md"'
      }
    });

  } catch (error) {
    console.error('ChatGPT export error:', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}
