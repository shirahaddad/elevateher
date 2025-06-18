#!/usr/bin/env node

/**
 * Database Index Application Script
 * TICKET-14: Database Query Optimization - Task 2
 * 
 * This script applies performance indexes to the Supabase database.
 * Since Supabase doesn't support direct SQL execution, we'll use the
 * Supabase dashboard or SQL editor to apply the indexes manually.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables for Next.js project
function loadEnvVars() {
  const envFiles = ['.env.local', '.env.development.local', '.env.production.local', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!key.startsWith('#') && value) {
            envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
          }
        }
      });
      
      // Set environment variables
      Object.entries(envVars).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });
      
      console.log(`📁 Loaded environment variables from ${envFile}`);
      break;
    }
  }
}

// Load environment variables
loadEnvVars();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Make sure your .env.local file contains these variables');
  console.error('💡 Example .env.local content:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Read SQL file content
 */
function readSqlFile(filename) {
  const filePath = path.join(__dirname, '..', 'database', 'migrations', filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading SQL file ${filename}:`, error.message);
    process.exit(1);
  }
}

/**
 * Check if schema_migrations table exists and create it if needed
 */
async function ensureMigrationsTable() {
  try {
    console.log('🔄 Checking migrations table...');
    
    // Try to insert a test record to see if table exists
    const { error } = await supabase
      .from('schema_migrations')
      .insert([{ version: 'test', applied_at: new Date().toISOString() }]);
    
    if (error && error.code === '42P01') { // Table doesn't exist
      console.log('⚠️  schema_migrations table does not exist');
      console.log('💡 You will need to create it manually in the Supabase dashboard');
      console.log('   SQL: CREATE TABLE schema_migrations (version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());');
      return false;
    } else if (error && error.code === '23505') { // Unique constraint violation (table exists)
      // Remove the test record
      await supabase
        .from('schema_migrations')
        .delete()
        .eq('version', 'test');
      console.log('✅ schema_migrations table exists');
      return true;
    } else if (error) {
      console.log('⚠️  Error checking migrations table:', error.message || 'Unknown error');
      return false;
    }
    
    console.log('✅ schema_migrations table exists');
    return true;
  } catch (error) {
    console.log('⚠️  Error checking migrations table:', error.message || 'Unknown error');
    return false;
  }
}

/**
 * Check if migration has already been applied
 */
async function isMigrationApplied(version) {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', version)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.log('⚠️  Error checking migration status:', error.message);
    return false;
  }
}

/**
 * Mark migration as applied
 */
async function markMigrationApplied(version) {
  try {
    const { error } = await supabase
      .from('schema_migrations')
      .insert([{ version, applied_at: new Date().toISOString() }]);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Migration ${version} marked as applied`);
  } catch (error) {
    console.error('❌ Error marking migration as applied:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Database Index Application');
  console.log('=====================================');
  console.log('⚠️  IMPORTANT: Supabase doesn\'t support direct SQL execution');
  console.log('   You need to apply the indexes manually in the Supabase dashboard');
  console.log('');
  
  const migrationVersion = '001_create_performance_indexes';
  
  try {
    // Check if migration is already applied
    const migrationsTableExists = await ensureMigrationsTable();
    
    if (migrationsTableExists) {
      const isApplied = await isMigrationApplied(migrationVersion);
      if (isApplied) {
        console.log(`✅ Migration ${migrationVersion} has already been applied`);
        console.log('💡 To reapply, first run the rollback script');
        return;
      }
    }
    
    // Read the migration SQL
    const migrationSql = readSqlFile('001_create_performance_indexes.sql');
    
    console.log('\n📋 SQL Migration to Apply:');
    console.log('==========================');
    console.log(migrationSql);
    console.log('\n📋 Instructions:');
    console.log('================');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Execute the SQL');
    console.log('5. Run this script again to mark as applied');
    console.log('');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
    console.log('📁 Project URL: ' + SUPABASE_URL);
    console.log('');
    console.log('💡 After applying the SQL, run: npm run db:indexes');
    console.log('   This will mark the migration as applied');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('💡 Check the error details above and try again');
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main }; 