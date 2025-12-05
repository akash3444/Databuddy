import { models } from "../config";
import { buildAnalyticsInstructions } from "../prompts";
import { analyticsTools } from "../tools";
import { createAgent } from "./factory";

/**
 * Analytics specialist agent.
 * Handles website traffic analysis, user behavior, and performance metrics.
 */
export const analyticsAgent = createAgent({
	name: "analytics",
	model: models.analytics,
	temperature: 0.3,
	instructions: buildAnalyticsInstructions,
	tools: analyticsTools,
	maxTurns: 10,
});
