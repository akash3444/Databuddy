"use client";

import { useChat, useChatActions } from "@ai-sdk-tools/store";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useSetAtom } from "jotai";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { agentInputAtom } from "../agent-atoms";
import { useAgentChatId } from "../agent-chat-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const DEBUG_PREFIX = "[AGENT-CHAT]";

export function useAgentChat() {
    const chatId = useAgentChatId();
    const params = useParams();
    const websiteId = params.id as string;
    const routeChatId = params.chatId as string | undefined;
    const setInput = useSetAtom(agentInputAtom);

    // Use route chatId if available, otherwise fall back to context chatId
    const stableChatId = routeChatId ?? chatId;

    console.log(`${DEBUG_PREFIX} Hook render - chatId: ${chatId}, routeChatId: ${routeChatId}, stableChatId: ${stableChatId}`);

    // Store stable chatId in ref to prevent useChat from resetting
    const stableChatIdRef = useRef<string>(stableChatId);
    if (stableChatIdRef.current !== stableChatId) {
        console.log(`${DEBUG_PREFIX} ChatId changed - old: ${stableChatIdRef.current}, new: ${stableChatId}`);
        stableChatIdRef.current = stableChatId;
    }

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `${API_URL}/v1/agent/chat`,
                credentials: "include",
                prepareSendMessagesRequest({ messages }) {
                    const lastMessage = messages[messages.length - 1];
                    return {
                        body: {
                            id: stableChatId,
                            websiteId,
                            message: lastMessage,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                    };
                },
            }),
        [websiteId, stableChatId]
    );

    // Use useChat from SDK - it's the single source of truth
    const { messages: sdkMessages, status: sdkStatus } = useChat<UIMessage>({
        id: stableChatId,
        transport,
    });

    console.log(`${DEBUG_PREFIX} SDK messages:`, {
        count: sdkMessages.length,
        messages: sdkMessages.map(m => ({ id: m.id, role: m.role, textLength: m.parts?.find(p => p.type === "text")?.text?.length || 0 }))
    });

    // Simply use SDK messages directly - no complex syncing needed
    const messages = sdkMessages;

    // Map SDK status to our status type
    const mappedStatus = sdkStatus === "ready" ? "idle" : sdkStatus as "idle" | "submitted" | "streaming" | "error";
    const status = mappedStatus;

    console.log(`${DEBUG_PREFIX} Final messages for display:`, {
        count: messages.length,
        source: "sdk",
        messages: messages.map(m => ({ id: m.id, role: m.role, textLength: m.parts?.find(p => p.type === "text")?.text?.length || 0 }))
    });

    const {
        sendMessage: sdkSendMessage,
        reset: sdkReset,
        stop: sdkStop,
    } = useChatActions();

    const lastUserMessageRef = useRef<string>("");

    const sendMessage = useCallback(
        (
            content: string,
            metadata?: { agentChoice?: string; toolChoice?: string }
        ) => {
            if (!content.trim()) return;

            console.log(`${DEBUG_PREFIX} sendMessage called:`, {
                content: content.trim(),
                currentMessages: messages.length,
                sdkMessages: sdkMessages.length
            });

            lastUserMessageRef.current = content.trim();
            setInput("");

            sdkSendMessage({
                text: content.trim(),
                metadata,
            });
        },
        [sdkSendMessage, setInput, messages.length, sdkMessages.length]
    );

    const reset = useCallback(() => {
        console.log(`${DEBUG_PREFIX} reset called - clearing ${sdkMessages.length} SDK messages`);
        sdkReset();
        setInput("");
        lastUserMessageRef.current = "";
    }, [sdkReset, setInput, sdkMessages.length]);

    const stop = useCallback(() => {
        sdkStop();
    }, [sdkStop]);

    // Retry by resending the last user message
    const retry = useCallback(() => {
        const lastUserMessage = lastUserMessageRef.current;
        if (!lastUserMessage) return;

        sdkSendMessage({
            text: lastUserMessage,
        });
    }, [sdkSendMessage]);

    const isLoading = status === "streaming" || status === "submitted";
    const hasError = status === "error";

    return {
        messages,
        status,
        isLoading,
        hasError,
        sendMessage,
        stop,
        reset,
        retry,
    };
}
