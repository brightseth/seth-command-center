# AI Intelligence Bridge Setup

## 🧠 What This Does

Automatically extract structured intelligence from your AI conversations with Claude, ChatGPT, Limitless, and Granola sessions:

- **Projects mentioned** → Auto-categorize work
- **Tasks and TODOs** → Create actionable items
- **Decisions made** → Track important choices
- **Key learnings** → Capture insights
- **Themes/topics** → Understand focus areas
- **Mood/energy levels** → Track mental state
- **Next actions** → Prioritize follow-ups

## 🚀 Quick Start (2 minutes)

### 1. Access AI Intelligence Interface
Visit: `http://localhost:3000/ai-intelligence`

### 2. Test with Mock Data
1. Click "Test Mock" button
2. Verify system processes conversations correctly
3. Check that tasks/KPIs are created in your Command Center

### 3. Upload Real Conversation
1. Copy text from recent Claude/ChatGPT session
2. Select source platform
3. Paste content and click "Extract Intelligence"
4. See structured intelligence extracted automatically

## 📋 Usage Patterns

### **Daily Intelligence Capture**
```bash
# Manual ritual trigger (every 30 minutes automated)
curl -X POST "http://localhost:3000/api/rituals/run" \
  -H "Content-Type: application/json" \
  -d '{"ritualId":"ai-session-sync"}'
```

### **Batch Processing**
Upload multiple conversations at once via API:
```bash
curl -X POST "http://localhost:3000/api/ai-sessions/ingest" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "source": "claude",
      "sessionId": "session-1",
      "timestamp": "2024-12-01T10:00:00Z",
      "content": "Working on seth-command-center..."
    }
  ]'
```

## 🎯 Intelligence Extraction Examples

### **What Gets Detected:**

**Projects**: "working on seth-command-center", "building eden agents"
→ Auto-categorizes under existing projects

**Tasks**: "need to integrate GitHub", "should add photolog"
→ Creates TODO items with proper priority

**Decisions**: "decided to use manifest-first architecture"
→ Tracks important architectural choices

**Learnings**: "learned that config-driven integration prevents coupling"
→ Captures insights for future reference

**Themes**: architecture, integration, automation, intelligence
→ Identifies focus areas and trends

**Mood**: "feeling excited about breakthrough", "focused on deep work"
→ Tracks emotional context and energy patterns

## 🔮 Automatic Intelligence

### **Every 30 Minutes** (ai-session-sync ritual):
- Processes queued conversations
- Extracts structured intelligence
- Creates tasks, KPIs, and work items
- Updates Command Center with insights

### **Smart Correlations**:
- Links conversations to GitHub activity
- Connects themes across sessions
- Identifies recurring problems/solutions
- Tracks decision-making patterns

## 📊 Command Center Integration

Intelligence appears in:
- **CEO View**: AI session KPIs, theme trends
- **Agent Hub**: AI session sync ritual status
- **Task Management**: Auto-generated action items
- **Audit Logs**: Full conversation processing history

## 🔄 Future Integrations

**Phase 1 (Working Now)**:
- Manual conversation upload
- Basic intelligence extraction
- Task/KPI creation

**Phase 2 (Coming Soon)**:
- Limitless.ai API connection
- ChatGPT export parsing
- Claude conversation sync

**Phase 3 (Roadmap)**:
- Real-time conversation monitoring
- Cross-platform intelligence correlation
- Predictive insights based on patterns

## 💡 Pro Tips

### **Better Intelligence Extraction**:
- Include context: "Working on X project"
- Be explicit: "Decision: using Y approach"
- State outcomes: "Learned that Z works better"
- Mention next steps: "Need to implement A"

### **Optimize Workflows**:
- Review extracted intelligence daily
- Use themes to identify focus patterns
- Track mood/energy for productivity insights
- Connect decisions to project outcomes

The AI Intelligence Bridge transforms your scattered conversations into structured, actionable intelligence that drives your Command Center! 🤖✨