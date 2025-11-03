import { Button } from "@/components/ui/button";
import { VideoIcon, UsersIcon, RadioIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    meetingId: string;
}

export const ActiveState = ({ meetingId }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 px-8 py-12 flex flex-col gap-y-8 items-center justify-center"
        >
            <div className="flex flex-col items-center text-center max-w-lg">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center animate-pulse">
                        <RadioIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 animate-bounce">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Meeting is Live
                </h3>
                <p className="text-muted-foreground text-lg mb-2">
                    The meeting is currently active with participants connected.
                </p>
                <p className="text-sm text-muted-foreground">
                    The meeting will automatically end once all participants have
                    left.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <Button
                    asChild
                    size="lg"
                    className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Link href={`/lk/${meetingId}?meetingId=${meetingId}`}>
                        <VideoIcon className="mr-2" />
                        Join Meeting Now
                    </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="w-4 h-4" />
                    <span>Join the conversation</span>
                </div>
            </div>
        </motion.div>
    );
};
