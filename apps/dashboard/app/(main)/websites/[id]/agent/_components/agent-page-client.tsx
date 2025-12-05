"use client";

import type { UIMessage } from "ai";
import { AgentPageContent } from "./agent-page-content";

const DEBUG_PREFIX = "[AGENT-PAGE-CLIENT]";

interface AgentPageClientProps {
	chatId: string;
	websiteId: string;
	initialMessages?: UIMessage[];
}

export function AgentPageClient({
	chatId,
	websiteId,
	initialMessages = []
}: AgentPageClientProps) {
	console.log(`${DEBUG_PREFIX} Component render:`, {
		chatId,
		websiteId,
		initialMessagesCount: initialMessages.length,
	});

	return (
		<div className="relative flex h-full flex-col">
			<AgentPageContent chatId={chatId} websiteId={websiteId} />
		</div>
	);
}

