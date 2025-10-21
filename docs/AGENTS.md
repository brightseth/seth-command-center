# Seth Intelligence Platform - Agent System Documentation

**Version:** 1.0.0
**Last Updated:** 2025-10-11
**Agent Registry:** `/Users/seth/seth-command-center/config/agents.yaml`

---

## Overview

The Seth Intelligence Platform operates through a coordinated ecosystem of 8 specialized AI agents. Each agent has distinct capabilities, tools, and triggers, working together to manage Seth Justin Goldstein's creative and technical projects.

### Core Philosophy

- **Specialized Expertise**: Each agent masters a specific domain
- **Coordinated Workflows**: Agents hand off tasks to each other
- **Context Awareness**: All agents share global project state
- **Proactive Engagement**: Agents activate based on keywords and patterns
- **Quality Focus**: Multiple review layers ensure production excellence

---

## Agent Directory

### 1. @seth 🧠
**Personal Operating System & Ecosystem Coordinator**

The meta-agent that orchestrates all other agents and maintains global context.

**When to Invoke:**
- Planning new projects or features
- Coordinating multi-agent workflows
- Strategic decision making
- Cross-project architecture
- System health monitoring

**Example Commands:**
```
@seth plan the architecture for PARISEYE v2
@seth what's the status of all active projects?
@seth coordinate deployment of SOLIENNE and vibecodings portfolio
@seth create a roadmap for the next sprint
```

**Capabilities:**
- Cross-agent coordination
- Project planning and architecture
- Context management
- Priority and roadmap development
- System health monitoring

**Integration:**
- Receives all high-level tasks from Command Center
- Delegates to specialized agents
- Maintains global context across projects

---

### 2. design-guardian 🎨
**Unified Design System Enforcer**

Ensures Swiss design principles and brand consistency across all projects.

**When to Invoke:**
- Design reviews and audits
- Typography or color changes
- Layout and spacing issues
- Brand consistency checks
- CSS architecture reviews

**Example Commands:**
```
design-guardian review PARISEYE design
design-guardian audit typography across all projects
design-guardian check if this matches Swiss design system
design-guardian update color palette to 4-bit standard
```

**Design System:**
- **Typography**: Helvetica Neue (primary), IBM Plex Mono (code)
- **Colors**: #000000 (background), #FFFFFF (foreground), #FF6B35 (accent)
- **Spacing**: 8px base unit (multiples of 8)
- **Grid**: CSS Grid with auto-fill minmax patterns

**Capabilities:**
- Swiss design enforcement
- Typography audits
- Color system management
- Layout verification
- Brand consistency

**Integration:**
- Reviews work from mobile-first-builder
- Approves before vercel-deployer
- Maintains global design system state

---

### 3. mobile-first-builder 📱
**Single-File Progressive Web App Builder**

Builds complete, performant single-file HTML applications with mobile-first design.

**When to Invoke:**
- Building new interfaces
- Creating galleries or browsers
- Implementing interactive features
- Mobile optimization
- PWA development

**Example Commands:**
```
mobile-first-builder create gallery for SOLIENNE dataset
mobile-first-builder build responsive filter interface
mobile-first-builder add favorites system with localStorage
mobile-first-builder optimize PARISEYE for mobile
```

**Architecture Patterns:**
- Single HTML file with inline CSS/JS
- Vanilla JavaScript (no frameworks)
- Progressive loading and rendering
- Touch-friendly interactions
- Offline-first with localStorage

**Capabilities:**
- Complete single-file apps
- Mobile-first responsive design
- Progressive Web App features
- Performance optimization
- Touch interfaces

**Integration:**
- Receives data from data-curator
- Reviewed by design-guardian
- Deployed by vercel-deployer

---

### 4. vercel-deployer 🚀
**Deployment & Production Management**

Manages all Vercel deployments, domains, and production infrastructure.

**When to Invoke:**
- Deploying to production
- Creating preview deployments
- Managing domains
- Environment variables
- Rollbacks

**Example Commands:**
```
vercel-deployer deploy PARISEYE to production
vercel-deployer create preview deployment for SOLIENNE
vercel-deployer add environment variable for API_KEY
vercel-deployer roll back to previous deployment
```

**Deployment Patterns:**
- **Production**: `vercel --prod`
- **Preview**: `vercel`
- **Environment**: `vercel env add`
- **Domains**: `vercel domains add`
- **Rollback**: `vercel rollback [url]`

**Capabilities:**
- Vercel deployment management
- Domain and DNS configuration
- Environment variables
- Build optimization
- Rollback handling

**Integration:**
- Final step in deployment pipeline
- Receives approved builds from design-guardian
- Reports status to Command Center

