-- CreateTable
CREATE TABLE "grammar_concept_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "concept" TEXT NOT NULL,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "mistake_count" INTEGER NOT NULL DEFAULT 0,
    "mastery_score" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_concept_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grammar_concept_progress_user_id_idx" ON "grammar_concept_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_concept_progress_user_id_concept_key" ON "grammar_concept_progress"("user_id", "concept");

-- AddForeignKey
ALTER TABLE "grammar_concept_progress" ADD CONSTRAINT "grammar_concept_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
