-- CreateEnum
CREATE TYPE "PracticeLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "GrammarExerciseType" AS ENUM ('FILL_BLANK', 'MCQ', 'CORRECTION', 'REWRITE', 'SHORT_ANSWER');
CREATE TYPE "ContentSource" AS ENUM ('FILE_IMPORT', 'AI_GENERATED', 'ADMIN_CREATED');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "grammar_topics" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "PracticeLevel" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grammar_topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_exercises" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "legacy_id" TEXT,
    "type" "GrammarExerciseType" NOT NULL,
    "question" TEXT NOT NULL,
    "options_json" JSONB,
    "answer_json" JSONB NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "source" "ContentSource" NOT NULL DEFAULT 'FILE_IMPORT',
    "status" "ContentStatus" NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grammar_exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grammar_examples" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "sentence" TEXT NOT NULL,
    "highlight" TEXT,
    "note" TEXT,
    "source" "ContentSource" NOT NULL DEFAULT 'FILE_IMPORT',
    "status" "ContentStatus" NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grammar_examples_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_grammar_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "last_score" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_grammar_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grammar_topics_slug_key" ON "grammar_topics"("slug");
CREATE INDEX "grammar_topics_level_is_published_idx" ON "grammar_topics"("level", "is_published");
CREATE UNIQUE INDEX "grammar_exercises_topic_id_legacy_id_key" ON "grammar_exercises"("topic_id", "legacy_id");
CREATE INDEX "grammar_exercises_topic_id_status_difficulty_idx" ON "grammar_exercises"("topic_id", "status", "difficulty");
CREATE INDEX "grammar_examples_topic_id_status_idx" ON "grammar_examples"("topic_id", "status");
CREATE UNIQUE INDEX "user_grammar_progress_user_id_topic_id_key" ON "user_grammar_progress"("user_id", "topic_id");
CREATE INDEX "user_grammar_progress_user_id_idx" ON "user_grammar_progress"("user_id");

-- AddForeignKey
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "grammar_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grammar_examples" ADD CONSTRAINT "grammar_examples_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "grammar_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_grammar_progress" ADD CONSTRAINT "user_grammar_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_grammar_progress" ADD CONSTRAINT "user_grammar_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "grammar_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
