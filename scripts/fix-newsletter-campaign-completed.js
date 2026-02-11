#!/usr/bin/env node

/**
 * Mark stuck newsletter campaigns as completed.
 * Usage:
 *   node scripts/fix-newsletter-campaign-completed.js           # fix most recent in-progress campaign
 *   node scripts/fix-newsletter-campaign-completed.js <id>      # fix campaign by ID
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvVars() {
  const envFiles = ['.env.local', '.env.development.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!key.trim().startsWith('#')) process.env[key.trim()] = value;
        }
      });
      break;
    }
  }
}

loadEnvVars();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const campaignIdArg = process.argv[2];

  if (campaignIdArg) {
    const id = parseInt(campaignIdArg, 10);
    if (isNaN(id)) {
      console.error('❌ Invalid campaign ID. Use a number, e.g. node scripts/fix-newsletter-campaign-completed.js 5');
      process.exit(1);
    }
    const { data: row, error: fetchErr } = await supabase
      .from('newsletter_campaign_logs')
      .select('id, subject, total, success_count, error_count, completed_at')
      .eq('id', id)
      .single();

    if (fetchErr || !row) {
      console.error('❌ Campaign not found:', fetchErr?.message || 'No row');
      process.exit(1);
    }
    if (row.completed_at) {
      console.log('ℹ️  Campaign', id, 'is already completed. No change.');
      process.exit(0);
    }
    const { error: updateErr } = await supabase
      .from('newsletter_campaign_logs')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) {
      console.error('❌ Update failed:', updateErr.message);
      process.exit(1);
    }
    console.log('✅ Campaign', id, 'marked as completed:', row.subject || '(no subject)');
    return;
  }

  // No ID: find most recent in-progress campaign
  const { data: inProgress, error: listErr } = await supabase
    .from('newsletter_campaign_logs')
    .select('id, subject, total, success_count, error_count, started_at')
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(10);

  if (listErr) {
    console.error('❌ Failed to list campaigns:', listErr.message);
    process.exit(1);
  }
  if (!inProgress?.length) {
    console.log('ℹ️  No in-progress campaigns found.');
    process.exit(0);
  }

  const target = inProgress[0];
  const { error: updateErr } = await supabase
    .from('newsletter_campaign_logs')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', target.id);

  if (updateErr) {
    console.error('❌ Update failed:', updateErr.message);
    process.exit(1);
  }

  console.log('✅ Marked campaign as completed:');
  console.log('   ID:', target.id);
  console.log('   Subject:', target.subject || '(no subject)');
  console.log('   Total:', target.total, '| Success:', target.success_count, '| Failed:', target.error_count);
  console.log('');
  console.log('To fix a specific campaign by ID: node scripts/fix-newsletter-campaign-completed.js <id>');
}

main();
