# Agent System Integration

Complete guide to the Seth Intelligence Platform agent system and its integration with Command Center.

## Overview

The agent system provides a coordinated network of specialized AI agents, each with distinct roles, capabilities, and triggers. The Command Center acts as the central hub for agent coordination, monitoring, and invocation tracking.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Seth Command Center                     │
│  ┌───────────────────────────────────────────┐  │
│  │   Agent System Integration                │  │
│  │   - Configuration (agents.yaml)           │  │
│  │   - CLI Tools (cc-agents.sh)              │  │
│  │   - TypeScript Utilities (agents.ts)      │  │
│  │   - Health Monitoring (sync-health.ts)    │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
    Configuration              Invocation Tracking
  (config/agents.yaml)        (Future: Audit Logs)
          │                           │
          └─────────────┬─────────────┘
                        │
         ┌──────────────┴──────────────┐
         │       8 Active Agents       │
         │                             │
         │  @seth (Priority 1)         │
         │  design-guardian            │
         │  mobile-first-builder       │
         │  vercel-deployer            │
         │  data-curator               │
         │  vibecode-archivist         │
         │  doc-organizer              │
         │  code-reviewer              │
         └─────────────────────────────┘
```

## Agent Registry

### Priority 1: Ecosystem Coordination
- **@seth** 🧠 - Personal Operating System & Ecosystem Coordinator
  - Cross-agent coordination and orchestration
  - Project planning and architecture design
  - Strategic roadmap development

### Priority 2: Core Functionality
- **design-guardian** 🎨 - Unified Design System Enforcer
  - Swiss design principles enforcement
  - Typography and color system management

- **mobile-first-builder** 📱 - Single-File Progressive Web App Builder
  - Mobile-first responsive design
  - Single-file HTML applications

- **data-curator** 📊 - Large Dataset & Manifest Manager
  - JSON manifest generation
  - Data normalization and cleaning

### Priority 3: Supporting Tasks
- **vercel-deployer** 🚀 - Deployment & Production Management
  - Vercel deployment operations
  - Domain and environment management

- **vibecode-archivist** 🗂️ - Portfolio & Project Curator
  - Project inventory management
  - Portfolio generation

- **code-reviewer** 🔍 - Code Quality & Best Practices Enforcer
  - Code quality audits
  - Performance optimization

### Priority 4: Maintenance
- **doc-organizer** 📁 - File Structure & Documentation Manager
  - Directory structure design
  - Documentation consistency

## Using the CLI Tool

### Installation

The `cc-agents` CLI is installed in `/Users/seth/scripts/cc-agents.sh` and should be accessible from your PATH.

```bash
# Verify installation
which cc-agents

# Or use directly
/Users/seth/scripts/cc-agents.sh
```

### Commands

#### List All Agents
```bash
cc-agents list
```

Output:
```
Seth Intelligence Platform - Agent Registry
════════════════════════════════════════════════════

Priority 1: Critical - Ecosystem Coordination
  ● 🧠  @seth
     Personal Operating System & Ecosystem Coordinator

Priority 2: High - Core Functionality
  ● 🎨  design-guardian
     Unified Design System Enforcer
  ● 📱  mobile-first-builder
     Single-File Progressive Web App Builder
  ...

Total: 8 agents
Active: 8
Inactive: 0
```

#### Suggest Agent for Task
```bash
cc-agents suggest "deploy PARISEYE to production"
```

Output:
```
Agent Suggestions for: "deploy PARISEYE to production"
════════════════════════════════════════════════════

1. 🚀 vercel-deployer
   Confidence: 85%
   Reason: Matches triggers: deploy, production, vercel
   Role: Deployment & Production Management

2. 📱 mobile-first-builder
   Confidence: 42%
   Reason: Matches capabilities related to the task
   Role: Single-File Progressive Web App Builder

💡 Tip: Use 'cc-agents status vercel-deployer' for details
```

#### Show Agent Details
```bash
cc-agents status @seth
cc-agents status design-guardian
```

Output:
```
Agent Details: @seth
════════════════════════════════════════════════════

🧠 @seth
Personal Operating System & Ecosystem Coordinator

Status: active
Priority: 1

Triggers:
  coordinate, orchestrate, plan project, architecture, system design...

Capabilities:
  • Cross-agent coordination and orchestration
  • Project planning and architecture design
  • Ecosystem-wide decision making
  • Context management across projects
  • Strategic roadmap development

Tools:
  • All tools (meta-agent with full access)
  • Agent delegation system
  • Project context switching
  ...