---

### 5. data-curator 📊
**Large Dataset & Manifest Manager**

Manages JSON manifests, datasets, and data-driven applications with 1,000+ items.

**When to Invoke:**
- Working with large JSON files
- Normalizing datasets
- Building search/filter systems
- Metadata extraction
- Data validation

**Example Commands:**
```
data-curator normalize SOLIENNE dataset to manifest format
data-curator extract metadata from 5,000 images
data-curator build search index for vibecodings projects
data-curator generate statistics for consciousness works
```

**Data Patterns:**
```json
{
  "version": "1.0",
  "generated": "2025-10-11T00:00:00Z",
  "total_items": 5694,
  "items": [
    {
      "id": "01HXYZ...",
      "title": "Item Title",
      "description": "Description text",
      "image_url": "https://cdn.example.com/image.jpg",
      "created_at": "2025-10-11",
      "metadata": { "category": "portrait", "tags": [] }
    }
  ]
}
```

**Capabilities:**
- JSON manifest generation
- Data normalization and cleaning
- Metadata extraction
- Search/filter design
- Progressive loading patterns
- Statistics generation

**Integration:**
- Prepares data for mobile-first-builder
- Receives raw data, outputs clean manifests
- Tracks dataset versions

---

### 6. vibecode-archivist 🗂️
**Portfolio & Project Curator**

Maintains Seth's project inventory, categorization, and portfolio generation.

**When to Invoke:**
- Portfolio updates
- Project inventory
- Categorizing projects
- Deployment tracking
- Archive management

**Example Commands:**
```
vibecode-archivist scan ~/Desktop for all projects
vibecode-archivist generate vibecodings portfolio manifest
vibecode-archivist find all Eden-related projects
vibecode-archivist update project deployment status
```

**Categorization Rules:**
- **Eden**: Eden-related AI art projects
- **Tools**: Developer tools and utilities
- **Featured**: Production-ready portfolio pieces
- **Active**: Modified in last 30 days
- **Deployed**: Has vercel.json or .vercel directory

**Capabilities:**
- Project inventory management
- SESSION_NOTES.md parsing
- Automatic categorization
- Deployment status tracking
- Portfolio generation

**Integration:**
- Generates data for data-curator
- Feeds mobile-first-builder
- Tracks all active/archived projects

---

### 7. doc-organizer 📁
**File Structure & Documentation Manager**

Maintains organized project structures and documentation consistency.

**When to Invoke:**
- Organizing file structures
- Creating/updating READMEs
- Cleaning up directories
- Enforcing naming conventions
- Archive management

**Example Commands:**
```
doc-organizer organize PARISEYE project structure
doc-organizer generate README for SOLIENNE
doc-organizer clean up duplicate files in Desktop
doc-organizer archive old session notes
```

**Structure Patterns:**
- **Web App**: `index.html, assets/, data/, README.md`
- **Library**: `src/, dist/, tests/, docs/, package.json`
- **Documentation**: `README.md, CLAUDE.md, SESSION_NOTES.md`
- **Data Project**: `data/, scripts/, manifests/, browser/`

**Capabilities:**
- Directory structure design
- README generation
- Documentation consistency
- File organization
- Naming conventions

**Integration:**
- Works with all agents for organization
- Maintains canonical structures
- Ensures findability

---

### 8. code-reviewer 🔍
**Code Quality & Best Practices Enforcer**

Audits code quality, performance, security, and best practices.

**When to Invoke:**
- Code reviews
- Performance audits
- Security checks
- Refactoring suggestions
- Technical debt tracking

**Example Commands:**
```
code-reviewer review PARISEYE code quality
code-reviewer audit SOLIENNE for performance issues
code-reviewer check security of data handling
code-reviewer suggest refactoring for mobile-first-builder output
```

**Review Focus:**
- **Performance**: Bundle size, render speed, memory usage
- **Security**: XSS, CSRF, data validation
- **Maintainability**: DRY, SOLID, clear naming
- **Accessibility**: ARIA, keyboard nav, screen readers

**Capabilities:**
- Code quality audits
- Performance optimization
- Security vulnerability detection
- Best practices enforcement
- Technical debt tracking

**Integration:**
- Reviews mobile-first-builder output
- Audits before vercel-deployer
- Tracks quality metrics

---

## Agent Coordination Patterns

### Full Deployment Pipeline
```
1. @seth: Plan and coordinate
2. data-curator: Prepare datasets
3. mobile-first-builder: Build interface
4. design-guardian: Review design
5. code-reviewer: Audit code
6. vercel-deployer: Deploy to production
```

