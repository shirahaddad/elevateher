# Database Performance Indexes Documentation

## TICKET-14: Database Query Optimization - Task 2

This document describes the database indexes created to optimize query performance for the ElevateHer application.

## Overview

The application uses Supabase (PostgreSQL) as its database, and these indexes are designed to improve the performance of frequently executed queries identified through codebase analysis.

## Index Categories

### 1. Posts Table Indexes

#### `idx_posts_slug` (UNIQUE)
- **Purpose**: Fast lookups by slug for individual blog post retrieval
- **Usage**: `SELECT * FROM posts WHERE slug = 'some-slug'`
- **Performance Impact**: Critical - eliminates full table scans for post lookups
- **Query Patterns**: Used in `/api/blog/[slug]/route.ts` and `BlogPostService.getPostBySlug()`

#### `idx_posts_is_published`
- **Purpose**: Filter published/unpublished posts efficiently
- **Usage**: `SELECT * FROM posts WHERE is_published = true`
- **Performance Impact**: High - improves filtering performance
- **Query Patterns**: Used in blog listing and admin filtering

#### `idx_posts_published_at`
- **Purpose**: Sort posts by publication date (DESC)
- **Usage**: `SELECT * FROM posts ORDER BY published_at DESC`
- **Performance Impact**: High - eliminates sorting overhead
- **Query Patterns**: Used in blog listing and post ordering

#### `idx_posts_published_at_is_published` (Composite)
- **Purpose**: Optimize queries that filter by published status and sort by date
- **Usage**: `SELECT * FROM posts WHERE is_published = true ORDER BY published_at DESC`
- **Performance Impact**: Very High - covers common query pattern
- **Query Patterns**: Primary blog listing query

#### `idx_posts_created_at`
- **Purpose**: Sort posts by creation date for admin interface
- **Usage**: `SELECT * FROM posts ORDER BY created_at DESC`
- **Performance Impact**: Medium - improves admin sorting
- **Query Patterns**: Used in admin blog management

#### `idx_posts_author_name`
- **Purpose**: Filter posts by author (future feature)
- **Usage**: `SELECT * FROM posts WHERE author_name = 'Author Name'`
- **Performance Impact**: Medium - prepares for future functionality
- **Query Patterns**: Future author filtering feature

#### `idx_posts_published_only` (Partial)
- **Purpose**: Optimize queries that only fetch published content
- **Usage**: `SELECT * FROM posts WHERE is_published = true ORDER BY published_at DESC`
- **Performance Impact**: Very High - smaller index size, faster queries
- **Query Patterns**: Public blog listing queries

### 2. Tags Table Indexes

#### `idx_tags_name` (UNIQUE)
- **Purpose**: Ensure tag name uniqueness and fast lookups
- **Usage**: `SELECT * FROM tags WHERE name = 'tag-name'`
- **Performance Impact**: High - prevents duplicates and speeds lookups
- **Query Patterns**: Tag creation and validation

#### `idx_tags_id`
- **Purpose**: Fast tag lookups by ID
- **Usage**: `SELECT * FROM tags WHERE id IN (tag_ids)`
- **Performance Impact**: Medium - improves IN clause performance
- **Query Patterns**: Used when fetching tag names for posts

### 3. Post_Tags Table Indexes (Junction Table)

#### `idx_post_tags_post_id_tag_id` (Composite)
- **Purpose**: Efficient joins between posts and tags
- **Usage**: `JOIN post_tags ON posts.id = post_tags.post_id`
- **Performance Impact**: Very High - optimizes complex joins
- **Query Patterns**: Used in `TagService.getTags()` and post-tag relationships

#### `idx_post_tags_post_id`
- **Purpose**: Find all tags for a specific post
- **Usage**: `SELECT * FROM post_tags WHERE post_id = 'post-id'`
- **Performance Impact**: High - improves post tag retrieval
- **Query Patterns**: Used when displaying post tags

#### `idx_post_tags_tag_id`
- **Purpose**: Find all posts with a specific tag
- **Usage**: `SELECT * FROM post_tags WHERE tag_id = 'tag-id'`
- **Performance Impact**: High - improves tag-based filtering
- **Query Patterns**: Used in tag filtering functionality

#### `idx_post_tags_unique` (UNIQUE)
- **Purpose**: Prevent duplicate post-tag relationships
- **Usage**: Constraint enforcement
- **Performance Impact**: Low - data integrity
- **Query Patterns**: Prevents duplicate relationships

### 4. Questionnaire_Submissions Table Indexes

#### `idx_questionnaire_submissions_created_at`
- **Purpose**: Sort submissions by creation date
- **Usage**: `SELECT * FROM questionnaire_submissions ORDER BY created_at DESC`
- **Performance Impact**: High - improves admin sorting
- **Query Patterns**: Used in admin submission management

#### `idx_questionnaire_submissions_email`
- **Purpose**: Email-based queries (future feature)
- **Usage**: `SELECT * FROM questionnaire_submissions WHERE email = 'email@example.com'`
- **Performance Impact**: Medium - prepares for future functionality
- **Query Patterns**: Future email-based features

