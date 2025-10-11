// Add real projects to Seth Command Center
// Run with: npx tsx scripts/add-real-projects.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const realProjects = [
  {
    name: 'NODE Artist Relations',
    type: 'personal',
    status: 'active',
    color: '#E74C3C' // Red-orange - CRM for galleries/exhibitions
  },
  {
    name: 'Paris Photo',
    type: 'eden',
    status: 'active',
    color: '#9B59B6' // Purple - voting app
  },
  {
    name: 'Spirit Discovery',
    type: 'eden',
    status: 'active',
    color: '#3498DB' // Blue - personality analysis
  },
  {
    name: 'MIYOMI',
    type: 'eden',
    status: 'active',
    color: '#F39C12' // Orange - prediction market AI
  },
  {
    name: 'Eden Academy',
    type: 'eden',
    status: 'active',
    color: '#2ECC71' // Green - 10 Genesis agents
  },
  {
    name: 'Eden Registry',
    type: 'eden',
    status: 'active',
    color: '#1ABC9C' // Teal - system of record
  },
  {
    name: 'SOLIENNE',
    type: 'eden',
    status: 'active',
    color: '#E67E22' // Dark orange - consciousness browser
  },
  {
    name: 'Abraham',
    type: 'eden',
    status: 'active',
    color: '#C0392B' // Dark red - collective intelligence
  },
  {
    name: 'Variant Portfolio',
    type: 'personal',
    status: 'active',
    color: '#8E44AD' // Dark purple - NFT brokerage
  },
  {
    name: 'Residency',
    type: 'personal',
    status: 'active',
    color: '#16A085' // Dark teal - Berlin relocation
  }
];

async function addProjects() {
  console.log('🏗️  Adding real projects to Seth Command Center...\n');

  for (const project of realProjects) {
    try {
      const existing = await prisma.project.findUnique({
        where: { name: project.name }
      });

      if (existing) {
        console.log(`⏭️  ${project.name} (already exists)`);
        continue;
      }

      await prisma.project.create({
        data: project
      });

      console.log(`✅ ${project.name} (${project.type})`);
    } catch (error) {
      console.error(`❌ ${project.name}: ${error.message}`);
    }
  }

  await prisma.$disconnect();

  console.log('\n📊 Current Projects:');
  const allProjects = await prisma.project.findMany({
    orderBy: { name: 'asc' }
  });

  for (const p of allProjects) {
    console.log(`   ${p.name} (${p.type}) - ${p.status}`);
  }

  console.log('\n🎉 Projects added! You can now assign tasks to these real projects.');
}

addProjects();
