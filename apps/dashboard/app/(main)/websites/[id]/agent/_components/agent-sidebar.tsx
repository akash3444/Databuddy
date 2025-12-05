"use client";

import { ClockIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { generateId } from "ai";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAgentChat } from "./hooks/use-agent-chat";

interface AgentSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

// Placeholder chat history - can be replaced with real data later
const PLACEHOLDER_CHATS = [
	{
		id: "1",
		title: "Traffic analysis overview",
		timestamp: "2 hours ago",
	},
	{
		id: "2",
		title: "Bounce rate investigation",
		timestamp: "Yesterday",
	},
	{
		id: "3",
		title: "Weekly performance report",
		timestamp: "3 days ago",
	},
];

export function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
	const router = useRouter();
	const { id } = useParams();
	const { reset } = useAgentChat();

	const handleNewChat = () => {
		reset();
		const newChatId = generateId();
		router.push(`/websites/${id}/agent/${newChatId}`);
		onClose();
	};

	const handleSelectChat = (chatId: string) => {
		router.push(`/websites/${id}/agent/${chatId}`);
		onClose();
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className={cn(
					"fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
					isOpen ? "opacity-100" : "pointer-events-none opacity-0"
				)}
				onClick={onClose}
			/>

			{/* Sidebar */}
			<div
				className={cn(
					"fixed top-0 bottom-0 left-0 z-50 w-[280px] border-border border-r bg-sidebar",
					"transition-transform duration-300 ease-out",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Header */}
				<div className="flex h-14 items-center justify-between border-border border-b px-4">
					<h2 className="font-semibold text-sm">Chat History</h2>
					<Button
						className="size-8"
						onClick={onClose}
						size="icon"
						variant="ghost"
					>
						<XIcon className="size-4" />
					</Button>
				</div>

				{/* New Chat Button */}
				<div className="border-border border-b p-3">
					<Button
						className="w-full gap-2"
						onClick={handleNewChat}
						size="sm"
						variant="outline"
					>
						<PlusIcon className="size-4" />
						<span>New Chat</span>
					</Button>
				</div>

				{/* Chat List */}
				<ScrollArea className="h-[calc(100vh-120px)]">
					<div className="p-2">
						<div className="flex items-center gap-2 px-2 py-1.5 text-muted-foreground text-xs">
							<ClockIcon className="size-3.5" weight="duotone" />
							<span>Recent</span>
						</div>
						<div className="space-y-1">
							{PLACEHOLDER_CHATS.map((chat) => (
								<button
									className={cn(
										"w-full rounded px-3 py-2 text-left transition-colors",
										"hover:bg-accent/50",
										"focus:bg-accent/50 focus:outline-none"
									)}
									key={chat.id}
									onClick={() => handleSelectChat(chat.id)}
									type="button"
								>
									<div className="truncate font-medium text-sm">
										{chat.title}
									</div>
									<div className="text-muted-foreground text-xs">
										{chat.timestamp}
									</div>
								</button>
							))}
						</div>
					</div>
				</ScrollArea>

				{/* Footer */}
				<div className="absolute right-0 bottom-0 left-0 border-border border-t bg-sidebar p-3">
					<p className="text-center text-muted-foreground text-xs">
						Chat history is stored locally
					</p>
				</div>
			</div>
		</>
	);
}