### Portfolio Update Workflow
```
1. vibecode-archivist: Scan projects
2. data-curator: Generate manifest
3. mobile-first-builder: Build portfolio page
4. vercel-deployer: Deploy
```

### Design System Update
```
1. design-guardian: Update design tokens
2. mobile-first-builder: Implement changes
3. code-reviewer: Review implementations
4. @seth: Coordinate rollout across projects
```

### Data Pipeline
```
1. data-curator: Clean and normalize
2. mobile-first-builder: Build browser
3. design-guardian: Style verification
4. vercel-deployer: Ship to production
```

---

## How to Invoke Agents

### Direct Invocation
Use the agent name followed by task description:
```
mobile-first-builder create a venue browser for PARISEYE
design-guardian review the typography in index.html
data-curator normalize the consciousness manifest
```

### Implicit Invocation
Agents automatically activate based on trigger keywords:
```
"Deploy PARISEYE to production" -> vercel-deployer
"Build a gallery interface" -> mobile-first-builder
"Organize project files" -> doc-organizer
```

### Coordination Requests
Ask @seth to coordinate multi-agent workflows:
```
@seth deploy SOLIENNE with full quality checks
@seth update portfolio with latest projects
@seth optimize PARISEYE for production
```

---

## Integration with Command Center

### Task Routing
The Command Center API routes tasks to appropriate agents based on:
- Explicit agent mentions
- Trigger keyword matching
- Project context
- Task complexity

### Context Management
All agents share global context through Command Center:
- Active project status
- Recent deployments
- Design system state
- Data manifest versions

### Status Monitoring
Command Center tracks agent activity:
- Active tasks per agent
- Handoff chains
- Success/failure rates
- Performance metrics

---

## Agent Status Levels

- **Active**: Fully operational, responds to triggers
- **Testing**: In development, manual invocation only
- **Archived**: Deprecated, kept for reference

Current Status (2025-10-11):
- All 8 agents: **Active**

---

## Best Practices

### 1. Use Specific Agents
Instead of generic requests, invoke the right agent:
- ❌ "Fix the design"
- ✅ "design-guardian review typography and spacing"

### 2. Chain Workflows
For complex tasks, coordinate multiple agents:
- ❌ "Build and deploy PARISEYE"
- ✅ "@seth coordinate full deployment of PARISEYE with quality checks"

### 3. Provide Context
Help agents understand the full picture:
- ❌ "Update the manifest"
- ✅ "data-curator update SOLIENNE manifest with new CLIP embeddings"

### 4. Trust Specialization
Let agents focus on their expertise:
- mobile-first-builder handles implementation
- design-guardian ensures brand consistency
- code-reviewer checks quality
- vercel-deployer manages production

### 5. Request Coordination
For cross-cutting concerns, ask @seth:
- Architecture decisions
- Multi-project updates
- Strategy and roadmaps
- Priority conflicts

---

## Reference Projects

### SOLIENNE Vision 2025
- **Directory**: `/Users/seth/SOLIENNE_VISION_2025/`
- **Agent Usage**: data-curator, mobile-first-builder, design-guardian
- **Pattern**: Large dataset browser (5,694 works)

### PARISEYE
- **Directory**: `/Users/seth/pariseye/`
- **URL**: https://pariseye-d196982mf-edenprojects.vercel.app
- **Agent Usage**: mobile-first-builder, design-guardian, vercel-deployer
- **Pattern**: Single-file mobile-first app

### vibecodings Portfolio
- **Agent Usage**: vibecode-archivist, data-curator, mobile-first-builder
- **Pattern**: Project inventory and portfolio generation

---

## Agent CLI

Use the suggest-agent script to get recommendations:
```bash
cd /Users/seth/seth-command-center
npm run suggest-agent "build a gallery for my images"
# Suggests: mobile-first-builder, data-curator
```

---

## Troubleshooting

### Agent Not Responding
1. Check agent status in `agents.yaml`
2. Verify trigger keywords match task description
3. Try explicit agent invocation
4. Ask @seth to delegate manually

### Wrong Agent Activated
1. Use explicit agent name in request
2. Update trigger keywords in `agents.yaml`
3. Report to @seth for coordination pattern update

### Handoff Failure
1. Check Command Center logs
2. Verify previous agent completed task
3. Manually invoke next agent in chain
4. Report to @seth for workflow debugging

---

## Future Enhancements

- **Agent learning**: Pattern recognition from successful workflows
- **Auto-coordination**: @seth automatically chains agents
- **Performance metrics**: Track agent efficiency and success rates
- **Custom agents**: User-defined specialized agents

---

**Maintained by**: @seth
**Command Center**: `/Users/seth/seth-command-center/`
**Registry**: `/Users/seth/seth-command-center/config/agents.yaml`
