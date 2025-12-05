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

export function useAgentChat() {
    const chatId = useAgentChatId();
    const params = useParams();
    const websiteId = params.id as string;
    const setInput = useSetAtom(agentInputAtom);

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `${API_URL}/v1/agent/chat`,
                credentials: "include",
                prepareSendMessagesRequest({ messages, id }) {
                    const lastMessage = messages[messages.length - 1];
                    return {
                        body: {
                            id,
                            websiteId,
                            message: lastMessage,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                    };
                },
            }),
        [websiteId]
    );

    const { messages, status } = useChat<UIMessage>({
        id: chatId,
        transport,
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

            lastUserMessageRef.current = content.trim();
            setInput("");

            sdkSendMessage({
                text: content.trim(),
                metadata,
            });
        },
        [sdkSendMessage, setInput]
    );

    const reset = useCallback(() => {
        sdkReset();
        setInput("");
        lastUserMessageRef.current = "";
    }, [sdkReset, setInput]);

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
