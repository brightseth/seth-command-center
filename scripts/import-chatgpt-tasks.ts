#!/usr/bin/env tsx

/**
 * ChatGPT Task Import Script
 * Migrates 24 tasks from ChatGPT into Seth Command Center
 *
 * Usage:
 *   tsx scripts/import-chatgpt-tasks.ts           # Dry run (preview only)
 *   tsx scripts/import-chatgpt-tasks.ts --execute # Actually import
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Task Data
// ============================================================================

interface ChatGPTTask {
  title: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done';
  notes: string;
}

const CHATGPT_TASKS: ChatGPTTask[] = [
  {
    title: "Finalize Abraham First Works sale strategy",
    project: "Abraham",
    priority: "high",
    status: "open",
    notes: "Push final 577 mints before Oct 19 covenant; coordinate comms and collector updates."
  },
  {
    title: "Prepare Abraham Covenant launch materials",
    project: "Abraham",
    priority: "high",
    status: "open",
    notes: "Finalize ledger event visuals, daily ritual outline, and public mint messaging."
  },
  {
    title: "Paris Photo booth execution plan",
    project: "Solienne / Paris Photo",
    priority: "high",
    status: "open",
    notes: "Finalize layout with Nina; LED ticker brief to VTV; print manifestos; coordinate wall paint and power."
  },
  {
    title: "Develop Solienne conversation timeline & documentation wall",
    project: "Solienne / Paris Photo",
    priority: "medium",
    status: "open",
    notes: "Chronological chat excerpts from Kristi + Solienne; design forensic-style layout."
  },
  {
    title: "Coordinate Riso printing with Magma Editions",
    project: "Solienne / Paris Photo",
    priority: "medium",
    status: "open",
    notes: "Confirm print specs and run count (20–30 manifestos × 100 copies each)."
  },
  {
    title: "Confirm Blue Card path and gross→net structure with Expats + GP",
    project: "Residency",
    priority: "high",
    status: "open",
    notes: "Follow up on John Canavan's response and Simon/Alex next steps; validate €80–90k + freelance top-up structure."
  },
  {
    title: "Prepare Kristi freelance artist visa dossier",
    project: "Residency",
    priority: "high",
    status: "open",
    notes: "Portfolio 10–20 pages, 2–3 letters of intent, press references; align with Expats templates."
  },
  {
    title: "Research German/Polish citizenship by descent",
    project: "Residency",
    priority: "medium",
    status: "open",
    notes: "Use mother's 1948 Germany birth certificate; explore Article 116(2) restoration; ask Expats for legal referral."
  },
  {
    title: "Secure furnished 6–12 mo Berlin rental (March arrival)",
    project: "Residency",
    priority: "medium",
    status: "open",
    notes: "Districts Kreuzberg/Neukölln; include pet clause; coordinate timing Dec–Jan search."
  },
  {
    title: "Variant Fund NFT sale hybrid strategy",
    project: "Variant Portfolio",
    priority: "high",
    status: "open",
    notes: "Implement hybrid sell/loan plan per Tom's note; await Benny feedback; coordinate with Gondi on listing flow."
  },
  {
    title: "Sync Gondi listings for Variant portfolio",
    project: "Variant Portfolio",
    priority: "medium",
    status: "open",
    notes: "Group 20 punks into singles/vaults; enable Sell-to-Repay; log loan setup with Zack."
  },
  {
    title: "NODE Artist Relations expansion",
    project: "NODE Artist Relations",
    priority: "medium",
    status: "open",
    notes: "Add more Genesis artists (Asendorf, Holly+Mat); build contact CRM; prep November program update."
  },
  {
    title: "Automate Command Center → Vibecodings sync",
    project: "Command Center / Vibecoding",
    priority: "high",
    status: "open",
    notes: "Activate doc-organizer + vibecode-archivist workflow; verify Friday 9 AM ritual jobs."
  },
  {
    title: "Deploy Command Center to production",
    project: "Command Center / Vibecoding",
    priority: "high",
    status: "done",
    notes: "Vercel deploy with PostgreSQL + Sentry; create health endpoint and validate API contract."
  },
  {
    title: "Integrate Agent @Seth morning briefing",
    project: "Command Center / Vibecoding",
    priority: "medium",
    status: "open",
    notes: "Poll Command Center daily 8:30 AM; generate Top 3 tasks + focus windows + insights."
  },
  {
    title: "Update vibecodings.vercel.app with current projects",
    project: "Command Center / Vibecoding",
    priority: "medium",
    status: "done",
    notes: "Add PARISEYE, lore.club, NFT Brokerage, SOLIENNE Vision 2025; ensure featured project cards match schema."
  },
  {
    title: "Automata / Geppetto roadmap alignment",
    project: "Automata / Geppetto",
    priority: "medium",
    status: "open",
    notes: "Review Lattice PDF; outline next steps before Monday call; confirm exhibition prototypes."
  },
  {
    title: "Bright Moments / BM25 Berlin planning",
    project: "BM / Bright Moments",
    priority: "medium",
    status: "open",
    notes: "Factor Paris Photo into budget; track Coinbase partnership; prep Berlin 2025 press."
  },
  {
    title: "Health: schedule One Medical follow-up",
    project: "Personal — Health",
    priority: "high",
    status: "open",
    notes: "Book labs for cholesterol, testosterone, heart panel; sync with new insurance timeline."
  },
  {
    title: "Health: review healthcare transition (Expats → GP public)",
    project: "Personal — Health",
    priority: "medium",
    status: "open",
    notes: "Confirm TK/AOK estimates and decide before EOR contract."
  },
  {
    title: "Finance: confirm parking fines and bill payments",
    project: "Personal — Finance",
    priority: "medium",
    status: "open",
    notes: "Ensure all outstanding payments processed; archive confirmations."
  },
  {
    title: "Finance: track tax filing progress with Jorstad",
    project: "Personal — Finance",
    priority: "medium",
    status: "open",
    notes: "Follow up with Michael Stites after 2024 submission; upload PDFs to Drive."
  },
  {
    title: "Kristi: support exhibition portfolio + letters of intent",
    project: "Personal — Kristi",
    priority: "medium",
    status: "open",
    notes: "Help finalize layout and reference documents for her freelance visa application."
  },
  {
    title: "Family: organize travel logistics (US → Berlin)",
    project: "Personal — Family",
    priority: "medium",
    status: "open",
    notes: "Storage, flights, cats (rehoming or relocation); ensure February readiness."
  }
];

// ============================================================================
// Project Mapping
// ============================================================================

interface ProjectMapping {
  chatgptName: string;
  commandCenterName: string;
  type: 'eden' | 'vibecoding' | 'automata' | 'personal';
  status: 'active' | 'planning' | 'paused' | 'done';
  color?: string;
  createIfMissing: boolean;
}

const PROJECT_MAPPINGS: ProjectMapping[] = [
  {
    chatgptName: "Abraham",
    commandCenterName: "abraham-media",
    type: "eden",
    status: "active",
    color: "#8B4513",
    createIfMissing: false // Should already exist
  },
  {
    chatgptName: "Solienne / Paris Photo",
    commandCenterName: "SOLIENNE_VISION_2025",
    type: "vibecoding",
    status: "active",
    color: "#FF69B4",
    createIfMissing: false // Should already exist
  },
  {
    chatgptName: "Residency",
    commandCenterName: "residency",
    type: "personal",
    status: "active",
    color: "#4169E1",
    createIfMissing: true
  },
  {
    chatgptName: "Variant Portfolio",
    commandCenterName: "variant-portfolio",
    type: "personal",
    status: "active",
    color: "#9370DB",
    createIfMissing: true
  },
  {
    chatgptName: "NODE Artist Relations",
    commandCenterName: "node-artist-relations",
    type: "eden",
    status: "active",
    color: "#20B2AA",
    createIfMissing: true
  },
  {
    chatgptName: "Command Center / Vibecoding",
    commandCenterName: "seth-command-center",
    type: "vibecoding",
    status: "active",
    color: "#32CD32",
    createIfMissing: false // Should already exist
  },
  {
    chatgptName: "Automata / Geppetto",
    commandCenterName: "automata",
    type: "automata",
    status: "active",
    color: "#FF6347",
    createIfMissing: true
  },
  {
    chatgptName: "BM / Bright Moments",
    commandCenterName: "bright-moments",
    type: "personal",
    status: "active",
    color: "#FFD700",
    createIfMissing: true
  },
  {
    chatgptName: "Personal — Health",
    commandCenterName: "personal-health",
    type: "personal",
    status: "active",
    color: "#DC143C",
    createIfMissing: true
  },
  {
    chatgptName: "Personal — Finance",
    commandCenterName: "personal-finance",
    type: "personal",
    status: "active",
    color: "#228B22",
    createIfMissing: true
  },
  {
    chatgptName: "Personal — Kristi",
    commandCenterName: "personal-kristi",
    type: "personal",
    status: "active",
    color: "#DA70D6",
    createIfMissing: true
  },
  {
    chatgptName: "Personal — Family",
    commandCenterName: "personal-family",
    type: "personal",
    status: "active",
    color: "#FF8C00",
    createIfMissing: true
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

function mapPriority(chatgptPriority: 'high' | 'medium' | 'low'): number {
  switch (chatgptPriority) {
    case 'high': return 1;
    case 'medium': return 2;
    case 'low': return 3;
    default: return 2;
  }
}

function extractTags(notes: string): string {
  const tags: Set<string> = new Set();

  // Extract key terms from notes
  const keywords: string[] = notes.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

  // Filter meaningful keywords (not common words)
  const stopwords = new Set([
    'with', 'before', 'after', 'about', 'into', 'from', 'this', 'that',
    'ensure', 'finalize', 'coordinate', 'confirm', 'follow', 'track',
    'prepare', 'review', 'develop', 'build', 'sync', 'validate'
  ]);

  keywords.forEach(word => {
    if (!stopwords.has(word) && word.length > 4) {
      tags.add(word);
    }
  });

  // Limit to top 5 tags
  return Array.from(tags).slice(0, 5).join(',');
}

function assignEnergy(notes: string, priority: 'high' | 'medium' | 'low'): number {
  const deepWorkKeywords = ['strategy', 'planning', 'roadmap', 'research', 'develop', 'design'];
  const lightWorkKeywords = ['confirm', 'sync', 'track', 'follow up', 'coordinate'];

  const notesLower = notes.toLowerCase();

  if (deepWorkKeywords.some(keyword => notesLower.includes(keyword))) {
    return 1; // Deep work
  } else if (lightWorkKeywords.some(keyword => notesLower.includes(keyword))) {
    return 3; // Light work
  } else {
    return 2; // Normal
  }
}

function getProjectMapping(chatgptProjectName: string): ProjectMapping | undefined {
  return PROJECT_MAPPINGS.find(m => m.chatgptName === chatgptProjectName);
}

// ============================================================================
// Main Import Logic
// ============================================================================

interface ImportStats {
  projectsToCreate: ProjectMapping[];
  tasksToImport: {
    open: number;
    done: number;
    high: number;
    medium: number;
    low: number;
  };
}

async function analyzeImport(): Promise<ImportStats> {
  const stats: ImportStats = {
    projectsToCreate: [],
    tasksToImport: {
      open: 0,
      done: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };

  // Check which projects need to be created
  for (const mapping of PROJECT_MAPPINGS) {
    if (!mapping.createIfMissing) continue;

    const existingProject = await prisma.project.findUnique({
      where: { name: mapping.commandCenterName }
    });

    if (!existingProject) {
      stats.projectsToCreate.push(mapping);
    }
  }

  // Count tasks by status and priority
  for (const task of CHATGPT_TASKS) {
    if (task.status === 'open') stats.tasksToImport.open++;
    if (task.status === 'done') stats.tasksToImport.done++;

    if (task.priority === 'high') stats.tasksToImport.high++;
    if (task.priority === 'medium') stats.tasksToImport.medium++;
    if (task.priority === 'low') stats.tasksToImport.low++;
  }

  return stats;
}

async function executeImport(): Promise<void> {
  console.log('Starting import...\n');

  let projectsCreated = 0;
  let tasksCreated = 0;
  let errors = 0;

  // Step 1: Create missing projects
  for (const mapping of PROJECT_MAPPINGS) {
    if (!mapping.createIfMissing) continue;

    const existingProject = await prisma.project.findUnique({
      where: { name: mapping.commandCenterName }
    });

    if (!existingProject) {
      try {
        await prisma.project.create({
          data: {
            name: mapping.commandCenterName,
            type: mapping.type,
            status: mapping.status,
            color: mapping.color
          }
        });
        console.log(`  ✓ Created project: ${mapping.commandCenterName}`);
        projectsCreated++;
      } catch (error) {
        console.error(`  ✗ Failed to create project ${mapping.commandCenterName}:`, error);
        errors++;
      }
    }
  }

  console.log();

  // Step 2: Import tasks
  for (const task of CHATGPT_TASKS) {
    const mapping = getProjectMapping(task.project);
    if (!mapping) {
      console.error(`  ✗ No mapping found for project: ${task.project}`);
      errors++;
      continue;
    }

    try {
      const project = await prisma.project.findUnique({
        where: { name: mapping.commandCenterName }
      });

      if (!project) {
        console.error(`  ✗ Project not found: ${mapping.commandCenterName}`);
        errors++;
        continue;
      }

      await prisma.task.create({
        data: {
          projectId: project.id,
          title: task.title,
          notes: task.notes,
          priority: mapPriority(task.priority),
          status: task.status,
          source: 'chatgpt-import',
          tags: extractTags(task.notes),
          energy: assignEnergy(task.notes, task.priority)
        }
      });

      const emoji = task.status === 'done' ? '✓' : '○';
      console.log(`  ${emoji} ${task.title}`);
      tasksCreated++;
    } catch (error) {
      console.error(`  ✗ Failed to import task "${task.title}":`, error);
      errors++;
    }
  }

  console.log();
  console.log('═'.repeat(60));
  console.log('Import Summary:');
  console.log(`  Projects created: ${projectsCreated}`);
  console.log(`  Tasks imported: ${tasksCreated}`);
  console.log(`  Errors: ${errors}`);
  console.log('═'.repeat(60));
}

async function printPreview(stats: ImportStats): Promise<void> {
  console.log('═'.repeat(60));
  console.log('IMPORT PREVIEW (Dry Run)');
  console.log('═'.repeat(60));
  console.log();

  // Projects to create
  if (stats.projectsToCreate.length > 0) {
    console.log(`Projects to create (${stats.projectsToCreate.length}):`);
    for (const project of stats.projectsToCreate) {
      console.log(`  • ${project.commandCenterName} (${project.type})`);
    }
    console.log();
  } else {
    console.log('Projects to create: None (all exist)');
    console.log();
  }

  // Tasks to import
  console.log(`Tasks to import (${CHATGPT_TASKS.length} total):`);
  console.log(`  Status:`);
  console.log(`    - Open: ${stats.tasksToImport.open}`);
  console.log(`    - Done: ${stats.tasksToImport.done}`);
  console.log();
  console.log(`  Priority:`);
  console.log(`    - High: ${stats.tasksToImport.high}`);
  console.log(`    - Medium: ${stats.tasksToImport.medium}`);
  console.log(`    - Low: ${stats.tasksToImport.low}`);
  console.log();

  // Task breakdown by project
  console.log('Tasks by project:');
  const tasksByProject = new Map<string, number>();
  for (const task of CHATGPT_TASKS) {
    const count = tasksByProject.get(task.project) || 0;
    tasksByProject.set(task.project, count + 1);
  }

  for (const [project, count] of tasksByProject.entries()) {
    const mapping = getProjectMapping(project);
    const targetName = mapping?.commandCenterName || 'UNMAPPED';
    console.log(`  • ${project} → ${targetName}: ${count} tasks`);
  }
  console.log();

  console.log('═'.repeat(60));
  console.log('Run with --execute to perform the import');
  console.log('═'.repeat(60));
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('ChatGPT Task Import Script');
  console.log('Database:', process.env.STORAGE_PRISMA_DATABASE_URL ? 'Connected' : 'Using default');
  console.log();

  const isDryRun = !process.argv.includes('--execute');

  try {
    const stats = await analyzeImport();

    if (isDryRun) {
      await printPreview(stats);
    } else {
      console.log('═'.repeat(60));
      console.log('EXECUTING IMPORT');
      console.log('═'.repeat(60));
      console.log();
      await executeImport();
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
