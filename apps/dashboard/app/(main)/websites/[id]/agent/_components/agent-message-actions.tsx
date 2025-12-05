"use client";

import {
	ArrowsClockwiseIcon,
	CheckIcon,
	CopyIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAgentChat } from "./hooks/use-agent-chat";

interface AgentMessageActionsProps {
	messageContent: string;
	isLastMessage?: boolean;
	isError?: boolean;
}

export function AgentMessageActions({
	messageContent,
	isLastMessage = false,
	isError = false,
}: AgentMessageActionsProps) {
	const [feedbackGiven, setFeedbackGiven] = useState<
		"positive" | "negative" | null
	>(null);
	const [copied, setCopied] = useState(false);
	const { retry, isLoading } = useAgentChat();

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(messageContent);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Silently fail - the UI will show the error state
		}
	};

	const handleRegenerate = () => {
		if (isLoading) return;
		retry();
	};

	const handlePositive = () => {
		if (feedbackGiven === "positive") {
			setFeedbackGiven(null);
			return;
		}
		setFeedbackGiven("positive");
	};

	const handleNegative = () => {
		if (feedbackGiven === "negative") {
			setFeedbackGiven(null);
			return;
		}
		setFeedbackGiven("negative");
	};

	return (
		<div className="flex items-center gap-1">
			<TooltipProvider delayDuration={200}>
				{/* Copy Button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleCopy}
							className="flex items-center justify-center w-6 h-6 transition-colors duration-200 hover:bg-muted"
						>
							{copied ? (
								<CheckIcon className="size-3.5 animate-in zoom-in-50 duration-200" />
							) : (
								<CopyIcon className="size-3 text-muted-foreground hover:text-foreground" />
							)}
						</button>
					</TooltipTrigger>
					<TooltipContent className="px-2 py-1 text-xs">
						{copied ? "Copied!" : "Copy response"}
					</TooltipContent>
				</Tooltip>

				{/* Regenerate Button - Only show for last message */}
				{isLastMessage && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								disabled={isLoading}
								onClick={handleRegenerate}
								className="flex items-center justify-center w-6 h-6 transition-colors duration-200 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<ArrowsClockwiseIcon
									className={cn(
										"size-3.5 text-muted-foreground hover:text-foreground transition-transform",
										isLoading && "animate-spin"
									)}
								/>
							</button>
						</TooltipTrigger>
						<TooltipContent className="px-2 py-1 text-xs">
							{isError ? "Retry response" : "Retry response"}
						</TooltipContent>
					</Tooltip>
				)}

				{/* Positive Feedback */}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handlePositive}
							className="flex items-center justify-center w-6 h-6 transition-colors duration-200 hover:bg-muted"
						>
							<ThumbsUpIcon
								className={cn(
									"w-3 h-3",
									feedbackGiven === "positive"
										? "fill-foreground text-foreground"
										: "text-muted-foreground hover:text-foreground"
								)}
							/>
						</button>
					</TooltipTrigger>
					<TooltipContent className="px-2 py-1 text-xs">
						{feedbackGiven === "positive"
							? "Remove positive feedback"
							: "Positive feedback"}
					</TooltipContent>
				</Tooltip>

				{/* Negative Feedback */}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleNegative}
							className="flex items-center justify-center w-6 h-6 transition-colors duration-200 hover:bg-muted"
						>
							<ThumbsDownIcon
								className={cn(
									"w-3 h-3",
									feedbackGiven === "negative"
										? "fill-foreground text-foreground"
										: "text-muted-foreground hover:text-foreground"
								)}
							/>
						</button>
					</TooltipTrigger>
					<TooltipContent className="px-2 py-1 text-xs">
						{feedbackGiven === "negative"
							? "Remove negative feedback"
							: "Negative feedback"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
