const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testCache() {
  console.log('🧪 Testing Application Cache Implementation...\n');

  try {
    // Test 1: Initial cache stats (should be empty)
    console.log('📊 Test 1: Initial Cache Statistics');
    const initialStats = await fetch(`${BASE_URL}/api/admin/cache`).then(r => r.json());
    console.log('Initial stats:', {
      hits: initialStats.data.hits,
      misses: initialStats.data.misses,
      size: initialStats.data.size,
      hitRate: initialStats.data.hitRatePercentage
    });

    // Test 2: First request to blog posts (should be a miss)
    console.log('\n📝 Test 2: First Blog Posts Request (Cache Miss)');
    const start1 = Date.now();
    const blogResponse1 = await fetch(`${BASE_URL}/api/v1/blog`);
    const blogData1 = await blogResponse1.json();
    const time1 = Date.now() - start1;
    console.log(`Response time: ${time1}ms`);
    console.log(`Posts returned: ${blogData1.data?.data?.length || 0}`);

    // Test 3: Second request to blog posts (should be a hit)
    console.log('\n⚡ Test 3: Second Blog Posts Request (Cache Hit)');
    const start2 = Date.now();
    const blogResponse2 = await fetch(`${BASE_URL}/api/v1/blog`);
    const blogData2 = await blogResponse2.json();
    const time2 = Date.now() - start2;
    console.log(`Response time: ${time2}ms`);
    console.log(`Posts returned: ${blogData2.data?.data?.length || 0}`);
    console.log(`Performance improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}% faster`);

    // Test 4: Request with different parameters (should be a miss)
    console.log('\n🏷️ Test 4: Blog Posts with Tag Filter (Cache Miss)');
    const start3 = Date.now();
    const blogResponse3 = await fetch(`${BASE_URL}/api/v1/blog?tag=coaching`);
    const blogData3 = await blogResponse3.json();
    const time3 = Date.now() - start3;
    console.log(`Response time: ${time3}ms`);
    console.log(`Posts returned: ${blogData3.data?.data?.length || 0}`);

    // Test 5: Tags request (should be a miss initially)
    console.log('\n🏷️ Test 5: Tags Request (Cache Miss)');
    const start4 = Date.now();
    const tagsResponse1 = await fetch(`${BASE_URL}/api/v1/blog/tags`);
    const tagsData1 = await tagsResponse1.json();
    const time4 = Date.now() - start4;
    console.log(`Response time: ${time4}ms`);
    console.log(`Tags returned: ${tagsData1.data?.length || 0}`);

    // Test 6: Second tags request (should be a hit)
    console.log('\n⚡ Test 6: Second Tags Request (Cache Hit)');
    const start5 = Date.now();
    const tagsResponse2 = await fetch(`${BASE_URL}/api/v1/blog/tags`);
    const tagsData2 = await tagsResponse2.json();
    const time5 = Date.now() - start5;
    console.log(`Response time: ${time5}ms`);
    console.log(`Tags returned: ${tagsData2.data?.length || 0}`);
    console.log(`Performance improvement: ${((time4 - time5) / time4 * 100).toFixed(1)}% faster`);

    // Test 7: Final cache statistics
    console.log('\n📊 Test 7: Final Cache Statistics');
    const finalStats = await fetch(`${BASE_URL}/api/admin/cache`).then(r => r.json());
    console.log('Final stats:', {
      hits: finalStats.data.hits,
      misses: finalStats.data.misses,
      size: finalStats.data.size,
      hitRate: finalStats.data.hitRatePercentage
    });

    // Test 8: Cache invalidation
    console.log('\n🗑️ Test 8: Cache Invalidation');
    const clearResponse = await fetch(`${BASE_URL}/api/admin/cache`, { method: 'DELETE' });
    const clearResult = await clearResponse.json();
    console.log('Cache cleared:', clearResult.success);

    // Test 9: Post-clear statistics
    console.log('\n📊 Test 9: Post-Clear Cache Statistics');
    const postClearStats = await fetch(`${BASE_URL}/api/admin/cache`).then(r => r.json());
    console.log('Post-clear stats:', {
      hits: postClearStats.data.hits,
      misses: postClearStats.data.misses,
      size: postClearStats.data.size,
      hitRate: postClearStats.data.hitRatePercentage
    });

    console.log('\n✅ Cache testing completed successfully!');
    console.log('\n📈 Expected Results:');
    console.log('- Initial requests should be cache misses');
    console.log('- Subsequent requests should be cache hits');
    console.log('- Cached responses should be faster');
    console.log('- Cache invalidation should clear all entries');

  } catch (error) {
    console.error('❌ Cache testing failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCache(); 