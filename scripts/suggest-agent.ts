#!/usr/bin/env ts-node

/**
 * Seth Command Center - Agent Suggestion System
 *
 * Analyzes task descriptions and recommends which agent(s) to use
 * based on keyword matching from agents.yaml registry.
 *
 * Usage:
 *   ./suggest-agent.ts "build a gallery for SOLIENNE"
 *   npm run suggest-agent "deploy to production"
 *
 * Can also be imported as a module:
 *   import { suggestAgents } from './suggest-agent';
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Types
interface Agent {
  name: string;
  emoji: string;
  role: string;
  status: string;
  priority: number;
  triggers: string[];
  capabilities: string[];
  tools: string[];
  integration: {
    command_center: string;
    handoff_pattern: string;
    context_awareness: string;
  };
  examples?: string[];
}

interface AgentMatch {
  agent: Agent;
  score: number;
  matchedTriggers: string[];
}

interface AgentRegistry {
  agents: Agent[];
  coordination_patterns?: Record<string, string[]>;
  settings?: Record<string, any>;
}

// Configuration
const AGENTS_YAML_PATH = path.join(__dirname, '../config/agents.yaml');
const MIN_SCORE_THRESHOLD = 1; // Minimum score to suggest an agent
const MAX_SUGGESTIONS = 3; // Maximum number of agents to suggest

/**
 * Load agent registry from YAML file
 */
