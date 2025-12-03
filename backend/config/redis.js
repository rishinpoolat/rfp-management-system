import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✓ Redis: Connected to Redis server');
});

redis.on('error', (err) => {
  console.error('✗ Redis: Connection error:', err.message);
});

redis.on('ready', () => {
  console.log('✓ Redis: Client ready');
});

// Cache helper functions
export const cacheService = {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any>} Parsed JSON data or null
   */
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cache data with expiration
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key, value, ttl = 300) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete cached data
   * @param {string} key - Cache key or pattern
   */
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'rfps:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Redis DEL pattern error for ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiration on existing key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    try {
      await redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      return false;
    }
  },
};

// Cache key generators
export const cacheKeys = {
  rfp: (id) => `rfp:${id}`,
  rfpList: () => 'rfps:all',
  vendor: (id) => `vendor:${id}`,
  vendorList: () => 'vendors:all',
  proposal: (id) => `proposal:${id}`,
  proposalsByRfp: (rfpId) => `proposals:rfp:${rfpId}`,
  comparison: (rfpId) => `comparison:rfp:${rfpId}`,
};

export default redis;
