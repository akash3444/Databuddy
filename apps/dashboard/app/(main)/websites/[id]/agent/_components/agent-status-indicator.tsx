"use client";

import {
	BrainIcon,
	ChartBarIcon,
	CircleNotchIcon,
	MagnifyingGlassIcon,
	SparkleIcon,
	TableIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAgentChat } from "./hooks/use-agent-chat";
import { useChatStatus } from "./hooks/use-chat-status";

const STATUS_ICONS: Record<string, typeof SparkleIcon> = {
	routing: BrainIcon,
	thinking: BrainIcon,
	analyzing: MagnifyingGlassIcon,
	searching: MagnifyingGlassIcon,
	generating: SparkleIcon,
	visualizing: ChartBarIcon,
};

const TOOL_ICONS: Record<string, typeof SparkleIcon> = {
	analyze_traffic: ChartBarIcon,
	analyze_sources: ChartBarIcon,
	analyze_funnel: ChartBarIcon,
	generate_report: TableIcon,
	create_chart: ChartBarIcon,
	get_top_pages: TableIcon,
	get_events: TableIcon,
	get_sessions: TableIcon,
	find_anomalies: MagnifyingGlassIcon,
	find_insights: SparkleIcon,
	compare_periods: ChartBarIcon,
};

export function AgentStatusIndicator() {
	const { messages, status, hasError } = useAgentChat();
	const { displayMessage, currentToolCall, agentStatus, isStreaming } =
		useChatStatus(messages, status);

	if (!(displayMessage || isStreaming || hasError)) return null;

	const Icon = currentToolCall
		? (TOOL_ICONS[currentToolCall] ?? SparkleIcon)
		: (STATUS_ICONS[agentStatus] ?? SparkleIcon);

	return (
		<div className="h-8 flex items-center">
			<AnimatePresence mode="wait">
				{hasError ? (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center gap-1.5"
						exit={{ opacity: 0, x: -10 }}
						initial={{ opacity: 0, x: 10 }}
						key="error"
						transition={{ duration: 0.2 }}
					>
						<WarningIcon
							className="size-3 text-destructive shrink-0"
							weight="fill"
						/>
						<span className="text-destructive text-xs">Request failed</span>
					</motion.div>
				) : displayMessage ? (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center gap-1.5 text-muted-foreground"
						exit={{ opacity: 0, x: -10 }}
						initial={{ opacity: 0, x: 10 }}
						key={displayMessage}
						transition={{ duration: 0.2 }}
					>
						{Icon && (
							<Icon
								className="size-3 shrink-0 text-current"
								weight="duotone"
							/>
						)}
						<span className="text-xs font-normal">{displayMessage}</span>
					</motion.div>
				) : isStreaming ? (
					<motion.div
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						key="loader"
					>
						<CircleNotchIcon
							className="size-4 animate-spin text-muted-foreground"
							weight="bold"
						/>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export function ShimmerText({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"relative inline-block overflow-hidden",
				"bg-linear-to-r from-foreground/50 via-foreground to-foreground/50",
				"bg-size-[200%_100%] bg-clip-text text-transparent",
				"animate-shimmer",
				className
			)}
		>
			{text}
		</span>
	);
}
