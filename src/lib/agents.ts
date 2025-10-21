/**
 * Agent System Integration for Seth Command Center
 *
 * Provides utilities for:
 * - Loading agent configuration from YAML
 * - Suggesting agents for tasks
 * - Tracking agent usage metrics
 * - Generating agent statistics
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'yaml';

export interface AgentTrigger {
  triggers: string[];
}

export interface Agent {
  name: string;
  emoji: string;
  role: string;
  status: 'active' | 'inactive' | 'deprecated';
  priority: number;
  triggers: string[];
  capabilities: string[];
  tools: string[];
  integration: {
    command_center: string;
    handoff_pattern: string;
    context_awareness: string;
  };
  examples: string[];
  // Optional fields for specific agent types
  design_system?: any;
  patterns?: any;
  data_patterns?: any;
  categorization_rules?: any;
  structure_patterns?: any;
  review_focus?: any;
  deployment_patterns?: any;
}

export interface AgentConfig {
  agents: Agent[];
  coordination_patterns: Record<string, string[]>;
  settings: {
    default_handoff_timeout: number;
    context_retention: number;
    priority_levels: Record<number, string>;
  };
}

export interface AgentSuggestion {
  agent: Agent;
  confidence: number;
  reason: string;
  matchedTriggers: string[];
}

export interface AgentMetrics {
  agentName: string;
  totalInvocations: number;
  lastInvoked: string | null;
  averageTaskDuration: number | null;
  successRate: number;
  topTasks: { task: string; count: number }[];
}

const AGENTS_CONFIG_PATH = join(process.cwd(), 'config', 'agents.yaml');
const COMMAND_CENTER_ROOT = process.env.COMMAND_CENTER_ROOT || '/Users/seth/seth-command-center';

/**
 * Load agents from YAML configuration
 */
export async function loadAgents(): Promise<AgentConfig> {
  try {
    const configPath = join(COMMAND_CENTER_ROOT, 'config', 'agents.yaml');
    const fileContents = await readFile(configPath, 'utf-8');
    const config = yaml.parse(fileContents) as AgentConfig;
    return config;
  } catch (error) {
    console.error('Error loading agents config:', error);
    throw new Error(`Failed to load agents configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific agent by name
 */
export async function getAgent(name: string): Promise<Agent | null> {
  const config = await loadAgents();
  return config.agents.find(agent => agent.name === name) || null;
}

/**
 * Get all active agents
 */
export async function getActiveAgents(): Promise<Agent[]> {
  const config = await loadAgents();
  return config.agents.filter(agent => agent.status === 'active');
}

/**
 * Suggest agents for a task description
 * Uses trigger matching and semantic analysis
 */
export async function suggestAgent(taskDescription: string): Promise<AgentSuggestion[]> {
  const config = await loadAgents();
  const lowerTask = taskDescription.toLowerCase();
  const suggestions: AgentSuggestion[] = [];

  for (const agent of config.agents) {
    if (agent.status !== 'active') continue;

    const matchedTriggers: string[] = [];
    let triggerScore = 0;

    // Check trigger matches
    for (const trigger of agent.triggers) {
      if (lowerTask.includes(trigger.toLowerCase())) {
        matchedTriggers.push(trigger);
        triggerScore += 1;
      }
    }

    // Check capability matches (lower weight)
    let capabilityScore = 0;
    for (const capability of agent.capabilities) {
      const capabilityWords = capability.toLowerCase().split(' ');
      for (const word of capabilityWords) {
        if (word.length > 4 && lowerTask.includes(word)) {
          capabilityScore += 0.3;
        }
      }
    }

    const totalScore = triggerScore + capabilityScore;

    if (totalScore > 0) {
      // Calculate confidence (0-100)
      const confidence = Math.min(100, Math.round((totalScore / agent.triggers.length) * 100));

      // Generate reason
      let reason = '';
      if (matchedTriggers.length > 0) {
        reason = `Matches triggers: ${matchedTriggers.join(', ')}`;
      } else {
        reason = `Matches capabilities related to the task`;
      }

      suggestions.push({
        agent,
        confidence,
        reason,
        matchedTriggers
      });
    }
  }

  // Sort by confidence (descending) then priority (ascending)
  suggestions.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return a.agent.priority - b.agent.priority;
  });

  return suggestions;
}

/**
 * Get agent usage metrics from audit logs
 * Note: This is a placeholder - actual implementation depends on audit log structure
 */
export async function getAgentMetrics(agentName: string): Promise<AgentMetrics | null> {
  // TODO: Implement actual audit log parsing when audit system is in place
  // For now, return mock data structure

  return {
    agentName,
    totalInvocations: 0,
    lastInvoked: null,
    averageTaskDuration: null,
    successRate: 0,
    topTasks: []
  };
}

/**
 * Get metrics for all agents
 */
export async function getAllAgentMetrics(): Promise<Record<string, AgentMetrics>> {
  const config = await loadAgents();
  const metrics: Record<string, AgentMetrics> = {};

  for (const agent of config.agents) {
    const agentMetrics = await getAgentMetrics(agent.name);
    if (agentMetrics) {
      metrics[agent.name] = agentMetrics;
    }
  }

  return metrics;
}

/**
 * Log agent invocation (for future audit tracking)
 * This would integrate with your audit system when available
 */
export async function logAgentInvocation(
  agentName: string,
  task: string,
  metadata?: Record<string, any>
): Promise<void> {
  // TODO: Implement actual audit logging
  // For now, just console log for development
  console.log(`[Agent Invocation] ${agentName}: ${task}`, metadata);
}

/**
 * Get coordination pattern for a workflow type
 */
export async function getCoordinationPattern(patternName: string): Promise<string[] | null> {
  const config = await loadAgents();
  return config.coordination_patterns[patternName] || null;
}

/**
 * Get agent statistics summary
 */
export async function getAgentStats(): Promise<{
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  agentsByPriority: Record<number, number>;
}> {
  const config = await loadAgents();

  const totalAgents = config.agents.length;
  const activeAgents = config.agents.filter(a => a.status === 'active').length;
  const inactiveAgents = config.agents.filter(a => a.status !== 'active').length;

  const agentsByPriority: Record<number, number> = {};
  for (const agent of config.agents) {
    agentsByPriority[agent.priority] = (agentsByPriority[agent.priority] || 0) + 1;
  }

  return {
    totalAgents,
    activeAgents,
    inactiveAgents,
    agentsByPriority
  };
}

/**
 * Format agent for CLI display
 */
export function formatAgentForCLI(agent: Agent, verbose: boolean = false): string {
  const status = agent.status === 'active' ? '✓' : '✗';
  let output = `${agent.emoji} ${status} ${agent.name} - ${agent.role}`;

  if (verbose) {
    output += `\n  Priority: ${agent.priority}`;
    output += `\n  Status: ${agent.status}`;
    output += `\n  Triggers: ${agent.triggers.slice(0, 5).join(', ')}${agent.triggers.length > 5 ? '...' : ''}`;
    output += `\n  Capabilities: ${agent.capabilities.length} defined`;
    output += `\n  Integration: ${agent.integration.command_center}`;
  }

  return output;
}
