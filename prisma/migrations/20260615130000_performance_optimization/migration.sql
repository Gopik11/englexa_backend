-- Performance optimization: composite indexes and query paths for high-traffic tables.
-- Safe to run when tables already exist (guarded with IF EXISTS checks).

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'grammar_concept_progress') THEN
    CREATE INDEX IF NOT EXISTS "grammar_concept_progress_user_id_mastery_score_idx"
      ON "grammar_concept_progress"("user_id", "mastery_score");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skill_concept_mastery') THEN
    CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_concept_idx"
      ON "skill_concept_mastery"("user_id", "concept");
    CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_module_idx"
      ON "skill_concept_mastery"("user_id", "module");
    CREATE INDEX IF NOT EXISTS "skill_concept_mastery_user_id_mastery_score_idx"
      ON "skill_concept_mastery"("user_id", "mastery_score");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'srs_reviews') THEN
    CREATE INDEX IF NOT EXISTS "srs_reviews_user_id_next_review_idx"
      ON "srs_reviews"("user_id", "next_review");
    CREATE INDEX IF NOT EXISTS "srs_reviews_user_id_module_next_review_idx"
      ON "srs_reviews"("user_id", "module", "next_review");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_sessions') THEN
    CREATE INDEX IF NOT EXISTS "conversation_sessions_user_id_created_at_idx"
      ON "conversation_sessions"("user_id", "created_at" DESC);
    CREATE INDEX IF NOT EXISTS "conversation_sessions_user_id_status_idx"
      ON "conversation_sessions"("user_id", "status");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_snapshots') THEN
    CREATE INDEX IF NOT EXISTS "analytics_snapshots_user_id_period_snapshot_date_idx"
      ON "analytics_snapshots"("user_id", "period", "snapshot_date");
    CREATE INDEX IF NOT EXISTS "analytics_snapshots_created_at_idx"
      ON "analytics_snapshots"("created_at");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_challenges') THEN
    CREATE INDEX IF NOT EXISTS "daily_challenges_user_id_date_idx"
      ON "daily_challenges"("user_id", "date");
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_daily_activity') THEN
    CREATE INDEX IF NOT EXISTS "user_daily_activity_user_id_activity_date_idx"
      ON "user_daily_activity"("user_id", "activity_date");
  END IF;
END $$;

-- Large-table maintenance: monthly partition helper for analytics_snapshots.
-- Creates child partitions on demand when the parent is converted to partitioned
-- (run manually in production when table size warrants it).
CREATE OR REPLACE FUNCTION ensure_analytics_snapshot_partition(partition_date DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  partition_name TEXT;
  range_start DATE;
  range_end DATE;
BEGIN
  range_start := date_trunc('month', partition_date)::DATE;
  range_end := (range_start + INTERVAL '1 month')::DATE;
  partition_name := 'analytics_snapshots_' || to_char(range_start, 'YYYY_MM');

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = partition_name AND n.nspname = 'public'
  ) THEN
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF analytics_snapshots
       FOR VALUES FROM (%L) TO (%L)',
      partition_name,
      range_start,
      range_end
    );
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
  WHEN invalid_object_definition THEN
    NULL;
END;
$$;
