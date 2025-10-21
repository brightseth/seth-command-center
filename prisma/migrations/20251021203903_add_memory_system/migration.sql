-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "extractedFrom" TEXT,
ADD COLUMN     "lastMentioned" TIMESTAMP(3),
ADD COLUMN     "linkedTaskIds" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mentionCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sourceContext" TEXT,
ADD COLUMN     "synthesisMetadata" TEXT;

-- CreateTable
CREATE TABLE "task_history" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_synthesis" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "relatedTaskId" TEXT,
    "relationship" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'synthesis-engine',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_synthesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "lastSuccess" TIMESTAMP(3),
    "tasksCreated" INTEGER NOT NULL DEFAULT 0,
    "config" TEXT NOT NULL,
    "health" TEXT NOT NULL DEFAULT 'healthy',
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingestion_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_history_taskId_createdAt_idx" ON "task_history"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_synthesis_taskId_idx" ON "task_synthesis"("taskId");

-- CreateIndex
CREATE INDEX "task_synthesis_relatedTaskId_idx" ON "task_synthesis"("relatedTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "ingestion_sources_name_key" ON "ingestion_sources"("name");

-- CreateIndex
CREATE INDEX "tasks_mentionCount_idx" ON "tasks"("mentionCount");

-- CreateIndex
CREATE INDEX "tasks_archived_archivedAt_idx" ON "tasks"("archived", "archivedAt");

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_synthesis" ADD CONSTRAINT "task_synthesis_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
