import { createCached } from "@ai-sdk-tools/cache";
import { redis } from "@databuddy/redis";

/**
 * Cache backend for AI SDK tools
 * - Uses Redis in production for distributed caching
 * - Falls back to LRU cache in development if Redis is unavailable
 */
const cacheBackend = createCached({
	cache: redis,
	ttl: 30 * 60 * 1000, // 30 minutes
})

/**
 * Cached wrapper for AI SDK tools
 *
 * @example
 * ```ts
 * const weatherTool = cached(tool({
 *   description: 'Get weather data',
 *   execute: async ({ location }) => {
 *     // Expensive API call
 *     return await weatherAPI.get(location)
 *   }
 * }), {
 *   ttl: 15 * 60 * 1000, // Cache for 15 minutes
 * })
 * ```
 */
export const cached = createCached({
	cache: cacheBackend,
});

/**
 * Pre-configured cache options for different use cases
 */
export const cacheOptions = {
	/** Short TTL for frequently changing data (5 minutes) */
	short: { ttl: 5 * 60 * 1000 },

	/** Medium TTL for moderately stable data (15 minutes) */
	medium: { ttl: 15 * 60 * 1000 },

	/** Long TTL for stable data (1 hour) */
	long: { ttl: 60 * 60 * 1000 },

	/** Very long TTL for rarely changing data (24 hours) */
	veryLong: { ttl: 24 * 60 * 60 * 1000 },

	/** Custom TTL generator based on parameters */
	custom: (getTTL: (params: any) => number) => ({
		ttl: (params: any) => getTTL(params),
	}),

	/** Conditional caching based on result */
	conditional: (shouldCache: (result: any) => boolean) => ({
		shouldCache: (result: any) => shouldCache(result),
	}),
} as const;
