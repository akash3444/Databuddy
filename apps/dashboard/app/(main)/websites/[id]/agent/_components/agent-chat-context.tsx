"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

interface AgentChatContextValue {
	chatId: string;
	setChatId: (id: string) => void;
}

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

export function AgentChatProvider({
	chatId,
	children,
}: {
	chatId: string;
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const setChatId = (id: string) => {
		const params = new URLSearchParams(window.location.search);
		params.set("chatId", id);
		window.history.pushState({}, "", `${pathname}?${params.toString()}`);
	};

	return (
		<AgentChatContext.Provider value={{ chatId, setChatId }}>
			{children}
		</AgentChatContext.Provider>
	);
}

export function useAgentChatId(): string {
	const context = useContext(AgentChatContext);
	if (!context) {
		throw new Error("useAgentChatId must be used within AgentChatProvider");
	}
	return context.chatId;
}

export function useSetAgentChatId(): (id: string) => void {
	const context = useContext(AgentChatContext);
	if (!context) {
		throw new Error("useSetAgentChatId must be used within AgentChatProvider");
	}
	return context.setChatId;
}

