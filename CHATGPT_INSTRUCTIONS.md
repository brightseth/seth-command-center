# ChatGPT → Seth Command Center Integration

**Make ChatGPT your TODO list manager that automatically updates Seth Command Center.**

---

## ✅ How It Works

```
You manage TODOs in ChatGPT
    ↓
ChatGPT sends updates to Seth Command Center
    ↓
Tasks appear in your UI automatically
```

---

## 🔧 Setup (One-Time)

### Step 1: Tell ChatGPT About the API

Copy and paste this into ChatGPT:

```
I have a personal TODO management system called Seth Command Center running at http://localhost:3001.

When I tell you to add, update, or sync my TODO list, use this API:

POST http://localhost:3001/api/todos/import
Content-Type: application/json

{
  "tasks": [
    {
      "title": "Task title",
      "project": "Project name (optional: Abraham, MIYOMI, Residency, etc.)",
      "priority": "high|medium|low (optional, default: medium)",
      "status": "open|doing|done (optional, default: open)",
      "due": "2025-10-15 (optional, ISO date)",
      "notes": "Additional notes (optional)"
    }
  ],
  "mode": "create" // or "replace" to clear existing and replace
}

My active projects:
- Abraham (art/NFT project)
- MIYOMI (AI project)
- Residency (Berlin residency planning)
- SOLIENNE (consciousness art)
- Automata (automation tools)
- Variant Portfolio (portfolio site)
- IRS (tax/admin)
- NODE Artist Relations (artist network)
- BM (Bright Moments)
- Vibecoding (coding practice)
- Eden Academy (teaching)
- Paris Photo (photography project)

When I say "sync my TODO list" or "update my tasks", send my current TODO list to this API.
```

---

## 💬 Example Usage

### Add Single Task
**You:** "Add to my TODO: Deploy Abraham to mainnet by Oct 8"

**ChatGPT:** (Sends to API)
```json
{
  "tasks": [{
    "title": "Deploy Abraham to mainnet",
    "project": "Abraham",
    "priority": "high",
    "due": "2025-10-08"
  }]
}
```

### Add Multiple Tasks
**You:** "Add these tasks:
- Review MIYOMI whitepaper (high priority)
- Book Berlin apartment for residency
- Update portfolio with Paris Photo images"

**ChatGPT:** (Sends all 3 tasks)

### Full Sync (Replace All)
**You:** "Here's my complete TODO list. Replace everything in Seth Command Center:
1. Abraham launch prep (due Oct 8)
2. MIYOMI video generation test
3. Book residency apartment"

**ChatGPT:** (Sends with `mode: "replace"`)

---

## 🎯 Best Practices

### 1. Daily Morning Routine
**You:** "What should I focus on today?"

**ChatGPT:** Shows your priorities

**You:** "Sync my TODO list"

**ChatGPT:** Sends current list to Seth Command Center

### 2. Weekly Planning
**You:** "Here are my goals for this week: [list]"

**ChatGPT:** Organizes them

**You:** "Update Seth Command Center"

**ChatGPT:** Syncs everything

### 3. Quick Additions
**You:** "Add task: Call NODE about artist dinner"

**ChatGPT:** Adds immediately

---

## 📋 Useful Commands

Tell ChatGPT:

| Command | What Happens |
|---------|--------------|
| "Sync my TODO list" | Sends current ChatGPT list → Seth |
| "Add task: [description]" | Creates single task |
| "Mark [task] as done" | Updates in ChatGPT + syncs |
| "Show my TODO list" | ChatGPT displays current list |
| "Replace all tasks with: [list]" | Clears Seth + adds new list |

---

## 🔄 Two-Way Workflow

### ChatGPT → Seth (Automatic)
You manage TODOs in ChatGPT, it syncs to Seth

### Seth → ChatGPT (Manual, when needed)
```bash
npm run sync:copy  # Copy Seth → paste in ChatGPT
```

Use this when:
- You added tasks directly in Seth UI
- You want ChatGPT to see your latest progress

---

## 🧪 Test It

**1. Add a test task:**
```
You: "Add test task: Buy groceries (low priority)"
```

**2. Check Seth Command Center:**
```
open http://localhost:3001/command-center/todos
```

**3. Should see new task!**

---

## 🚀 Advanced: Custom Instructions

Add this to your ChatGPT Custom Instructions:

**"What would you like ChatGPT to know about you?"**
```
I use Seth Command Center (http://localhost:3001) to manage my TODO list.
When I mention adding tasks or syncing my TODO list, automatically send
them to POST http://localhost:3001/api/todos/import in the format:
{"tasks": [{"title": "...", "project": "...", "priority": "..."}]}
```

**"How would you like ChatGPT to respond?"**
```
When I share my TODO list or ask you to add tasks, automatically sync
them to my Seth Command Center without me having to explicitly say "sync".
Confirm when tasks are added: "✅ Added to Seth Command Center"
```

---

## 📊 API Response

ChatGPT will see this response after syncing:

```json
{
  "success": true,
  "imported": 3,
  "errors": 0,
  "tasks": [
    {
      "id": "...",
      "title": "Deploy Abraham to mainnet",
      "project": { "name": "Abraham", "color": "#C0392B" },
      "priority": 1,
      "status": "open",
      "due": "2025-10-08T00:00:00.000Z"
    }
  ]
}
```

---

## ✅ You're All Set!

**Workflow:**
1. Manage your TODO list in ChatGPT (your source of truth)
2. Tell ChatGPT "sync my TODO list" when ready
3. Tasks appear in Seth Command Center automatically
4. View/manage them at: http://localhost:3001/command-center/todos

**That's it!** ChatGPT is now your TODO list manager. 🎉

---

**Questions?**
- Test the endpoint: `curl -X POST http://localhost:3001/api/todos/import -H "Content-Type: application/json" -d '{"tasks":[{"title":"Test"}]}'`
- View API logs: Check terminal running `npm run dev`
