const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testConnectionPool() {
  console.log('🧪 Testing Connection Pool Implementation...\n');

  const testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Test 1: Basic connection
  testResults.totalTests++;
  try {
    console.log('Test 1: Basic connection test...');
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Basic connection successful');
    testResults.passed++;
  } catch (error) {
    console.log('❌ Basic connection failed:', error.message);
    testResults.failed++;
    testResults.errors.push(`Basic connection: ${error.message}`);
  }

  // Test 2: Concurrent connections
  testResults.totalTests++;
  try {
    console.log('\nTest 2: Concurrent connections test...');
    const promises = Array.from({ length: 10 }, () =>
      supabase
        .from('posts')
        .select('id')
        .limit(1)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      throw new Error(`${errors.length} concurrent requests failed`);
    }
    
    console.log('✅ Concurrent connections successful (10 requests)');
    testResults.passed++;
  } catch (error) {
    console.log('❌ Concurrent connections failed:', error.message);
    testResults.failed++;
    testResults.errors.push(`Concurrent connections: ${error.message}`);
  }

  // Test 3: Connection pool metrics endpoint
  testResults.totalTests++;
  try {
    console.log('\nTest 3: Connection pool metrics endpoint...');
    const response = await fetch('http://localhost:3000/api/admin/connection-pool');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    console.log('✅ Connection pool metrics endpoint accessible');
    console.log(`   - Total requests: ${data.data.metrics.totalRequests}`);
    console.log(`   - Active connections: ${data.data.metrics.activeConnections}`);
    console.log(`   - Connection errors: ${data.data.metrics.connectionErrors}`);
    console.log(`   - Avg response time: ${data.data.metrics.averageResponseTime.toFixed(0)}ms`);
    
    testResults.passed++;
  } catch (error) {
    console.log('❌ Connection pool metrics endpoint failed:', error.message);
    testResults.failed++;
    testResults.errors.push(`Metrics endpoint: ${error.message}`);
  }

  // Test 4: Performance test
  testResults.totalTests++;
  try {
    console.log('\nTest 4: Performance test...');
    const startTime = Date.now();
    
    const promises = Array.from({ length: 20 }, () =>
      supabase
        .from('posts')
        .select('id, title')
        .limit(5)
    );
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / 20;
    
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      throw new Error(`${errors.length} requests failed during performance test`);
    }
    
    console.log(`✅ Performance test successful`);
    console.log(`   - Total time: ${totalTime}ms`);
    console.log(`   - Average time per request: ${avgTime.toFixed(0)}ms`);
    console.log(`   - Requests per second: ${(20 / (totalTime / 1000)).toFixed(1)}`);
    
    testResults.passed++;
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
    testResults.failed++;
    testResults.errors.push(`Performance test: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total tests: ${testResults.totalTests}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success rate: ${((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Connection pooling is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Make sure your Next.js app is running on localhost:3000');
  console.log('- Check that all environment variables are set correctly');
  console.log('- Monitor the connection pool metrics in the admin dashboard');
}

// Run the test
testConnectionPool().catch(console.error); 