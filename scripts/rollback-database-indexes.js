#!/usr/bin/env node

/**
 * Database Index Rollback Script
 * TICKET-14: Database Query Optimization - Task 2
 * 
 * This script provides instructions for rolling back the performance indexes.
 * Since Supabase doesn't support direct SQL execution, we'll provide manual instructions.
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
 * Check if migration has been applied
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
 * Remove migration record
 */
async function removeMigrationRecord(version) {
  try {
    const { error } = await supabase
      .from('schema_migrations')
      .delete()
      .eq('version', version);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Migration ${version} record removed`);
  } catch (error) {
    console.error('❌ Error removing migration record:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Database Index Rollback');
  console.log('==================================');
  console.log('⚠️  IMPORTANT: Supabase doesn\'t support direct SQL execution');
  console.log('   You need to rollback the indexes manually in the Supabase dashboard');
  console.log('');
  
  const migrationVersion = '001_create_performance_indexes';
  
  try {
    // Check if migration is applied
    const isApplied = await isMigrationApplied(migrationVersion);
    if (!isApplied) {
      console.log(`⚠️  Migration ${migrationVersion} has not been applied`);
      console.log('💡 No rollback needed');
      return;
    }
    
    // Read the rollback SQL
    const rollbackSql = readSqlFile('001_create_performance_indexes_rollback.sql');
    
    console.log('\n📋 SQL Rollback to Apply:');
    console.log('==========================');
    console.log(rollbackSql);
    console.log('\n📋 Instructions:');
    console.log('================');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Execute the SQL');
    console.log('5. Run this script again to remove migration record');
    console.log('');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard');
    console.log('📁 Project URL: ' + SUPABASE_URL);
    console.log('');
    console.log('⚠️  WARNING: This will remove all performance indexes!');
    console.log('   This may significantly impact query performance.');
    console.log('');
    console.log('💡 After applying the rollback SQL, run: npm run db:indexes:rollback');
    console.log('   This will remove the migration record');
    
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