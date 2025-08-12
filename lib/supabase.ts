import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Connection pool configuration
const CONNECTION_POOL_CONFIG = {
  // Maximum number of connections in the pool
  maxConnections: 20,
  // Minimum number of connections to keep open
  minConnections: 5,
  // Connection timeout in milliseconds
  connectionTimeout: 30000,
  // Idle timeout in milliseconds
  idleTimeout: 60000,
  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,
};

// Performance monitoring
interface ConnectionMetrics {
  totalRequests: number;
  activeConnections: number;
  connectionErrors: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

const metrics: ConnectionMetrics = {
  totalRequests: 0,
  activeConnections: 0,
  connectionErrors: 0,
  averageResponseTime: 0,
  lastRequestTime: Date.now(),
};

// Enhanced Supabase client with connection pooling optimizations
const createOptimizedClient = (url: string, key: string, isAdmin = false): SupabaseClient => {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: !isAdmin,
      persistSession: !isAdmin,
      detectSessionInUrl: !isAdmin,
    },
    global: {
      headers: {
        'X-Client-Info': 'elevateher-optimized',
      },
    },
    db: {
      schema: 'public',
    },
    // Connection pooling optimizations
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

// Create optimized clients
export const supabase = createOptimizedClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createOptimizedClient(supabaseUrl, supabaseServiceKey || '', true);

// Connection pool management utilities
export class ConnectionPoolManager {
  private static instance: ConnectionPoolManager;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHealthCheck();
  }

  static getInstance(): ConnectionPoolManager {
    if (!ConnectionPoolManager.instance) {
      ConnectionPoolManager.instance = new ConnectionPoolManager();
    }
    return ConnectionPoolManager.instance;
  }

  // Get current connection metrics
  getMetrics(): ConnectionMetrics {
    return { ...metrics };
  }

  // Track a database operation
  trackOperation<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    metrics.totalRequests++;
    metrics.lastRequestTime = startTime;
    metrics.activeConnections = Math.min(
      metrics.activeConnections + 1,
      CONNECTION_POOL_CONFIG.maxConnections
    );

    return operation()
      .then((result) => {
        const responseTime = Date.now() - startTime;
        metrics.averageResponseTime = 
          (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
        metrics.activeConnections = Math.max(metrics.activeConnections - 1, 0);
        return result;
      })
      .catch((error) => {
        metrics.connectionErrors++;
        metrics.activeConnections = Math.max(metrics.activeConnections - 1, 0);
        throw error;
      });
  }

  // Health check for connection pool
  private async startHealthCheck(): Promise<void> {
    this.healthCheckInterval = setInterval(async () => {
      try {
        // Simple health check query
        const result = await this.trackOperation(async () => {
          const { data, error } = await supabaseAdmin
            .from('posts')
            .select('id')
            .limit(1);
          return { data, error };
        });
        
        if (result.error) {
          console.warn('Connection pool health check failed:', result.error.message);
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Wait for active connections to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Connection pool manager shutdown complete');
  }

  // Get pool status
  getPoolStatus() {
    return {
      config: CONNECTION_POOL_CONFIG,
      metrics,
      health: {
        isHealthy: metrics.connectionErrors < 10,
        lastCheck: new Date(metrics.lastRequestTime).toISOString(),
      },
    };
  }
}

// Initialize connection pool manager
export const connectionPool = ConnectionPoolManager.getInstance();

// Export configuration for external use
export const poolConfig = CONNECTION_POOL_CONFIG;

// Utility function to get optimized client based on context
export const getSupabaseClient = (isAdmin = false): SupabaseClient => {
  return isAdmin ? supabaseAdmin : supabase;
};

// Performance monitoring utilities
export const getPerformanceMetrics = () => {
  return {
    ...metrics,
    poolStatus: connectionPool.getPoolStatus(),
  };
};

// Wrapper function for database operations with connection tracking
export const withConnectionTracking = <T>(
  operation: () => Promise<T>
): Promise<T> => {
  return connectionPool.trackOperation(operation);
};

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await connectionPool.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await connectionPool.shutdown();
    process.exit(0);
  });
} 