-- Database Performance Indexes Rollback Migration
-- TICKET-14: Database Query Optimization - Task 2
-- This migration removes the performance indexes created in the main migration

-- ============================================================================
-- POSTS TABLE INDEXES ROLLBACK
-- ============================================================================

-- 1. Remove unique index on slug
DROP INDEX IF EXISTS idx_posts_slug;

-- 2. Remove index on is_published
DROP INDEX IF EXISTS idx_posts_is_published;

-- 3. Remove index on published_at
DROP INDEX IF EXISTS idx_posts_published_at;

-- 4. Remove composite index for published posts by publication date
DROP INDEX IF EXISTS idx_posts_published_at_is_published;

-- 5. Remove index on created_at
DROP INDEX IF EXISTS idx_posts_created_at;

-- 6. Remove index on author_name
DROP INDEX IF EXISTS idx_posts_author_name;

-- 7. Remove partial index for published posts only
DROP INDEX IF EXISTS idx_posts_published_only;

-- ============================================================================
-- TAGS TABLE INDEXES ROLLBACK
-- ============================================================================

-- 8. Remove unique index on name
DROP INDEX IF EXISTS idx_tags_name;

-- 9. Remove index on id
DROP INDEX IF EXISTS idx_tags_id;

-- ============================================================================
-- POST_TAGS TABLE INDEXES ROLLBACK
-- ============================================================================

-- 10. Remove composite index on post_id and tag_id
DROP INDEX IF EXISTS idx_post_tags_post_id_tag_id;

-- 11. Remove index on post_id
DROP INDEX IF EXISTS idx_post_tags_post_id;

-- 12. Remove index on tag_id
DROP INDEX IF EXISTS idx_post_tags_tag_id;

-- 13. Remove unique constraint
DROP INDEX IF EXISTS idx_post_tags_unique;

-- ============================================================================
-- QUESTIONNAIRE_SUBMISSIONS TABLE INDEXES ROLLBACK
-- ============================================================================

-- 14. Remove index on created_at
DROP INDEX IF EXISTS idx_questionnaire_submissions_created_at;

-- 15. Remove index on email
DROP INDEX IF EXISTS idx_questionnaire_submissions_email;

-- 16. Remove index on processed status
DROP INDEX IF EXISTS idx_questionnaire_submissions_processed;

-- 17. Remove composite index for admin query pattern
DROP INDEX IF EXISTS idx_questionnaire_submissions_processed_created_at;

-- ============================================================================
-- LEARN_MORE_SUBMISSIONS TABLE INDEXES ROLLBACK
-- ============================================================================

-- 18. Remove index on created_at
DROP INDEX IF EXISTS idx_learn_more_submissions_created_at;

-- 19. Remove index on email
DROP INDEX IF EXISTS idx_learn_more_submissions_email;

-- 20. Remove index on mailing_list
DROP INDEX IF EXISTS idx_learn_more_submissions_mailing_list;

-- ============================================================================
-- COMPOSITE INDEXES ROLLBACK
-- ============================================================================

-- Note: Removed the problematic partial index with subquery
-- PostgreSQL doesn't support subqueries in index predicates

-- ============================================================================
-- FUTURE FEATURES INDEXES ROLLBACK
-- ============================================================================

-- 21. Remove full-text search index
DROP INDEX IF EXISTS idx_posts_fulltext;

-- 22. Remove index on updated_at
DROP INDEX IF EXISTS idx_posts_updated_at;

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS ROLLBACK
-- ============================================================================

-- Remove index usage stats view
DROP VIEW IF EXISTS index_usage_stats;

-- Remove slow queries view (if it was created)
-- DROP VIEW IF EXISTS slow_queries;

-- ============================================================================
-- ROLLBACK COMPLETION
-- ============================================================================

-- Remove the migration record
DELETE FROM schema_migrations WHERE version = '001_create_performance_indexes';

-- Output completion message
SELECT 'Database performance indexes removed successfully!' as status; 