-- Fix missing tables: models present in schema.prisma but never migrated.
-- Safe to re-run: uses IF NOT EXISTS guards; does not alter or drop existing tables.
-- Depends on: users (from initial_schema migration).

-- ---------------------------------------------------------------------------
-- skill_concept_mastery  (SkillConceptMastery)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "skill_concept_mastery" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "mistake_count" INTEGER NOT NULL DEFAULT 0,
    "mastery_score" INTEGER NOT NULL DEFAULT 0,
    "time_spent_ms" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "skill_concept_mastery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_module_concept_key"
  ON "skill_concept_mastery"("user_id", "module", "concept");
CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_module_idx"
  ON "skill_concept_mastery"("user_id", "module");
CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_concept_idx"
  ON "skill_concept_mastery"("user_id", "concept");
CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_mastery_score_idx"
  ON "skill_concept_mastery"("user_id", "mastery_score");

DO $$ BEGIN
  ALTER TABLE "skill_concept_mastery"
    ADD CONSTRAINT "skill_concept_mastery_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- user_practice_stats  (UserPracticeStats)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_practice_stats" (
    "user_id" UUID NOT NULL,
    "grammar_correct" INTEGER NOT NULL DEFAULT 0,
    "vocabulary_correct" INTEGER NOT NULL DEFAULT 0,
    "reading_completed" INTEGER NOT NULL DEFAULT 0,
    "speaking_submissions" INTEGER NOT NULL DEFAULT 0,
    "writing_submissions" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_practice_stats_pkey" PRIMARY KEY ("user_id")
);

DO $$ BEGIN
  ALTER TABLE "user_practice_stats"
    ADD CONSTRAINT "user_practice_stats_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- adaptive_difficulty  (AdaptiveDifficulty)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "adaptive_difficulty" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "adaptive_difficulty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "adaptive_difficulty_user_id_module_concept_key"
  ON "adaptive_difficulty"("user_id", "module", "concept");
CREATE INDEX IF NOT EXISTS "adaptive_difficulty_user_id_module_idx"
  ON "adaptive_difficulty"("user_id", "module");

DO $$ BEGIN
  ALTER TABLE "adaptive_difficulty"
    ADD CONSTRAINT "adaptive_difficulty_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- error_patterns  (ErrorPattern)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "error_patterns" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "error_type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "error_patterns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "error_patterns_user_id_module_concept_error_type_key"
  ON "error_patterns"("user_id", "module", "concept", "error_type");
CREATE INDEX IF NOT EXISTS "error_patterns_user_id_module_idx"
  ON "error_patterns"("user_id", "module");
CREATE INDEX IF NOT EXISTS "error_patterns_user_id_count_idx"
  ON "error_patterns"("user_id", "count");

DO $$ BEGIN
  ALTER TABLE "error_patterns"
    ADD CONSTRAINT "error_patterns_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- mini_lesson_completions  (MiniLessonCompletion)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "mini_lesson_completions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mini_lesson_completions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mini_lesson_completions_user_id_lesson_id_key"
  ON "mini_lesson_completions"("user_id", "lesson_id");
CREATE INDEX IF NOT EXISTS "mini_lesson_completions_user_id_module_idx"
  ON "mini_lesson_completions"("user_id", "module");

DO $$ BEGIN
  ALTER TABLE "mini_lesson_completions"
    ADD CONSTRAINT "mini_lesson_completions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- conversation_sessions  (ConversationSession)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "conversation_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "analysis" JSONB NOT NULL DEFAULT '{}',
    "summary" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "conversation_sessions_user_id_status_idx"
  ON "conversation_sessions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "conversation_sessions_user_id_created_at_idx"
  ON "conversation_sessions"("user_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "conversation_sessions"
    ADD CONSTRAINT "conversation_sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- srs_reviews  (SrsReview)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "srs_reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "last_reviewed" TIMESTAMP(3) NOT NULL,
    "next_review" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "review_history" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "srs_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "srs_reviews_user_id_module_concept_key"
  ON "srs_reviews"("user_id", "module", "concept");
CREATE INDEX IF NOT EXISTS "srs_reviews_user_id_next_review_idx"
  ON "srs_reviews"("user_id", "next_review");
CREATE INDEX IF NOT EXISTS "srs_reviews_user_id_module_next_review_idx"
  ON "srs_reviews"("user_id", "module", "next_review");

DO $$ BEGIN
  ALTER TABLE "srs_reviews"
    ADD CONSTRAINT "srs_reviews_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- daily_challenges  (DailyChallenge)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "daily_challenges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "challenge" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenges_user_id_date_key"
  ON "daily_challenges"("user_id", "date");
CREATE INDEX IF NOT EXISTS "daily_challenges_user_id_date_idx"
  ON "daily_challenges"("user_id", "date");

DO $$ BEGIN
  ALTER TABLE "daily_challenges"
    ADD CONSTRAINT "daily_challenges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- user_badges  (UserBadge)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "badge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_user_id_badge_id_key"
  ON "user_badges"("user_id", "badge_id");
CREATE INDEX IF NOT EXISTS "user_badges_user_id_idx"
  ON "user_badges"("user_id");

DO $$ BEGIN
  ALTER TABLE "user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- user_achievements  (UserAchievement)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_achievements_user_id_achievement_id_key"
  ON "user_achievements"("user_id", "achievement_id");
CREATE INDEX IF NOT EXISTS "user_achievements_user_id_idx"
  ON "user_achievements"("user_id");

DO $$ BEGIN
  ALTER TABLE "user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- analytics_snapshots  (AnalyticsSnapshot)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "analytics_snapshots_user_id_period_snapshot_date_key"
  ON "analytics_snapshots"("user_id", "period", "snapshot_date");
CREATE INDEX IF NOT EXISTS "analytics_snapshots_user_id_period_snapshot_date_idx"
  ON "analytics_snapshots"("user_id", "period", "snapshot_date");

DO $$ BEGIN
  ALTER TABLE "analytics_snapshots"
    ADD CONSTRAINT "analytics_snapshots_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- user_daily_activity  (UserDailyActivity)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_daily_activity" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_date" DATE NOT NULL,
    "minutes_spent" INTEGER NOT NULL DEFAULT 0,
    "activity_count" INTEGER NOT NULL DEFAULT 0,
    "modules_used" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_daily_activity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_daily_activity_user_id_activity_date_key"
  ON "user_daily_activity"("user_id", "activity_date");
CREATE INDEX IF NOT EXISTS "user_daily_activity_user_id_activity_date_idx"
  ON "user_daily_activity"("user_id", "activity_date");

DO $$ BEGIN
  ALTER TABLE "user_daily_activity"
    ADD CONSTRAINT "user_daily_activity_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure composite index on grammar_concept_progress (may have been skipped by performance migration)
CREATE INDEX IF NOT EXISTS "grammar_concept_progress_user_id_mastery_score_idx"
  ON "grammar_concept_progress"("user_id", "mastery_score");
