-- Database Performance Indexes Migration
-- TICKET-14: Database Query Optimization - Task 2
-- This migration adds indexes for frequently queried fields to improve query performance

-- ============================================================================
-- CREATE MIGRATIONS TABLE (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- POSTS TABLE INDEXES
-- ============================================================================

-- 1. Unique index on slug for fast lookups (most critical for blog post retrieval)
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- 2. Index on is_published for filtering published/unpublished posts
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);

-- 3. Index on published_at for sorting and filtering by publication date
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 4. Composite index for filtering published posts by publication date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_posts_published_at_is_published ON posts(published_at DESC, is_published);

-- 5. Index on created_at for admin sorting (used in admin blog route)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 6. Index on author_name for filtering by author (future feature)
CREATE INDEX IF NOT EXISTS idx_posts_author_name ON posts(author_name);

-- 7. Partial index for published posts only (optimizes queries that only fetch published content)
CREATE INDEX IF NOT EXISTS idx_posts_published_only ON posts(published_at DESC, created_at DESC) 
WHERE is_published = true;

-- ============================================================================
-- TAGS TABLE INDEXES
-- ============================================================================

-- 8. Unique index on name for tag uniqueness and fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 9. Index on id for fast tag lookups (used in IN clauses)
CREATE INDEX IF NOT EXISTS idx_tags_id ON tags(id);

-- ============================================================================
-- POST_TAGS TABLE INDEXES (Junction table)
-- ============================================================================

-- 10. Composite index on post_id and tag_id for efficient joins
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id_tag_id ON post_tags(post_id, tag_id);

-- 11. Index on post_id for finding all tags for a post
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);

-- 12. Index on tag_id for finding all posts with a specific tag
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- 13. Unique constraint to prevent duplicate post-tag relationships
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_tags_unique ON post_tags(post_id, tag_id);

-- ============================================================================
-- QUESTIONNAIRE_SUBMISSIONS TABLE INDEXES
-- ============================================================================

-- 14. Index on created_at for sorting submissions (used in admin route)
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_created_at ON questionnaire_submissions(created_at DESC);

-- 15. Index on email for potential future email-based queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_email ON questionnaire_submissions(email);

-- 16. Index on processed status for filtering processed/unprocessed submissions
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_processed ON questionnaire_submissions(processed);

-- 17. Composite index for common admin query pattern
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_processed_created_at ON questionnaire_submissions(processed, created_at DESC);

-- ============================================================================
-- LEARN_MORE_SUBMISSIONS TABLE INDEXES
-- ============================================================================

-- 18. Index on created_at for sorting submissions
CREATE INDEX IF NOT EXISTS idx_learn_more_submissions_created_at ON learn_more_submissions(created_at DESC);

-- 19. Index on email for potential future email-based queries
CREATE INDEX IF NOT EXISTS idx_learn_more_submissions_email ON learn_more_submissions(email);

-- 20. Index on mailing_list for filtering subscribers
CREATE INDEX IF NOT EXISTS idx_learn_more_submissions_mailing_list ON learn_more_submissions(mailing_list);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ============================================================================

-- Note: Removed the problematic partial index with subquery
-- PostgreSQL doesn't support subqueries in index predicates
-- The regular indexes above will still provide good performance for tag queries

-- ============================================================================
-- INDEXES FOR FUTURE FEATURES
-- ============================================================================

-- 21. Full-text search index on post title and content (for future search functionality)
CREATE INDEX IF NOT EXISTS idx_posts_fulltext ON posts USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '')));

-- 22. Index on updated_at for tracking content changes
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at DESC);

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- Removed: index_usage_stats view (security hardening; view unused by app)

-- Create a view to monitor slow queries (requires pg_stat_statements extension)
-- Note: This requires the pg_stat_statements extension to be enabled
-- CREATE OR REPLACE VIEW slow_queries AS
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     rows
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 50;

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

-- Log the migration completion
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('001_create_performance_indexes', NOW())
ON CONFLICT (version) DO NOTHING;

-- Output completion message
SELECT 'Database performance indexes created successfully!' as status; 