#### `idx_questionnaire_submissions_processed`
- **Purpose**: Filter processed/unprocessed submissions
- **Usage**: `SELECT * FROM questionnaire_submissions WHERE processed = false`
- **Performance Impact**: Medium - improves admin filtering
- **Query Patterns**: Used in admin submission management

#### `idx_questionnaire_submissions_processed_created_at` (Composite)
- **Purpose**: Common admin query pattern
- **Usage**: `SELECT * FROM questionnaire_submissions WHERE processed = false ORDER BY created_at DESC`
- **Performance Impact**: High - covers common admin query
- **Query Patterns**: Admin dashboard queries

### 5. Learn_More_Submissions Table Indexes

#### `idx_learn_more_submissions_created_at`
- **Purpose**: Sort submissions by creation date
- **Usage**: `SELECT * FROM learn_more_submissions ORDER BY created_at DESC`
- **Performance Impact**: Medium - improves admin sorting
- **Query Patterns**: Used in admin submission management

#### `idx_learn_more_submissions_email`
- **Purpose**: Email-based queries (future feature)
- **Usage**: `SELECT * FROM learn_more_submissions WHERE email = 'email@example.com'`
- **Performance Impact**: Medium - prepares for future functionality
- **Query Patterns**: Future email-based features

#### `idx_learn_more_submissions_mailing_list`
- **Purpose**: Filter mailing list subscribers
- **Usage**: `SELECT * FROM learn_more_submissions WHERE mailing_list = true`
- **Performance Impact**: Medium - improves subscriber filtering
- **Query Patterns**: Newsletter management

### 6. Advanced Indexes

#### `idx_post_tags_published_posts` (Partial Composite)
- **Purpose**: Optimize tag queries for published posts only
- **Usage**: Complex queries in `TagService.getTags()`
- **Performance Impact**: Very High - optimizes complex tag filtering
- **Query Patterns**: Used in tag service for published posts

#### `idx_posts_fulltext` (GIN)
- **Purpose**: Full-text search on post title and content
- **Usage**: `SELECT * FROM posts WHERE to_tsvector('english', title || ' ' || excerpt) @@ plainto_tsquery('search term')`
- **Performance Impact**: High - enables efficient text search
- **Query Patterns**: Future search functionality

#### `idx_posts_updated_at`
- **Purpose**: Track content changes
- **Usage**: `SELECT * FROM posts ORDER BY updated_at DESC`
- **Performance Impact**: Medium - improves change tracking
- **Query Patterns**: Future content change tracking

## Performance Monitoring

### Index Usage Statistics View

The migration creates an `index_usage_stats` view that provides insights into index performance:

```sql
SELECT * FROM index_usage_stats ORDER BY index_scans DESC;
```

This view shows:
- `index_scans`: Number of times each index was used
- `tuples_read`: Number of tuples read using the index
- `tuples_fetched`: Number of tuples actually returned

### Expected Performance Improvements

1. **Blog Post Retrieval**: 90%+ improvement for slug-based lookups
2. **Blog Listing**: 70%+ improvement for published post queries
3. **Tag Filtering**: 80%+ improvement for tag-based queries
4. **Admin Queries**: 60%+ improvement for submission management
5. **Join Operations**: 85%+ improvement for post-tag relationships

## Maintenance Considerations

### Index Maintenance

1. **Regular Monitoring**: Check index usage statistics monthly
2. **Index Bloat**: Monitor for index bloat and rebuild if necessary
3. **Query Performance**: Monitor slow query logs for new optimization opportunities

### Storage Impact

- **Estimated Storage Increase**: 15-25% of current table sizes
- **Index Maintenance**: Minimal impact on write performance
- **Query Performance**: Significant improvement in read performance

### Backup Considerations

- Indexes are automatically included in database backups
- No additional backup procedures required
- Index recreation time: 5-15 minutes depending on data size

## Migration Instructions

### Applying the Migration

1. **Backup**: Create a database backup before applying
2. **Apply**: Run the migration during low-traffic period
3. **Verify**: Check index creation and usage
4. **Monitor**: Monitor query performance improvements

### Rollback Procedure

If issues arise, use the rollback script:
```sql
-- Run the rollback migration
\i database/migrations/001_create_performance_indexes_rollback.sql
```

## Future Considerations

### Potential Additional Indexes

1. **Search Indexes**: Full-text search on content fields
2. **Date Range Indexes**: For date-based filtering
3. **Composite Indexes**: For complex filtering scenarios

### Monitoring Tools

1. **pg_stat_statements**: For query performance analysis
2. **pg_stat_user_indexes**: For index usage statistics
3. **Custom monitoring**: Application-level performance tracking

## Conclusion

These indexes are designed to provide immediate and significant performance improvements for the most common query patterns in the application. Regular monitoring and maintenance will ensure optimal performance as the application grows. 