// Ingest October 20, 2025 task list into Seth Command Center
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taskData = {
  "owner": "Seth",
  "generated_at": "2025-10-20",
  "projects": [
    {
      "project": "Daily Run — Today",
      "date": "2025-10-20",
      "tasks": [
        {
          "title": "Visit Quintal to review Riso prints (lock paper/inks, confirm Nov 6–8 delivery)",
          "owner": "Seth",
          "priority": "high",
          "tags": ["ParisPhoto", "Riso", "Magma"],
          "status": "todo"
        },
        {
          "title": "Confirm CosyPixel proposal; request full timeline (draw test → run → completion), payment terms",
          "owner": "Seth",
          "priority": "high",
          "tags": ["CosyPixel", "Prints"],
          "status": "todo"
        },
        {
          "title": "Variant NFT sale update — email Tom & Caleb with status and pricing checkpoint",
          "owner": "Seth",
          "priority": "medium",
          "tags": ["Variant", "Sales"],
          "status": "todo"
        },
        {
          "title": "Confirm Nina call for Tuesday (time + agenda: wall text, press sheet, install window)",
          "owner": "Seth",
          "priority": "medium",
          "tags": ["ParisPhoto", "Press"],
          "status": "todo"
        },
        {
          "title": "Pay for Paris apartment via Prima (see Finance project for wire details)",
          "owner": "Seth",
          "priority": "high",
          "tags": ["Finance", "Prima", "Housing"],
          "status": "todo"
        },
        {
          "title": "Update Solienne Browser (Claude Code) — add sales CTA drawer + ticker snippet",
          "owner": "Seth",
          "priority": "medium",
          "tags": ["Solienne", "Web"],
          "status": "todo"
        },
        {
          "title": "Update Paris Photo status page with budget lines and deadlines",
          "owner": "Seth",
          "priority": "medium",
          "tags": ["ParisPhoto", "Ops"],
          "status": "todo"
        },
        {
          "title": "Update solienne.ai v2 with sales page draft",
          "owner": "Seth",
          "priority": "medium",
          "tags": ["Solienne", "Web"],
          "status": "todo"
        },
        {
          "title": "Update Eden website v2 brief and refresh Twitter/IG bios + pin Studio Log teaser",
          "owner": "Seth",
          "priority": "low",
          "tags": ["Eden", "Social"],
          "status": "todo"
        },
        {
          "title": "Meet Zancan before Agoria (share Solienne plan; request short quote for press sheet)",
          "owner": "Seth",
          "priority": "low",
          "tags": ["Community", "Press"],
          "status": "scheduled"
        },
        {
          "title": "Agoria show @ Artverse 19:00–20:00",
          "owner": "Seth",
          "priority": "low",
          "tags": ["Event"],
          "status": "scheduled"
        }
      ]
    },
    {
      "project": "Solienne — Print Production (CosyPixel + Magma)",
      "period": { "start": "2025-10-20", "end": "2025-11-10" },
      "tasks": [
        {
          "title": "Approve CosyPixel Devis 2025/093 (9× 40×40 prints; total €469.08 TTC) and request schedule",
          "owner": "Seth",
          "due": "2025-10-21",
          "priority": "high",
          "tags": ["CosyPixel", "Quote"],
          "status": "todo"
        },
        {
          "title": "Verify invoice/payment method and VAT documentation with CosyPixel",
          "owner": "Seth",
          "due": "2025-10-22",
          "priority": "medium",
          "tags": ["Finance", "CosyPixel"],
          "status": "todo"
        },
        {
          "title": "QC draw test with Tarron before full run",
          "owner": "Tarron",
          "due": "2025-10-23",
          "priority": "medium",
          "tags": ["QC", "CosyPixel"],
          "status": "todo"
        },
        {
          "title": "Schedule pickup/delivery for CosyPixel batch (target Oct 27–Nov 3)",
          "owner": "Seth",
          "due": "2025-10-24",
          "priority": "medium",
          "tags": ["Logistics", "CosyPixel"],
          "status": "todo"
        },
        {
          "title": "Prepare second lower-spec print batch brief (sizes, paper, qty 20–30)",
          "owner": "Seth",
          "due": "2025-10-23",
          "priority": "medium",
          "tags": ["SecondBatch"],
          "status": "todo"
        },
        {
          "title": "Confirm Magma Riso production plan (20 designs × 100) + delivery Nov 6–8",
          "owner": "Kristi",
          "due": "2025-10-25",
          "priority": "high",
          "tags": ["Magma", "Riso"],
          "status": "todo"
        },
        {
          "title": "Upload CosyPixel quote PDF to Drive (/Solienne/Print Production/)",
          "owner": "Seth",
          "due": "2025-10-20",
          "priority": "low",
          "tags": ["Docs"],
          "status": "todo"
        }
      ]
    },
    {
      "project": "Finance — Paris Apartment Payment",
      "period": { "start": "2025-10-20", "end": "2025-10-22" },
      "tasks": [
        {
          "title": "Send Paris apartment wire via Prima",
          "owner": "Seth",
          "priority": "high",
          "status": "todo",
          "tags": ["Finance", "Wire", "Housing"],
          "notes": {
            "recipient": "Constance Choi",
            "address": "511 Dwight Place, Berkeley, CA 94704, USA",
            "bank": "Bank of America",
            "swift": "BOFAUS3N",
            "account_number": "000870975632",
            "routing_number": "026009593",
            "currency": "USD",
            "amount": "TBD",
            "confirmation_upload_path": "/Finance/Paris Apartment Payments/"
          }
        }
      ]
    },
    {
      "project": "Residency — Expats / Blue Card",
      "period": { "start": "2025-10-20", "end": "2025-10-29" },
      "tasks": [
        {
          "title": "Order Columbia transcript (Parchment) and save PDF",
          "owner": "Seth",
          "priority": "high",
          "tags": ["Docs", "Transcript"],
          "status": "todo"
        },
        {
          "title": "Upload passport, CV, degree certificate, transcript to Expats folder",
          "owner": "Seth",
          "priority": "high",
          "status": "todo"
        },
        {
          "title": "Blue Card coaching session (Carissa) — Wed Oct 29, 10:30–11:00 CET (Google Meet)",
          "owner": "Seth",
          "priority": "high",
          "status": "scheduled",
          "notes": {
            "meet_link": "https://meet.google.com/zgy-snqm-mgr"
          }
        }
      ]
    },
    {
      "project": "Calendar — Meetings & Events",
      "tasks": [
        {
          "title": "Meet Florian Zumbrunn — 49 Rue Eugène Berthoud, Saint-Ouen-sur-Seine",
          "owner": "Seth",
          "datetime_local": "2025-10-27T13:30:00+02:00",
          "priority": "medium",
          "status": "scheduled",
          "tags": ["Meeting"],
          "notes": {
            "maps": "https://maps.app.goo.gl/KHrRVxzqnDFkviSg7g"
          }
        },
        {
          "title": "Agoria @ Artverse 19:00–20:00",
          "owner": "Seth",
          "datetime_local": "2025-10-20T19:00:00+02:00",
          "priority": "low",
          "status": "scheduled",
          "tags": ["Event"]
        }
      ]
    },
    {
      "project": "Eden / Spirit Marketing & Web Relaunch (Ongoing)",
      "period": { "start": "2025-10-20", "end": "2025-11-15" },
      "tasks": [
        {
          "title": "Run Claude strategy prompt (Spirit Narrative + eden.art + discovery flow) and produce plan",
          "owner": "Seth",
          "priority": "high",
          "status": "todo",
          "tags": ["Strategy", "Brand"]
        },
        {
          "title": "Homepage V2 — narrative + wireframe brief for Henry",
          "owner": "Seth",
          "priority": "high",
          "status": "todo",
          "tags": ["Web", "Design"]
        },
        {
          "title": "4-week editorial calendar for IG/X (Studio Logs, Agent Stories)",
          "owner": "Seth",
          "priority": "medium",
          "status": "todo",
          "tags": ["Social", "Content"]
        },
        {
          "title": "Define KPIs + analytics plan (traffic, CTR, onboarding conversions)",
          "owner": "Henry",
          "priority": "medium",
          "status": "todo",
          "tags": ["Analytics"]
        }
      ]
    }
  ]
};