Integration:
  Command Center: Primary coordinator - receives all high-level tasks
  Handoff Pattern: Delegates to specialized agents after initial planning

Example Tasks:
  • "Plan the architecture for PARISEYE v2"
  • "Coordinate deployment of SOLIENNE and vibecodings"
  • "What's the status of all active projects?"
```

#### Show Agent Metrics
```bash
# All agent statistics
cc-agents metrics

# Specific agent metrics (future: with audit data)
cc-agents metrics @seth
```

Output:
```
Agent Usage Metrics
════════════════════════════════════════════════════

Total Agents: 8
Active: 8
Inactive: 0

Agents by Priority:
  Priority 1 (Critical): 1 agents
  Priority 2 (High): 3 agents
  Priority 3 (Medium): 3 agents
  Priority 4 (Low): 1 agents

⚠️  Note: Usage tracking will be available when audit system is implemented
```

#### Show Coordination Patterns
```bash
cc-agents patterns
```

Output:
```
Agent Coordination Patterns
════════════════════════════════════════════════════

full_deployment:
  1. @seth: Plan and coordinate
  2. data-curator: Prepare datasets
  3. mobile-first-builder: Build interface
  4. design-guardian: Review design
  5. code-reviewer: Audit code
  6. vercel-deployer: Deploy to production

portfolio_update:
  1. vibecode-archivist: Scan projects
  2. data-curator: Generate manifest
  3. mobile-first-builder: Build portfolio page
  4. vercel-deployer: Deploy
  ...
```

## TypeScript API

### Import the Module

```typescript
import {
  loadAgents,
  getAgent,
  getActiveAgents,
  suggestAgent,
  getAgentMetrics,
  logAgentInvocation
} from '@/lib/agents';
```

### Load Configuration

```typescript
// Load all agents from agents.yaml
const config = await loadAgents();

// Get specific agent
const seth = await getAgent('@seth');

// Get all active agents
const activeAgents = await getActiveAgents();
```

### Suggest Agents for Tasks

```typescript
const suggestions = await suggestAgent('build a mobile gallery');

suggestions.forEach(s => {
  console.log(`${s.agent.name}: ${s.confidence}%`);
  console.log(`Reason: ${s.reason}`);
});
```

### Track Usage (Future)

```typescript
// Log agent invocation
await logAgentInvocation('@seth', 'plan architecture', {
  project: 'PARISEYE',
  duration: 300
});

// Get agent metrics
const metrics = await getAgentMetrics('@seth');
console.log(`Total invocations: ${metrics.totalInvocations}`);
```

### Get Statistics

```typescript
const stats = await getAgentStats();
console.log(`Active agents: ${stats.activeAgents}`);
console.log(`Total agents: ${stats.totalAgents}`);
```

## Agent Invocation Patterns in Claude Code

### Pattern 1: Direct Agent Reference

In Claude Code prompts, reference agents directly:

```
@seth - Plan the deployment strategy for Q4

design-guardian - Review the PARISEYE color palette

mobile-first-builder - Build a gallery for SOLIENNE dataset
```

### Pattern 2: Task-Based Delegation

Let Claude Code suggest the appropriate agent:

```bash
cc-agents suggest "optimize image loading in SOLIENNE"
# Returns: mobile-first-builder (92% confidence)

# Then invoke in Claude Code:
# "mobile-first-builder - Optimize image loading in SOLIENNE browser"
```

### Pattern 3: Coordination Workflows

Use predefined coordination patterns:

```bash
cc-agents patterns
# Shows: full_deployment workflow

# Then in Claude Code:
# "@seth - Execute full_deployment pattern for PARISEYE v2"
```

## Health Monitoring

The agent system is integrated into the Command Center health monitoring:

### Sync Script

```bash
cd /Users/seth/seth-command-center
npm run sync:health
```

Health report includes:
```json
{
  "timestamp": "2025-10-11T19:00:00Z",
  "projects": [...],
  "agents": {
    "totalAgents": 8,
    "activeAgents": 8,
    "coordinatorStatus": "active"
  }
}
```

### Health Dashboard

View agent status in Command Center dashboard:
- Active agent count
- Coordinator status (@seth)
- Recent agent invocations (future)

## Configuration

### agents.yaml Structure

```yaml
agents:
  - name: "agent-name"
    emoji: "🎨"
    role: "Agent Role"
    status: active  # or inactive, deprecated
    priority: 1     # 1-4 (1 = highest)
    triggers:
      - "trigger word"
      - "another trigger"
    capabilities:
      - "What this agent can do"
    tools:
      - "Tools available"
    integration:
      command_center: "How it integrates"
      handoff_pattern: "When to delegate"
      context_awareness: "Context handling"
    examples:
      - "Example task"

