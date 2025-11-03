"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/components/data-pagination";
import { SketchButton } from "@/components/ui/sketch-button";
import { PlusIcon, VideoIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { NewMeetingDialog } from "../components/new-meeting-dialog";
import { motion } from "framer-motion";

export const MeetingsView = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data } = useSuspenseQuery(
        trpc.meetings.getMany.queryOptions({ ...filters }),
    );

    return (
        <>
            <NewMeetingDialog
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
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            My Meetings
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and join your AI-powered meetings
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
                        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600 rounded-lg">
                                    <VideoIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Meetings
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-600 rounded-lg">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Completed
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            data.items.filter(
                                                (m) =>
                                                    m.status === "completed"
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <VideoIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Upcoming
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            data.items.filter(
                                                (m) => m.status === "upcoming"
                                            ).length
                                        }
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
                            onRowClick={(row) =>
                                router.push(`/meetings/${row.id}`)
                            }
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
                            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-full flex items-center justify-center mx-auto mb-6">
                                <VideoIcon className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                Create your first meeting
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Schedule a meeting to connect with others. Each
                                meeting lets you collaborate, share ideas, and
                                interact with AI-powered participants in real
                                time.
                            </p>
                            <SketchButton
                                size="lg"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create Your First Meeting
                            </SketchButton>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export const MeetingsViewLoading = () => {
    return (
        <LoadingState
            title="Loading Meetings"
            description="This may take a few seconds"
        />
    );
};

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meetings"
            description="Someting went wrong"
        />
    );
};
