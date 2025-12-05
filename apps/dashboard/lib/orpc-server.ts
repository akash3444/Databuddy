import type { AppRouter } from "@databuddy/rpc";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerRPCClient = cache(async (): Promise<RouterClient<AppRouter>> => {
    const headersList = await headers();

    // Get all cookies from the request headers
    const cookieHeader = headersList.get("cookie") || "";

    // Get all headers to forward them
    const forwardedHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
        forwardedHeaders[key] = value;
    });

    const link = new RPCLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/rpc`,
        fetch: async (url, options) => {
            return fetch(url, {
                ...options,
                headers: {
                    ...forwardedHeaders,
                    ...options?.headers,
                    // Ensure cookies are passed
                    cookie: cookieHeader,
                },
            });
        },
    });

    return createORPCClient(link);
});

