/**
 * AI module - centralized exports for agent system.
 *
 * Structure:
 * - config/   - Model, memory, and context configuration
 * - agents/   - Agent definitions (triage, analytics, etc.)
 * - prompts/  - System prompts and instructions
 * - tools/    - Tool implementations for agents
 */

// Config exports
export {
	models,
	openrouter,
	memoryProvider,
	defaultMemoryConfig,
	buildAppContext,
	formatContextForLLM,
	type AppContext,
	type ModelKey,
} from "./config";

// Agent exports
export { createAgent, triageAgent, mainAgent, analyticsAgent } from "./agents";

// Tool exports
export { analyticsTools, executeSqlQueryTool, getTopPagesTool } from "./tools";

// Prompt exports (for customization/testing)
export {
	COMMON_AGENT_RULES,
	CLICKHOUSE_SCHEMA_DOCS,
	buildTriageInstructions,
	buildAnalyticsInstructions,
} from "./prompts";

// Type exports
export type {
	UIChatMessage,
	UITools,
	ChatMessageMetadata,
	MessageDataParts,
} from "./types";
