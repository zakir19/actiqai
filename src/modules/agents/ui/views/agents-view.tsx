"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { columns } from "../components/columns";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { SketchButton } from "@/components/ui/sketch-button";
import { PlusIcon, BotIcon, SparklesIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { NewAgentDialog } from "../components/new-agents-dialog";
import { motion } from "framer-motion";

export const AgentsView = () => {
    const router = useRouter();
    const [filters, setFilters] = useAgentsFilters();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(
        trpc.agents.getMany.queryOptions({
            ...filters,
        })
    );

    return (
        <>
            <NewAgentDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
            <div className="flex-1 pb-8 px-4 md:px-8 flex flex-col gap-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            AI Agents
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage your intelligent AI assistants
                        </p>
                    </div>
                    
                </motion.div>

                {/* Stats Cards */}
                {data.items.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <BotIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Agents
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-linear-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-pink-600 rounded-lg">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Active Agents
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.items.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-600 rounded-lg">
                                    <UsersIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Meetings
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.items.reduce(
                                            (acc, agent) => acc + agent.meetingCount,
                                            0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Data Table */}
                {data.items.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm"
                    >
                        <DataTable
                            data={data.items}
                            columns={columns}
                            onRowClick={(row) => router.push(`/agents/${row.id}`)}
                        />
                        <div className="border-t px-4 py-4">
                            <DataPagination
                                page={filters.page}
                                totalPages={data.totalPages}
                                onPageChange={(page) => setFilters({ page })}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <div className="text-center max-w-md">
                            <div className="w-24 h-24 bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BotIcon className="w-12 h-12 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                Create your first agent
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Create an AI agent to join your meetings. Each agent
                                will follow your instructions and interact with
                                participants during the call.
                            </p>
                            <SketchButton
                                size="lg"
                                onClick={() => setCreateDialogOpen(true)}
                                className="from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create Your First Agent
                            </SketchButton>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export const AgentsViewLoading = () => {
    return <LoadingState title="Loading Agents" description="This may take a few seconds" />;
};

export const AgentsViewError = () => {
    return <ErrorState title="Error Loading Agents" description="Someting went wrong" />;
};
