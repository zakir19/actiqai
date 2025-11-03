import { Button } from "@/components/ui/button";
import { BanIcon, VideoIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    meetingId: string;
    onCancelMeeting: () => void;
    isCancelling: boolean;
}

export const UpcomingState = ({
    meetingId,
    onCancelMeeting,
    isCancelling,
}: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800 px-8 py-12 flex flex-col gap-y-8 items-center justify-center"
        >
            <div className="flex flex-col items-center text-center max-w-lg">
                <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
                    <SparklesIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Meeting Ready to Start</h3>
                <p className="text-muted-foreground text-lg">
                    Your AI-powered meeting is ready. Start the meeting to begin
                    the conversation and get a detailed summary when it ends.
                </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 w-full max-w-md">
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={onCancelMeeting}
                    disabled={isCancelling}
                >
                    <BanIcon className="mr-2" />
                    Cancel Meeting
                </Button>

                <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isCancelling}
                >
                    <Link href={`/lk/${meetingId}?meetingId=${meetingId}`}>
                        <VideoIcon className="mr-2" />
                        Start Meeting
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
};