// Project mapping
const projectMapping = {
  "Daily Run — Today": { name: "Daily", type: "personal", status: "active", color: "#FF6B35" },
  "Solienne — Print Production (CosyPixel + Magma)": { name: "Solienne Print Production", type: "automata", status: "active", color: "#4ECDC4" },
  "Finance — Paris Apartment Payment": { name: "Finance", type: "personal", status: "active", color: "#95E1D3" },
  "Residency — Expats / Blue Card": { name: "Residency", type: "personal", status: "active", color: "#F38181" },
  "Calendar — Meetings & Events": { name: "Calendar", type: "personal", status: "active", color: "#AA96DA" },
  "Eden / Spirit Marketing & Web Relaunch (Ongoing)": { name: "Eden Marketing", type: "eden", status: "active", color: "#FCBAD3" }
};

// Priority mapping: high=1, medium=2, low=3
const priorityMap = { high: 1, medium: 2, low: 3 };

// Status mapping: todo→open, scheduled→open (with due date)
const statusMap = { todo: "open", scheduled: "open" };

async function main() {
  console.log("🚀 Starting October 20 task ingestion...\n");

  let totalCreated = 0;
  let projectsCreated = 0;

  for (const projectData of taskData.projects) {
    const projectKey = projectData.project;
    const projectConfig = projectMapping[projectKey];

    if (!projectConfig) {
      console.warn(`⚠️  No mapping found for project: ${projectKey}`);
      continue;
    }

    console.log(`📂 Processing project: ${projectConfig.name}`);

    // Find or create project
    let project = await prisma.project.findUnique({
      where: { name: projectConfig.name }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: projectConfig.name,
          type: projectConfig.type,
          status: projectConfig.status,
          color: projectConfig.color
        }
      });
      projectsCreated++;
      console.log(`  ✅ Created project: ${projectConfig.name}`);
    } else {
      console.log(`  ℹ️  Using existing project: ${projectConfig.name}`);
    }

    // Create tasks
    for (const task of projectData.tasks) {
      const priority = priorityMap[task.priority] || 2;
      const status = statusMap[task.status] || "open";
      const tags = task.tags ? task.tags.join(", ") : "";

      // Handle due dates
      let dueDate = null;
      if (task.due) {
        dueDate = new Date(task.due);
      } else if (task.datetime_local) {
        dueDate = new Date(task.datetime_local);
      }

      // Handle notes
      let notes = null;
      if (task.notes) {
        if (typeof task.notes === 'object') {
          notes = JSON.stringify(task.notes, null, 2);
        } else {
          notes = task.notes;
        }
      }

      try {
        const createdTask = await prisma.task.create({
          data: {
            projectId: project.id,
            title: task.title,
            notes: notes,
            priority: priority,
            status: status,
            due: dueDate,
            tags: tags,
            source: "manual",
            extractedFrom: `October 20, 2025 task list - ${projectKey}`
          }
        });

        totalCreated++;
        console.log(`    ✅ Created: ${task.title.substring(0, 60)}...`);
      } catch (error) {
        console.error(`    ❌ Failed to create task: ${task.title}`);
        console.error(`       Error: ${error.message}`);
      }
    }

    console.log("");
  }

  console.log("=" .repeat(60));
  console.log(`✅ Ingestion complete!`);
  console.log(`   Projects created: ${projectsCreated}`);
  console.log(`   Tasks created: ${totalCreated}`);
  console.log("=" .repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