function loadAgentRegistry(): AgentRegistry {
  try {
    const fileContent = fs.readFileSync(AGENTS_YAML_PATH, 'utf8');
    return yaml.parse(fileContent);
  } catch (error) {
    console.error(`Error loading agent registry from ${AGENTS_YAML_PATH}:`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Calculate match score between task and agent triggers
 */
function calculateScore(task: string, triggers: string[]): { score: number; matched: string[] } {
  const taskLower = task.toLowerCase();
  const matched: string[] = [];
  let score = 0;

  for (const trigger of triggers) {
    const triggerLower = trigger.toLowerCase();

    // Exact word match (higher score)
    const wordRegex = new RegExp(`\\b${triggerLower}\\b`, 'i');
    if (wordRegex.test(taskLower)) {
      score += 3;
      matched.push(trigger);
    }
    // Partial match (lower score)
    else if (taskLower.includes(triggerLower)) {
      score += 1;
      matched.push(trigger);
    }
  }

  return { score, matched };
}

/**
 * Find agents that match the task description
 */
export function suggestAgents(task: string): AgentMatch[] {
  const registry = loadAgentRegistry();
  const matches: AgentMatch[] = [];

  // Only consider active agents
  const activeAgents = registry.agents.filter(agent => agent.status === 'active');

  for (const agent of activeAgents) {
    const { score, matched } = calculateScore(task, agent.triggers);

    if (score >= MIN_SCORE_THRESHOLD) {
      matches.push({
        agent,
        score,
        matchedTriggers: matched
      });
    }
  }

  // Sort by score (descending), then by priority (ascending)
  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.agent.priority - b.agent.priority;
  });

  return matches.slice(0, MAX_SUGGESTIONS);
}

/**
 * Find coordination pattern that matches the task
 */
function suggestCoordinationPattern(task: string): { name: string; steps: string[] } | null {
  const registry = loadAgentRegistry();

  if (!registry.coordination_patterns) {
    return null;
  }

  const taskLower = task.toLowerCase();

  // Check for pattern keywords
  for (const [patternName, steps] of Object.entries(registry.coordination_patterns)) {
    const patternKeywords = patternName.toLowerCase().split('_');
    const matchCount = patternKeywords.filter(keyword => taskLower.includes(keyword)).length;

    if (matchCount >= patternKeywords.length / 2) {
      return { name: patternName, steps };
    }
  }

  return null;
}

/**
 * Format and display agent suggestions
 */
function displaySuggestions(task: string, matches: AgentMatch[]): void {
  console.log('\n===========================================');
  console.log('Seth Command Center - Agent Suggestions');
  console.log('===========================================\n');

  console.log(`Task: "${task}"\n`);

  if (matches.length === 0) {
    console.log('No matching agents found. Try @seth for general coordination.\n');
    console.log('Tip: Use keywords like "deploy", "design", "build", "data", etc.');
    return;
  }

  console.log(`Found ${matches.length} matching agent${matches.length > 1 ? 's' : ''}:\n`);

  matches.forEach((match, index) => {
    const { agent, score, matchedTriggers } = match;

    console.log(`${index + 1}. ${agent.emoji} ${agent.name}`);
    console.log(`   Role: ${agent.role}`);
    console.log(`   Match Score: ${score}`);
    console.log(`   Matched Keywords: ${matchedTriggers.join(', ')}`);
    console.log(`   Priority Level: ${agent.priority}`);

    if (agent.examples && agent.examples.length > 0) {
      console.log(`   Example: "${agent.examples[0]}"`);
    }

    console.log();
  });

  // Check for coordination patterns
  const pattern = suggestCoordinationPattern(task);
  if (pattern) {
    console.log('-------------------------------------------');
    console.log('Suggested Coordination Pattern:');
    console.log(`Pattern: ${pattern.name.replace(/_/g, ' ')}`);
    console.log('\nWorkflow:');
    pattern.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    console.log();
  }

  // Provide invocation examples
  console.log('-------------------------------------------');
  console.log('How to Invoke:\n');

  if (matches.length === 1) {
    console.log(`Direct: ${matches[0].agent.name} ${task}`);
  } else if (matches.length > 1) {
    console.log(`Option 1: ${matches[0].agent.name} ${task}`);
    console.log(`Option 2: @seth coordinate - ${task}`);
  }

  console.log('\n===========================================\n');
}

/**
 * Export agent capabilities for a given agent name
 */
export function getAgentCapabilities(agentName: string): Agent | null {
  const registry = loadAgentRegistry();
  return registry.agents.find(agent => agent.name === agentName) || null;
}

/**
 * List all active agents
 */
export function listActiveAgents(): Agent[] {
  const registry = loadAgentRegistry();
  return registry.agents.filter(agent => agent.status === 'active');
}

/**
 * CLI interface
 */
function main(): void {
  const args = process.argv.slice(2);

  // Handle special commands
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('\nSeth Command Center - Agent Suggestion System\n');
    console.log('Usage:');
    console.log('  ./suggest-agent.ts "your task description"');
    console.log('  npm run suggest-agent "your task description"\n');
    console.log('Commands:');
    console.log('  --list, -l       List all active agents');
    console.log('  --agent [name]   Show details for specific agent');
    console.log('  --help, -h       Show this help message\n');
    console.log('Examples:');
    console.log('  ./suggest-agent.ts "build a mobile gallery"');
    console.log('  ./suggest-agent.ts "deploy to production"');
    console.log('  ./suggest-agent.ts --list');
    console.log('  ./suggest-agent.ts --agent mobile-first-builder\n');
    return;
  }

  if (args[0] === '--list' || args[0] === '-l') {
    const agents = listActiveAgents();
    console.log('\nActive Agents:\n');
    agents.forEach(agent => {
      console.log(`${agent.emoji} ${agent.name}`);
      console.log(`  ${agent.role}`);
      console.log(`  Priority: ${agent.priority}`);
      console.log();
    });
    return;
  }

  if (args[0] === '--agent' && args[1]) {
    const agent = getAgentCapabilities(args[1]);
    if (!agent) {
      console.error(`\nAgent "${args[1]}" not found.\n`);
      process.exit(1);
    }

    console.log(`\n${agent.emoji} ${agent.name}`);
    console.log('===========================================\n');
    console.log(`Role: ${agent.role}`);
    console.log(`Status: ${agent.status}`);
    console.log(`Priority: ${agent.priority}\n`);
    console.log('Capabilities:');
    agent.capabilities.forEach(cap => console.log(`  - ${cap}`));
    console.log('\nTrigger Keywords:');
    console.log(`  ${agent.triggers.join(', ')}`);

    if (agent.examples && agent.examples.length > 0) {
      console.log('\nExamples:');
      agent.examples.forEach(ex => console.log(`  "${ex}"`));
    }
    console.log();
    return;
  }

  // Main functionality: suggest agents for task
  const task = args.join(' ');
  const matches = suggestAgents(task);
  displaySuggestions(task, matches);
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}
