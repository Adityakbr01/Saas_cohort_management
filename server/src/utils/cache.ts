import { env_config } from "@/configs/env";
import NodeCache from "node-cache";

const defaultTtl = parseInt(env_config.CACHE_TTL as string || process.env.CACHE_TTL || "600", 10); // 600 seconds = 10 mins
const cache = new NodeCache({
  stdTTL: defaultTtl,
  checkperiod: 120,
  useClones: false,
});

// ✅ Wrapper functions
const safeCache = {
  get<T>(key: string): T | null {
    try {
      const value = cache.get<T>(key);
      return value ?? null;
    } catch (err) {
      console.error(`Cache get error for key "${key}":`, err);
      return null;
    }
  },

  set<T>(key: string, value: T, ttlInSec?: number): boolean {
    try {
      return cache.set<T>(key, value, ttlInSec ?? defaultTtl);
    } catch (err) {
      console.error(`Cache set error for key "${key}":`, err);
      return false;
    }
  },

  del(key: string): void {
    try {
      cache.del(key);
    } catch (err) {
      console.error(`Cache delete error for key "${key}":`, err);
    }
  },

  flush(): void {
    try {
      cache.flushAll();
    } catch (err) {
      console.error("Cache flush error:", err);
    }
  },
};

export default safeCache;