coordination_patterns:
  pattern_name:
    - "Step 1"
    - "Step 2"

settings:
  default_handoff_timeout: 300
  context_retention: 7
  priority_levels:
    1: "Critical - ecosystem coordination"
    2: "High - core functionality"
    3: "Medium - supporting tasks"
    4: "Low - maintenance and cleanup"
```

## Future Enhancements

### Audit Log Tracking

When implemented, the audit system will track:
- Agent invocations with timestamps
- Task descriptions and outcomes
- Duration and success rates
- Usage patterns and trends

Database schema (planned):
```sql
CREATE TABLE agent_invocations (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(255) NOT NULL,
  task_description TEXT NOT NULL,
  invoked_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(50),
  metadata JSONB
);
```

### API Endpoints

Planned REST API:
```
GET  /api/agents              - List all agents
GET  /api/agents/:name        - Get agent details
POST /api/agents/suggest      - Suggest agent for task
GET  /api/agents/:name/metrics - Get agent metrics
POST /api/agents/:name/invoke  - Log invocation
```

### Dashboard Integration

Future dashboard features:
- Agent activity timeline
- Coordination pattern visualizations
- Usage heatmaps by time/day
- Agent performance metrics
- Delegation flow diagrams

## Examples

### Example 1: Building a New Feature

```bash
# Step 1: Find right agent
cc-agents suggest "build responsive photo gallery"
# Suggests: mobile-first-builder (88%)

# Step 2: Get agent details
cc-agents status mobile-first-builder

# Step 3: Invoke in Claude Code
# "mobile-first-builder - Build responsive photo gallery for project X"
```

### Example 2: Deployment Workflow

```bash
# Step 1: Check coordination pattern
cc-agents patterns
# Review: full_deployment workflow

# Step 2: Coordinate with @seth
# In Claude Code: "@seth - Execute full_deployment for PARISEYE"

# Step 3: @seth delegates to:
# - design-guardian (review)
# - code-reviewer (audit)
# - vercel-deployer (deploy)
```

### Example 3: Monitoring Agent Health

```bash
# Check all agents
cc-agents list

# Check coordinator
cc-agents status @seth

# View metrics
cc-agents metrics

# Sync to Command Center
cd /Users/seth/seth-command-center
npm run sync:health
```

## Troubleshooting

### CLI not found
```bash
# Check PATH
echo $PATH

# Add scripts to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="/Users/seth/scripts:$PATH"

# Or use full path
/Users/seth/scripts/cc-agents.sh list
```

### YAML parsing errors
```bash
# Verify YAML is valid
cd /Users/seth/seth-command-center
npx tsx -e "import yaml from 'yaml'; import fs from 'fs'; console.log(yaml.parse(fs.readFileSync('config/agents.yaml', 'utf-8')));"
```

### TypeScript import errors
```bash
# Ensure dependencies installed
cd /Users/seth/seth-command-center
npm install

# Check TypeScript compilation
npx tsc --noEmit
```

## Best Practices

### 1. Agent Selection
- Use `cc-agents suggest` for task-specific recommendations
- Consider agent priority for time-sensitive tasks
- Check agent capabilities before delegation

### 2. Task Descriptions
- Be specific: "deploy PARISEYE" vs "deploy"
- Include context: "review design system for mobile"
- Use agent triggers when possible

### 3. Coordination
- Use @seth for multi-agent workflows
- Follow coordination patterns for complex tasks
- Track delegations for accountability

### 4. Monitoring
- Regular health checks with `cc-agents metrics`
- Monitor coordinator status (@seth)
- Review agent activity in dashboard

## Resources

- **Configuration**: `/Users/seth/seth-command-center/config/agents.yaml`
- **CLI Tool**: `/Users/seth/scripts/cc-agents.sh`
- **TypeScript API**: `/Users/seth/seth-command-center/src/lib/agents.ts`
- **Health Script**: `/Users/seth/seth-command-center/scripts/sync-health.ts`
- **Documentation**: This file

## Support

For issues or questions:
1. Check agent configuration: `cc-agents list`
2. Review agent status: `cc-agents status <name>`
3. Verify CLI functionality: `cc-agents --help`
4. Check Command Center health: `cc-status`

---

*Agent System v1.0.0 - Integrated with Seth Command Center*
*Last Updated: 2025-10-11*
