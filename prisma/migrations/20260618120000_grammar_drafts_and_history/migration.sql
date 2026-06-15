-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');
CREATE TYPE "GrammarDraftType" AS ENUM ('TOPIC', 'EXERCISE', 'EXAMPLE');

-- AlterTable
ALTER TABLE "grammar_topics" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "grammar_exercises" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "grammar_examples" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "grammar_topic_drafts" (
    "id" UUID NOT NULL,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grammar_topic_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_exercise_drafts" (
    "id" UUID NOT NULL,
    "topic_id" UUID,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grammar_exercise_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_example_drafts" (
    "id" UUID NOT NULL,
    "topic_id" UUID,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grammar_example_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_topic_history" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grammar_topic_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_exercise_history" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grammar_exercise_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_example_history" (
    "id" UUID NOT NULL,
    "example_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "content_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grammar_example_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grammar_topic_drafts_status_idx" ON "grammar_topic_drafts"("status");
CREATE INDEX "grammar_exercise_drafts_topic_id_status_idx" ON "grammar_exercise_drafts"("topic_id", "status");
CREATE INDEX "grammar_example_drafts_topic_id_status_idx" ON "grammar_example_drafts"("topic_id", "status");
CREATE INDEX "grammar_topic_history_topic_id_version_idx" ON "grammar_topic_history"("topic_id", "version");
CREATE INDEX "grammar_exercise_history_exercise_id_version_idx" ON "grammar_exercise_history"("exercise_id", "version");
CREATE INDEX "grammar_example_history_example_id_version_idx" ON "grammar_example_history"("example_id", "version");

-- AddForeignKey
ALTER TABLE "grammar_topic_history" ADD CONSTRAINT "grammar_topic_history_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "grammar_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grammar_exercise_history" ADD CONSTRAINT "grammar_exercise_history_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "grammar_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grammar_example_history" ADD CONSTRAINT "grammar_example_history_example_id_fkey" FOREIGN KEY ("example_id") REFERENCES "grammar_examples"("id") ON DELETE CASCADE ON UPDATE CASCADE;
