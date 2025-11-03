import { BanIcon, AlertCircleIcon } from "lucide-react";
import { motion } from "framer-motion";

export const CancelledState = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-linear-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-xl border border-red-200 dark:border-red-800 px-8 py-12 flex flex-col gap-y-6 items-center justify-center"
        >
            <div className="flex flex-col items-center text-center max-w-lg">
                <div className="w-20 h-20 bg-linear-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 rounded-full flex items-center justify-center mb-6">
                    <BanIcon className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Meeting Cancelled</h3>
                <p className="text-muted-foreground text-lg">
                    This meeting has been cancelled and is no longer available.
                </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircleIcon className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-900 dark:text-red-300">
                    No further actions can be taken on this meeting
                </span>
            </div>
        </motion.div>
    );
};
