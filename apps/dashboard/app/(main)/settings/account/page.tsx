"use client";

import { authClient } from "@databuddy/auth/client";
import type { Icon } from "@phosphor-icons/react";
import {
	CheckCircleIcon,
	CircleNotchIcon,
	GithubLogoIcon,
	GoogleLogoIcon,
	KeyIcon,
	LinkBreakIcon,
	LinkIcon,
	ShieldCheckIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RightSidebar } from "@/components/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	SettingsRow,
	SettingsSection,
	UnsavedChangesFooter,
} from "../_components/settings-section";
import { TwoFactorDialog } from "./sections/two-factor-dialog";

// Types
type Account = {
	id: string;
	providerId: string;
	accountId: string;
	createdAt: Date;
};

type SocialProvider = "google" | "github";

// Constants
const SOCIAL_PROVIDERS: SocialProvider[] = ["google", "github"];

const PROVIDER_CONFIG: Record<string, { icon: Icon; name: string }> = {
	google: { icon: GoogleLogoIcon, name: "Google" },
	github: { icon: GithubLogoIcon, name: "GitHub" },
	credential: { icon: KeyIcon, name: "Email & Password" },
};

// Helpers
const getInitials = (name: string) =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

// Sub-components
function ProviderRow({
	provider,
	connectedAccount,
	isOnlyAccount,
	isLinking,
	isUnlinking,
	onLink,
	onUnlink,
}: {
	provider: SocialProvider;
	connectedAccount?: Account;
	isOnlyAccount: boolean;
	isLinking: boolean;
	isUnlinking: boolean;
	onLink: () => void;
	onUnlink: () => void;
}) {
	const { icon: ProviderIcon, name } = PROVIDER_CONFIG[provider];

	return (
		<div className="flex items-center justify-between rounded border bg-accent/30 p-3">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded bg-background">
					<ProviderIcon className="size-5" weight="duotone" />
				</div>
				<div>
					<p className="font-medium text-sm">{name}</p>
					{connectedAccount && (
						<p className="text-muted-foreground text-xs">
							Connected {dayjs(connectedAccount.createdAt).format("MMM YYYY")}
						</p>
					)}
				</div>
			</div>
			{connectedAccount ? (
				<div className="flex items-center gap-2">
					<Badge variant="green">Connected</Badge>
					{!isOnlyAccount && (
						<Button
							disabled={isUnlinking}
							onClick={onUnlink}
							size="sm"
							variant="ghost"
						>
							{isUnlinking ? (
								<CircleNotchIcon className="size-4 animate-spin" />
							) : (
								<LinkBreakIcon className="size-4" />
							)}
						</Button>
					)}
				</div>
			) : (
				<Button
					disabled={isLinking}
					onClick={onLink}
					size="sm"
					variant="outline"
				>
					{isLinking ? (
						<CircleNotchIcon className="mr-2 size-4 animate-spin" />
					) : (
						<LinkIcon className="mr-2 size-4" />
					)}
					Connect
				</Button>
			)}
		</div>
	);
}

function ChangePasswordDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			const result = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});
			if (result.error) {
				throw new Error(result.error.message);
			}
			return result.data;
		},
		onSuccess: () => {
			toast.success("Password changed successfully");
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to change password");
		},
	});

	const handleSubmit = () => {
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		mutation.mutate();
	};

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		}
	}, [open]);

	const canSubmit = currentPassword && newPassword && confirmPassword;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Enter your current password and a new password to update your
						account security.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="current-password">Current Password</Label>
						<Input
							id="current-password"
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="••••••••"
							type="password"
							value={currentPassword}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">New Password</Label>
						<Input
							id="new-password"
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="••••••••"
							type="password"
							value={newPassword}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm New Password</Label>
						<Input
							id="confirm-password"
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							type="password"
							value={confirmPassword}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={() => onOpenChange(false)} variant="outline">
						Cancel
					</Button>
					<Button
						disabled={mutation.isPending || !canSubmit}
						onClick={handleSubmit}
					>
						{mutation.isPending && (
							<CircleNotchIcon className="mr-2 size-4 animate-spin" />
						)}
						Change Password
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Main component
export default function AccountSettingsPage() {
	const queryClient = useQueryClient();
	const { data: session, isPending: isSessionLoading } =
		authClient.useSession();
	const user = session?.user;

	// Form state
	const [name, setName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);

	// Initialize form when session loads
	useEffect(() => {
		if (user) {
			setName(user.name ?? "");
			setImageUrl(user.image ?? "");
		}
	}, [user]);

	// Queries
	const { data: accounts = [], isLoading: isAccountsLoading } = useQuery({
		queryKey: ["user-accounts"],
		queryFn: async () => {
			const result = await authClient.listAccounts();
			if (result.error) {
				throw new Error(result.error.message);
			}
			return result.data as Account[];
		},
		staleTime: 5 * 60 * 1000,
	});

	// Mutations
	const updateUser = useMutation({
		mutationFn: async (data: { name?: string; image?: string }) => {
			const result = await authClient.updateUser(data);
			if (result.error) {
				throw new Error(result.error.message);
			}
			return result.data;
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});

	const linkSocial = useMutation({
		mutationFn: async (provider: SocialProvider) => {
			const result = await authClient.linkSocial({
				provider,
				callbackURL: "/settings/account",
			});
			if (result.error) {
				throw new Error(result.error.message);
			}
			return result.data;
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to link account");
		},
	});

	const unlinkAccount = useMutation({
		mutationFn: async (providerId: string) => {
			const result = await authClient.unlinkAccount({ providerId });
			if (result.error) {
				throw new Error(result.error.message);
			}
			return result.data;
		},
		onSuccess: () => {
			toast.success("Account unlinked successfully");
			queryClient.invalidateQueries({ queryKey: ["user-accounts"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to unlink account");
		},
	});

	const hasCredentialAccount = accounts.some(
		(acc) => acc.providerId === "credential"
	);
	const hasChanges =
		name !== (user?.name ?? "") || imageUrl !== (user?.image ?? "");

	// Handlers
	const handleSave = () => {
		const updates: { name?: string; image?: string } = {};
		if (name !== user?.name) {
			updates.name = name;
		}
		if (imageUrl !== user?.image) {
			updates.image = imageUrl || undefined;
		}
		if (Object.keys(updates).length > 0) {
			updateUser.mutate(updates);
		}
	};

	const handleDiscard = () => {
		setName(user?.name ?? "");
		setImageUrl(user?.image ?? "");
	};

	if (isSessionLoading) {
		return (
			<div className="h-full lg:grid lg:grid-cols-[1fr_18rem]">
				<div className="flex flex-col gap-6 p-5">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
				<RightSidebar className="gap-0 p-0">
					<RightSidebar.Skeleton />
				</RightSidebar>
			</div>
		);
	}

	return (
		<div className="h-full lg:grid lg:grid-cols-[1fr_18rem]">
			<div className="flex flex-col">
				<div className="flex-1 overflow-y-auto">
					{/* Profile Photo */}
					<SettingsSection
						description="Upload a photo to personalize your account"
						title="Profile Photo"
					>
						<div className="flex items-center gap-4">
							<Avatar className="size-20">
								<AvatarImage alt={name} src={imageUrl || undefined} />
								<AvatarFallback className="bg-primary/10 font-semibold text-primary text-xl">
									{getInitials(name || "U")}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-2">
								<Input
									onChange={(e) => setImageUrl(e.target.value)}
									placeholder="https://example.com/avatar.jpg…"
									value={imageUrl}
								/>
								<p className="text-muted-foreground text-xs">
									Enter an image URL for your profile photo
								</p>
							</div>
						</div>
					</SettingsSection>

					{/* Basic Info */}
					<SettingsSection
						description="Update your personal information"
						title="Basic Information"
					>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									onChange={(e) => setName(e.target.value)}
									placeholder="Your name…"
									value={name}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<div className="flex items-center gap-2">
									<Input
										className="flex-1"
										disabled
										id="email"
										value={user?.email ?? ""}
									/>
									<Badge variant={user?.emailVerified ? "green" : "amber"}>
										{user?.emailVerified ? (
											<>
												<CheckCircleIcon className="mr-1 size-3" />
												Verified
											</>
										) : (
											<>
												<WarningCircleIcon className="mr-1 size-3" />
												Unverified
											</>
										)}
									</Badge>
								</div>
								<p className="text-muted-foreground text-xs">
									Email changes are not supported yet
								</p>
							</div>
						</div>
					</SettingsSection>

					{/* Security */}
					<SettingsSection
						description="Secure your account with additional authentication"
						title="Security"
					>
						<div className="space-y-4">
							<SettingsRow
								description="Add an extra layer of security to your account"
								label="Two-Factor Authentication"
							>
								<Button
									onClick={() => setShowTwoFactorDialog(true)}
									size="sm"
									variant="outline"
								>
									<ShieldCheckIcon className="mr-2 size-4" />
									{user?.twoFactorEnabled ? "Manage" : "Enable"}
								</Button>
							</SettingsRow>

							{hasCredentialAccount && (
								<SettingsRow
									description="Update your password regularly for security"
									label="Change Password"
								>
									<Button
										onClick={() => setShowPasswordDialog(true)}
										size="sm"
										variant="outline"
									>
										<KeyIcon className="mr-2 size-4" />
										Change
									</Button>
								</SettingsRow>
							)}
						</div>
					</SettingsSection>

					{/* Connected Identities */}
					<SettingsSection
						description="Link your accounts for easier sign-in"
						title="Connected Identities"
					>
						<div className="space-y-3">
							{isAccountsLoading ? (
								<>
									<Skeleton className="h-16 w-full" />
									<Skeleton className="h-16 w-full" />
								</>
							) : (
								<>
									{SOCIAL_PROVIDERS.map((provider) => {
										const connectedAccount = accounts.find(
											(acc) => acc.providerId === provider
										);
										return (
											<ProviderRow
												connectedAccount={connectedAccount}
												isLinking={linkSocial.isPending}
												isOnlyAccount={
													accounts.length === 1 && !!connectedAccount
												}
												isUnlinking={unlinkAccount.isPending}
												key={provider}
												onLink={() => linkSocial.mutate(provider)}
												onUnlink={() => unlinkAccount.mutate(provider)}
												provider={provider}
											/>
										);
									})}

									{hasCredentialAccount && (
										<div className="flex items-center justify-between rounded border bg-accent/30 p-3">
											<div className="flex items-center gap-3">
												<div className="flex size-10 items-center justify-center rounded bg-background">
													<KeyIcon className="size-5" weight="duotone" />
												</div>
												<div>
													<p className="font-medium text-sm">
														Email & Password
													</p>
													<p className="text-muted-foreground text-xs">
														{user?.email}
													</p>
												</div>
											</div>
											<Badge variant="green">Active</Badge>
										</div>
									)}
								</>
							)}
						</div>
					</SettingsSection>
				</div>

				<UnsavedChangesFooter
					hasChanges={hasChanges}
					isSaving={updateUser.isPending}
					onDiscard={handleDiscard}
					onSave={handleSave}
				/>
			</div>

			{/* Right Sidebar */}
			<RightSidebar className="gap-0 p-0">
				<RightSidebar.Section border title="Account Status">
					<div className="space-y-2.5">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Email verified
							</span>
							<Badge variant={user?.emailVerified ? "green" : "amber"}>
								{user?.emailVerified ? "Yes" : "No"}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">2FA enabled</span>
							<Badge variant={user?.twoFactorEnabled ? "green" : "gray"}>
								{user?.twoFactorEnabled ? "Yes" : "No"}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Member since
							</span>
							<span className="font-medium text-sm">
								{user?.createdAt
									? dayjs(user.createdAt).format("MMM YYYY")
									: "—"}
							</span>
						</div>
					</div>
				</RightSidebar.Section>

				<RightSidebar.Section border title="Connected Apps">
					<div className="space-y-2">
						{isAccountsLoading ? (
							<>
								<Skeleton className="h-6 w-full" />
								<Skeleton className="h-6 w-full" />
							</>
						) : (
							accounts.map((account) => {
								const config = PROVIDER_CONFIG[account.providerId];
								const ProviderIcon = config?.icon ?? KeyIcon;
								return (
									<div className="flex items-center gap-2" key={account.id}>
										<ProviderIcon className="size-4 text-muted-foreground" />
										<span className="flex-1 text-sm">
											{config?.name ?? account.providerId}
										</span>
										<span className="size-2 rounded-full bg-green-500" />
									</div>
								);
							})
						)}
					</div>
				</RightSidebar.Section>

				<RightSidebar.Section>
					<RightSidebar.Tip description="Keep your email up to date to ensure you receive important notifications about your account." />
				</RightSidebar.Section>
			</RightSidebar>

			{/* Dialogs */}
			<ChangePasswordDialog
				onOpenChange={setShowPasswordDialog}
				open={showPasswordDialog}
			/>
			<TwoFactorDialog
				hasCredentialAccount={hasCredentialAccount}
				isEnabled={user?.twoFactorEnabled ?? false}
				onOpenChange={setShowTwoFactorDialog}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
					queryClient.invalidateQueries({ queryKey: ["user-accounts"] });
				}}
				open={showTwoFactorDialog}
			/>
		</div>
	);
}
