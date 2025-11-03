import { SparklesIcon, LoaderIcon } from "lucide-react";
import { motion } from "framer-motion";

export const ProcessingState = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800 px-8 py-12 flex flex-col gap-y-8 items-center justify-center"
        >
            <div className="flex flex-col items-center text-center max-w-lg">
                <div className="w-20 h-20 bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center mb-6 relative">
                    <LoaderIcon className="w-10 h-10 text-amber-600 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-800 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-amber-600" />
                    Generating Summary
                </h3>
                <p className="text-muted-foreground text-lg mb-2">
                    Your meeting has been completed!
                </p>
                <p className="text-sm text-muted-foreground">
                    Our AI is analyzing the conversation and generating a detailed
                    summary. This usually takes a few moments.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-amber-600 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">
                    Processing...
                </span>
            </div>
        </motion.div>
    );
};
