"use client";

import { ArrowLeftIcon, LockIcon, MagnifyingGlassIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type WebsiteErrorStateProps = {
	error: unknown;
	websiteId?: string;
	isDemoRoute?: boolean;
};

function getErrorType(error: unknown): {
	type: "not_found" | "unauthorized" | "forbidden" | "unknown";
	message?: string;
	code?: string;
} {
	if (!error || typeof error !== "object") {
		return { type: "unknown" };
	}

	const rpcError = error as {
		data?: { code?: string; message?: string };
		code?: string;
		message?: string;
	};

	const errorCode = rpcError?.data?.code ?? rpcError?.code;
	const errorMessage = rpcError?.data?.message ?? rpcError?.message ?? "";

	if (errorCode) {
		switch (errorCode) {
			case "NOT_FOUND":
				return { type: "not_found", message: errorMessage, code: "NOT_FOUND" };
			case "UNAUTHORIZED":
				return { type: "unauthorized", message: errorMessage, code: "UNAUTHORIZED" };
			case "FORBIDDEN":
				return { type: "forbidden", message: errorMessage, code: "FORBIDDEN" };
			default:
				return { type: "unknown", message: errorMessage, code: errorCode };
		}
	}

	const messageLower = errorMessage.toLowerCase();
	if (
		messageLower.includes("authentication is required") ||
		messageLower.includes("unauthorized") ||
		messageLower.includes("sign in") ||
		messageLower.includes("login")
	) {
		return { type: "unauthorized", message: errorMessage, code: "UNAUTHORIZED" };
	}

	if (
		messageLower.includes("not found") ||
		messageLower.includes("doesn't exist")
	) {
		return { type: "not_found", message: errorMessage, code: "NOT_FOUND" };
	}

	if (
		messageLower.includes("permission") ||
		messageLower.includes("forbidden") ||
		messageLower.includes("access denied")
	) {
		return { type: "forbidden", message: errorMessage, code: "FORBIDDEN" };
	}

	return { type: "unknown", message: errorMessage };
}

export function WebsiteErrorState({
	error,
	websiteId,
	isDemoRoute = false,
}: WebsiteErrorStateProps) {
	const router = useRouter();
	const { type, message, code } = getErrorType(error);

	const getErrorCode = () => {
		switch (type) {
			case "not_found":
				return "ERR_WEBSITE_NOT_FOUND";
			case "unauthorized":
				return "ERR_UNAUTHORIZED";
			case "forbidden":
				return "ERR_FORBIDDEN";
			default:
				return "ERR_UNKNOWN";
		}
	};

	const getErrorNumber = () => {
		switch (type) {
			case "not_found":
				return "404";
			case "unauthorized":
				return "401";
			case "forbidden":
				return "403";
			default:
				return "500";
		}
	};

	const getIcon = () => {
		switch (type) {
			case "not_found":
				return (
					<MagnifyingGlassIcon
						className="size-16 text-primary"
						weight="duotone"
					/>
				);
			case "unauthorized":
			case "forbidden":
				return (
					<LockIcon
						className="size-16 text-orange-500 dark:text-orange-400"
						weight="duotone"
					/>
				);
			default:
				return (
					<WarningCircleIcon
						className="size-16 text-destructive"
						weight="duotone"
					/>
				);
		}
	};

	const getTitle = () => {
		switch (type) {
			case "not_found":
				return "Website Not Found";
			case "unauthorized":
				return isDemoRoute ? "Demo Not Available" : "Authentication Required";
			case "forbidden":
				return isDemoRoute ? "Demo Not Available" : "Access Denied";
			default:
				return "Something Went Wrong";
		}
	};

	const getDescription = () => {
		switch (type) {
			case "not_found":
				return isDemoRoute
					? "This demo page doesn't exist or is no longer available."
					: "The website you're looking for doesn't exist or has been removed.";
			case "unauthorized":
				return isDemoRoute
					? "This demo page is private and requires authentication."
					: "You need to sign in to view this website's analytics.";
			case "forbidden":
				return isDemoRoute
					? "This demo page is private and requires authentication."
					: "You don't have permission to view this website's analytics.";
			default:
				return message || "We encountered an error while loading this website.";
		}
	};

	const renderActions = () => {
		if (type === "not_found") {
			return (
				<Button
					onClick={() => router.push(isDemoRoute ? "/" : "/websites")}
					variant="default"
					size="lg"
					className="bg-primary hover:bg-primary/90"
				>
					{isDemoRoute ? "Go to Homepage" : "Back to Websites"}
				</Button>
			);
		}

		if (type === "unauthorized" || type === "forbidden") {
			return (
				<div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
					{isDemoRoute ? (
						<>
							<Button
								onClick={() => router.push("/auth/sign-in")}
								variant="default"
								size="lg"
								className="flex-1 bg-primary hover:bg-primary/90"
							>
								Sign In
							</Button>
							<Button
								onClick={() => router.push("/")}
								variant="outline"
								size="lg"
								className="flex-1"
							>
								Go to Homepage
							</Button>
						</>
					) : (
						<>
							<Button
								onClick={() => router.push("/websites")}
								variant="default"
								size="lg"
								className="flex-1 bg-primary hover:bg-primary/90"
							>
								<ArrowLeftIcon className="mr-2 size-4" weight="duotone" />
								Back to Websites
							</Button>
							{type === "unauthorized" && (
								<Button
									onClick={() => router.push("/auth/sign-in")}
									variant="outline"
									size="lg"
									className="flex-1"
								>
									Sign In
								</Button>
							)}
						</>
					)}
				</div>
			);
		}

		return (
			<div className="flex w-full max-w-xs flex-col gap-4 sm:flex-row">
				<Button
					onClick={() => router.refresh()}
					variant="default"
					size="lg"
					className="flex-1 bg-primary hover:bg-primary/90"
				>
					Try Again
				</Button>
				<Button
					onClick={() => router.push(isDemoRoute ? "/" : "/websites")}
					variant="outline"
					size="lg"
					className="flex-1"
				>
					{isDemoRoute ? "Go to Homepage" : "Back to Websites"}
				</Button>
			</div>
		);
	};

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-background p-4">
			<div className="flex w-full max-w-md flex-col items-center">
				<div className="mb-6 flex items-center justify-center">
					<div className="relative">
						{getIcon()}
						<div className="-z-10 absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
					</div>
				</div>

				<div className="mb-4 flex items-baseline font-mono">
					{getErrorNumber()
						.split("")
						.map((digit, i) => (
							<span
								key={i}
								className="font-bold text-8xl text-primary md:text-9xl"
							>
								{digit}
							</span>
						))}
				</div>

				<div className="mb-4 h-px w-16 bg-border" />

				<h1 className="mb-2 text-center font-bold text-2xl md:text-3xl">
					{getTitle()}
				</h1>

				<p className="mb-8 text-center text-muted-foreground text-balance">
					{getDescription()}
				</p>

				{renderActions()}
			</div>

			<div className="absolute bottom-8 rounded-md border border-accent bg-accent/50 px-4 py-2 font-mono text-muted-foreground text-xs">
				<code>{getErrorCode()}</code>
			</div>

			<div className="pointer-events-none absolute inset-0 overflow-hidden opacity-5">
				<div className="-right-24 -top-24 absolute h-96 w-96 rounded-full border-8 border-primary border-dashed" />
				<div className="-left-24 -bottom-24 absolute h-96 w-96 rounded-full border-8 border-primary border-dashed" />
			</div>
		</div>
	);
}

