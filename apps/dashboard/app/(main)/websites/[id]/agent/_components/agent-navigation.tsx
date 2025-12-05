"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AgentNavigation() {
	const router = useRouter();
	const { id } = useParams();

	const handleBack = () => {
		router.push(`/websites/${id}`);
	};

	return (
		<div className="absolute left-0">
			<Button onClick={handleBack} size="icon" type="button" variant="outline">
				<ArrowLeftIcon className="size-4" />
			</Button>
		</div>
	);
}
