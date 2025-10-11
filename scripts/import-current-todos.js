// Import current TODO list into Seth Command Center
// Run with: node scripts/import-current-todos.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const tasks = [
  // Abraham Media Kit (Eden)
  {
    title: "Test Abraham whitelist flow",
    projectName: "Eden",
    priority: 1,
    due: "2025-10-06",
    energy: 2,
    notes: "Test form submission before whitelist opens on Oct 6",
    tags: "abraham,launch,critical"
  },
  {
    title: "Monitor Abraham Genesis Sale (Oct 8, 6pm CET)",
    projectName: "Eden",
    priority: 1,
    due: "2025-10-08",
    energy: 2,
    notes: "Coordinate with team during sale",
    tags: "abraham,launch,critical"
  },
  {
    title: "Prep Abraham Covenant comms for Oct 19 launch",
    projectName: "Eden",
    priority: 1,
    due: "2025-10-19",
    energy: 2,
    notes: "Launch communications and coordination",
    tags: "abraham,covenant,launch"
  },

  // MIYOMI (Eden)
  {
    title: "Daily Dome API key follow-up (CRITICAL BLOCKER)",
    projectName: "Eden",
    priority: 1,
    due: "2025-10-15",
    energy: 3,
    notes: "MIYOMI blocked - must unblock by Oct 15 for Oct 20-24 video window. Daily follow-up required.",
    tags: "miyomi,blocked,critical,daily"
  },

  // Relocation
  {
    title: "Receive GP pricing table from John Canavan",
    projectName: "Relocation",
    priority: 1,
    due: "2025-10-10",
    energy: 2,
    notes: "EOR pricing, Blue Card pension → PR track, multi-income compliance",
    tags: "relocation,gp,blue-card"
  },
  {
    title: "Confirm Blue Card multi-income compliance",
    projectName: "Relocation",
    priority: 1,
    due: "2025-10-15",
    energy: 2,
    notes: "Clarify compliance for Eden + Automata/Node income streams",
    tags: "relocation,blue-card,compliance"
  },
  {
    title: "Schedule first Expats in Wonderland coaching session",
    projectName: "Relocation",
    priority: 2,
    due: "2025-10-15",
    energy: 3,
    notes: "Visa process now active after invoice paid",
    tags: "relocation,expats,coaching"
  },
  {
    title: "Start Berlin apartment search (pet-friendly, furnished, 6-12mo)",
    projectName: "Relocation",
    priority: 2,
    due: "2025-10-20",
    energy: 2,
    notes: "Create apartment search brief",
    tags: "relocation,apartment,berlin"
  },

  // Variant / NFT Brokerage (BM)
  {
    title: "Secure Variant fund wallet addresses",
    projectName: "BM",
    priority: 1,
    due: "2025-10-08",
    energy: 2,
    notes: "Need wallet addresses from fund for trait verification",
    tags: "variant,nft,gondi"
  },
  {
    title: "Run full trait verification on Variant portfolio",
    projectName: "BM",
    priority: 1,
    due: "2025-10-10",
    energy: 1,
    notes: "Punks, squiggles, fidenzas, ringers → deliver summary to Zack at Gondi",
    tags: "variant,nft,gondi,analysis"
  },

  // SOLIENNE (Eden)
  {
    title: "Begin SOLIENNE consolidation (12+ variants)",
    projectName: "Eden",
    priority: 2,
    due: "2025-10-31",
    energy: 1,
    notes: "Create /solienne/browser and /solienne/archive. Remove duplicate directories.",
    tags: "solienne,cleanup,file-reorg"
  },

  // NODE (BM)
  {
    title: "Expand NODE artist database (Kim Asendorf, Holly+Mat)",
    projectName: "BM",
    priority: 2,
    due: "2025-10-31",
    energy: 1,
    notes: "Add Genesis artists, galleries, collectors to NODE CRM",
    tags: "node,artists,crm"
  },

  // Automata
  {
    title: "Update Automata deck (fundraising + style transfer)",
    projectName: "Automata",
    priority: 2,
    due: "2025-10-31",
    energy: 1,
    notes: "Vision deck update for fundraising",
    tags: "automata,deck,fundraising"
  }
];

async function importTasks() {
  console.log(`🌱 Importing ${tasks.length} tasks into Seth Command Center...`);

  // Get all projects first
  const projects = await prisma.project.findMany();
  const projectMap = Object.fromEntries(
    projects.map(p => [p.name.toLowerCase(), p.id])
  );

  console.log(`📁 Found projects: ${projects.map(p => p.name).join(', ')}\n`);

  for (const task of tasks) {
    try {
      const projectId = projectMap[task.projectName.toLowerCase()];

      if (!projectId) {
        console.error(`❌ ${task.title}: Project "${task.projectName}" not found`);
        continue;
      }

      const todo = await prisma.task.create({
        data: {
          title: task.title,
          projectId: projectId,
          priority: task.priority,
          due: task.due ? new Date(task.due) : null,
          energy: task.energy,
          notes: task.notes,
          tags: task.tags,
          status: 'open',
          source: 'manual'
        }
      });

      console.log(`✅ ${task.title}`);
    } catch (error) {
      console.error(`❌ ${task.title}: ${error.message}`);
    }
  }

  await prisma.$disconnect();
  console.log('\n🎉 Import complete! Visit http://localhost:3001/command-center/todos');
}

importTasks();
