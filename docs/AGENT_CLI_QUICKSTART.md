# Agent CLI Quick Start

Fast reference for using the `cc-agents` command line tool.

## Installation Check

```bash
# Verify cc-agents is available
which cc-agents
# or
/Users/seth/scripts/cc-agents.sh --help
```

## Core Commands

### 1. List All Agents

```bash
cc-agents list
```

Shows all 8 agents grouped by priority:
- Priority 1: @seth (ecosystem coordinator)
- Priority 2: design-guardian, mobile-first-builder, data-curator
- Priority 3: vercel-deployer, vibecode-archivist, code-reviewer
- Priority 4: doc-organizer

### 2. Suggest Agent for Task

```bash
cc-agents suggest "your task description"
```

**Examples:**
```bash
cc-agents suggest "deploy PARISEYE to production"
# → vercel-deployer (85%)

cc-agents suggest "build mobile interface"
# → mobile-first-builder (88%)

cc-agents suggest "review design system"
# → design-guardian (92%)

cc-agents suggest "normalize JSON dataset"
# → data-curator (79%)
```

### 3. Agent Details

```bash
cc-agents status <agent-name>
```

**Examples:**
```bash
cc-agents status @seth
cc-agents status design-guardian
cc-agents status vercel-deployer
```

Shows:
- Full role description
- Priority and status
- Trigger keywords
- Capabilities list
- Available tools
- Integration patterns
- Example tasks

### 4. Usage Metrics

```bash
# All agents overview
cc-agents metrics

# Specific agent (future: with audit data)
cc-agents metrics @seth
```

### 5. Coordination Patterns

```bash
cc-agents patterns
```

Shows workflows like:
- `full_deployment` - Complete deployment pipeline
- `portfolio_update` - Update portfolio site
- `design_system_update` - Rollout design changes
- `data_pipeline` - Data processing workflow

## Common Workflows

### Deploy a Project

```bash
# Step 1: Find deployment agent
cc-agents suggest "deploy to production"

# Step 2: Check vercel-deployer details
cc-agents status vercel-deployer

# Step 3: In Claude Code
# "vercel-deployer - Deploy PARISEYE to production"
```

### Build New Feature

```bash
# Step 1: Coordinate with @seth
# In Claude Code: "@seth - Plan mobile gallery feature for SOLIENNE"

# Step 2: @seth delegates to:
# - design-guardian (UI design)
# - mobile-first-builder (implementation)
# - code-reviewer (quality check)
# - vercel-deployer (deployment)
```

### Design Review

```bash
# Check design-guardian capabilities
cc-agents status design-guardian

# In Claude Code
# "design-guardian - Review PARISEYE color palette and typography"
```

## Integration with Command Center

Agent metrics are included in health monitoring:

```bash
# Sync health data (includes agent stats)
cd /Users/seth/seth-command-center
npm run sync:health
```

Health report includes:
- Total agents: 8
- Active agents: 8
- Coordinator status: active

## Quick Reference

| Command | Purpose |
|---------|---------|
| `cc-agents list` | Show all agents |
| `cc-agents suggest "<task>"` | Find right agent |
| `cc-agents status <name>` | Agent details |
| `cc-agents metrics` | Usage statistics |
| `cc-agents patterns` | Coordination workflows |

## Agent Priority Guide

**Priority 1 - Critical:**
- `@seth` - Use for project planning, coordination, architecture

**Priority 2 - High:**
- `design-guardian` - Design system, typography, colors
- `mobile-first-builder` - Build interfaces, PWAs, galleries
- `data-curator` - JSON manifests, data normalization

**Priority 3 - Medium:**
- `vercel-deployer` - Production deployments, domains
- `vibecode-archivist` - Project inventory, portfolio
- `code-reviewer` - Code quality, performance, security

**Priority 4 - Low:**
- `doc-organizer` - File structure, documentation, cleanup

## Tips

1. **Be Specific**: "deploy PARISEYE to production" beats "deploy"
2. **Check Triggers**: `cc-agents status <name>` shows trigger keywords
3. **Use Patterns**: `cc-agents patterns` for multi-step workflows
4. **Start with @seth**: For complex tasks needing coordination
5. **Match Confidence**: 70%+ = strong match, 40-70% = good match, <40% = weak match

## Future Features

Coming soon with audit system:
- Real invocation counts
- Task success rates
- Popular task patterns
- Agent performance metrics
- Time-based analytics

---

*For detailed documentation, see [AGENT_INTEGRATION.md](/Users/seth/seth-command-center/docs/AGENT_INTEGRATION.md)*
