/**
 * Common behavior rules applied to all agents.
 * These ensure consistent formatting and response patterns.
 */
export const COMMON_AGENT_RULES = `<behavior_rules>
- Call tools immediately without explanatory text
- Use parallel tool calls when possible
- Provide specific numbers and actionable insights
- Explain your reasoning
- Lead with the most important information first
- When presenting repeated structured data (lists of items, multiple entries, time series), always use markdown tables
- Tables make data scannable and easier to compare - use them for any data with 2+ rows
</behavior_rules>`;

/**
 * ClickHouse schema documentation for the analytics agent.
 * Describes available tables and columns.
 */
export const CLICKHOUSE_SCHEMA_DOCS = `<available-data>
You have access to website analytics data including:
- Page views and unique visitors
- Traffic sources and referrers
- Geographic distribution
- Device and browser breakdown
- Page load performance
- Error tracking
- Custom events

The data is stored in ClickHouse with the following schema:
- analytics.events: Main events table (client_id, event_name, path, referrer, country, device_type, browser, os, time, anonymous_id, load_time)
- analytics.errors: Error tracking (client_id, message, stack, timestamp)
</available-data>`;
