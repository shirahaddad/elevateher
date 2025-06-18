# Database Optimization - TICKET-14

This directory contains the database optimization files for **TICKET-14: Database Query Optimization**.

## Overview

The database optimization includes:
- **Performance Indexes**: 23 strategic indexes for frequently queried fields
- **Migration Scripts**: Automated scripts to apply and rollback indexes
- **Documentation**: Comprehensive documentation of all indexes and their purposes
- **Monitoring Tools**: Views and scripts to monitor index performance

## Quick Start

### Apply Database Indexes

```bash
# Apply all performance indexes
npm run db:indexes
```

### Rollback Database Indexes

```bash
# Remove all performance indexes (if needed)
npm run db:indexes:rollback
```

## File Structure

```
database/
├── migrations/
│   ├── 001_create_performance_indexes.sql          # Main migration
│   └── 001_create_performance_indexes_rollback.sql # Rollback migration
├── docs/
│   └── performance_indexes.md                      # Comprehensive documentation
└── README.md                                       # This file
```

## Index Categories

### 1. Posts Table (7 indexes)
- **Critical**: `idx_posts_slug` (UNIQUE) - 90%+ performance improvement
- **High Impact**: `idx_posts_published_at_is_published` (Composite)
- **Optimized**: `idx_posts_published_only` (Partial index)

### 2. Tags Table (2 indexes)
- **Unique**: `idx_tags_name` - Prevents duplicates and speeds lookups
- **Performance**: `idx_tags_id` - Improves IN clause performance

### 3. Post_Tags Table (4 indexes)
- **Join Optimization**: `idx_post_tags_post_id_tag_id` (Composite)
- **Relationship Lookups**: Individual indexes for post_id and tag_id

### 4. Submissions Tables (7 indexes)
- **Admin Queries**: Optimized for submission management
- **Future Features**: Prepared for email-based queries

### 5. Advanced Indexes (3 indexes)
- **Search**: Full-text search index for future functionality
- **Complex Queries**: Partial indexes for specific query patterns

## Expected Performance Improvements

| Query Type | Improvement | Impact |
|------------|-------------|---------|
| Blog Post Retrieval | 90%+ | Critical |
| Blog Listing | 70%+ | High |
| Tag Filtering | 80%+ | High |
| Admin Queries | 60%+ | Medium |
| Join Operations | 85%+ | High |

## Monitoring Performance

### Check Index Usage

```sql
-- View index usage statistics
SELECT * FROM index_usage_stats ORDER BY index_scans DESC;
```

### Monitor Query Performance

```sql
-- Check for slow queries (requires pg_stat_statements extension)
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Verify Index Creation

```sql
-- List all indexes on specific tables
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('posts', 'tags', 'post_tags', 'questionnaire_submissions', 'learn_more_submissions')
ORDER BY tablename, indexname;
```

## Migration Process

### Before Applying

1. **Backup Database**: Create a backup before applying indexes
2. **Low Traffic**: Apply during low-traffic periods
3. **Test Environment**: Test on staging environment first

### During Application

1. **Run Migration**: `npm run db:indexes`
2. **Monitor Progress**: Watch for any errors
3. **Verify Indexes**: Check that all indexes were created

### After Applying

1. **Monitor Performance**: Check query performance improvements
2. **Watch for Issues**: Monitor for any unexpected behavior
3. **Update Documentation**: Document any issues or observations

## Troubleshooting

### Common Issues

#### Index Already Exists
```
Error: relation "idx_posts_slug" already exists
```
**Solution**: The migration uses `IF NOT EXISTS`, so this shouldn't occur. If it does, check for conflicting indexes.

#### Permission Denied
```
Error: permission denied for function exec_sql
```
**Solution**: Ensure you're using the service role key, not the anon key.

#### Migration Already Applied
```
Migration 001_create_performance_indexes has already been applied
```
**Solution**: The script prevents duplicate applications. If you need to reapply, run the rollback first.

### Performance Issues

#### Index Not Being Used
If an index isn't being used, check:
1. Query structure matches index design
2. Index selectivity (unique values vs total rows)
3. Query planner decisions

#### Slow Index Creation
Large tables may take time to create indexes:
1. Monitor progress in database logs
2. Consider creating indexes during maintenance windows
3. Use `CONCURRENTLY` for production tables (if supported)

## Maintenance

### Regular Tasks

1. **Monthly**: Check index usage statistics
2. **Quarterly**: Review query performance
3. **Annually**: Consider additional optimizations

### Index Maintenance

```sql
-- Rebuild indexes if they become bloated
REINDEX INDEX idx_posts_slug;

-- Analyze table statistics
ANALYZE posts;
```

## Future Considerations

### Additional Optimizations

1. **Query Optimization**: Task 4 of TICKET-14
2. **Connection Pooling**: Task 1 of TICKET-14
3. **Query Caching**: Task 3 of TICKET-14

### Monitoring Tools

1. **pg_stat_statements**: Query performance analysis
2. **Custom Metrics**: Application-level performance tracking
3. **Alerting**: Automated performance alerts

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the comprehensive documentation in `docs/performance_indexes.md`
3. Monitor the database logs for detailed error information

## Related Tickets

- **TICKET-14**: Database Query Optimization (Current)
- **TICKET-15**: Client-side Performance
- **TICKET-16**: Server-side Performance

---

**Note**: This optimization is part of a larger performance improvement initiative. Monitor the overall application performance to ensure these database improvements translate to better user experience. 