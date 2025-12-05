"use client";

import { useMemo, useEffect, useRef } from "react";
import { useQueryState } from "nuqs";
import { generateId } from "ai";
import { useChatActions } from "@ai-sdk-tools/store";
import { AgentPageContent } from "./agent-page-content";

interface AgentPageClientProps {
	chatId: string | null;
	websiteId: string;
}

export function AgentPageClient({ chatId, websiteId }: AgentPageClientProps) {
	const [queryChatId] = useQueryState("chatId");
	const { reset } = useChatActions();
	const prevChatIdRef = useRef<string | null>(queryChatId);

	const stableChatId = useMemo(
		() => queryChatId ?? chatId ?? generateId(),
		[queryChatId, chatId]
	);

	useEffect(() => {
		const prevChatId = prevChatIdRef.current;
		if (prevChatId && prevChatId !== queryChatId) {
			reset();
		}
		prevChatIdRef.current = queryChatId;
	}, [queryChatId, reset]);

	return (
		<div className="relative flex h-full flex-col">
			<AgentPageContent chatId={stableChatId} websiteId={websiteId} />
		</div>
	);
}

