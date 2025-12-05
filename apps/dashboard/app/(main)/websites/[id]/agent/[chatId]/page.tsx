import type { UIMessage } from "ai";
import { Suspense } from "react";
import { getServerRPCClient } from "@/lib/orpc-server";
import { AgentPageClient } from "../_components/agent-page-client";
import { ChatProviderWrapper } from "../_components/chat-provider-wrapper";

type Props = {
	params: Promise<{ id: string; chatId: string }>;
};

const DEBUG_PREFIX = "[AGENT-PAGE]";

export default async function AgentPage(props: Props) {
	const { id, chatId } = await props.params;

	console.log(`${DEBUG_PREFIX} Server component render:`, { id, chatId });

	const rpcClient = await getServerRPCClient();
	const chat = await rpcClient.agent.getMessages({ chatId, websiteId: id });

	const initialMessages = (chat?.messages ?? []) as UIMessage[];

	console.log(`${DEBUG_PREFIX} Fetched messages:`, {
		chatId,
		websiteId: id,
		messagesCount: initialMessages.length,
		messages: initialMessages.map(m => ({ id: m.id, role: m.role, textLength: m.parts?.find(p => p.type === "text")?.text?.length || 0 }))
	});

	return (
		// <FeatureGate feature={GATED_FEATURES.AI_AGENT}>
			<ChatProviderWrapper chatId={chatId} initialMessages={initialMessages}>
				<Suspense fallback={<AgentPageSkeleton />}>
					<AgentPageClient
						chatId={chatId}
						initialMessages={initialMessages}
						websiteId={id}
					/>
				</Suspense>
			</ChatProviderWrapper>
		// </FeatureGate>
	);
}

function AgentPageSkeleton() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="animate-pulse text-muted-foreground text-sm">
				Loading agent...
			</div>
		</div>
	);
}
