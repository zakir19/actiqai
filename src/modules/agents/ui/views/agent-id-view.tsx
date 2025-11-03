"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AgentIdViewHeader } from "./agent-id-view-header";
import GenerateAvatar from "@/components/generate-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon, BrainCircuitIcon, MessageSquareIcon } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UpdateAgentDialog } from "../components/update-agents-dialog";
import { motion } from "framer-motion";

interface Props {
    agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [UpdateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

    const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));

    const removeAgent = useMutation(
        trpc.agents.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                router.push("/agents");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure",
        `The following action will remove ${data.meetingCount} associated meetings`
    );

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeAgent.mutateAsync({ id: agentId });
    };

    return (
        <>
            <RemoveConfirmation />
            <UpdateAgentDialog
                open={UpdateAgentDialogOpen}
                onOpenChange={setUpdateAgentDialogOpen}
                intialValues={data}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 py-6 px-4 md:px-8 flex flex-col gap-y-6"
            >
                <AgentIdViewHeader
                    agentId={agentId}
                    agentName={data.name}
                    onEdit={() => setUpdateAgentDialogOpen(true)}
                    onRemove={handleRemoveAgent}
                />

                {/* Agent Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative">
                            <GenerateAvatar
                                variant="botttsNeutral"
                                seed={data.name}
                                className="size-24 md:size-32 rounded-2xl shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                                <BrainCircuitIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{data.name}</h2>
                            <p className="text-muted-foreground mb-4">
                                AI-powered meeting assistant
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-2 py-2 px-4 bg-white/50 dark:bg-gray-900/50"
                                >
                                    <VideoIcon className="text-blue-600 w-4 h-4" />
                                    <span className="font-medium">
                                        {data.meetingCount}{" "}
                                        {data.meetingCount === 1 ? "meeting" : "meetings"}
                                    </span>
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-2 py-2 px-4 bg-white/50 dark:bg-gray-900/50"
                                >
                                    <MessageSquareIcon className="text-purple-600 w-4 h-4" />
                                    <span className="font-medium">Active Agent</span>
                                </Badge>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Instructions Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm"
                >
                    <div className="px-6 py-5 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <BrainCircuitIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Agent Instructions</h3>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {data.instructions}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Total Meetings
                                </p>
                                <p className="text-3xl font-bold">{data.meetingCount}</p>
                            </div>
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <VideoIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-950 rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Agent Status
                                </p>
                                <p className="text-3xl font-bold">Active</p>
                            </div>
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <BrainCircuitIcon className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export const AgentsIdViewLoading = () => {
    return <LoadingState title="Loading Agent" description="This may take a few seconds" />;
};

export const AgentsIdViewError = () => {
    return <ErrorState title="Error Loading Agent" description="Someting went wrong" />;
};
