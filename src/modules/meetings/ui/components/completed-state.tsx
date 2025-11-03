import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingGetOne } from "../../types";
import Markdown from "react-markdown";
import Link from "next/link";
import GenerateAvatar from "@/components/generate-avatar";
import {
    BookOpenTextIcon,
    SparklesIcon,
    FileTextIcon,
    ClockFadingIcon,
    FileVideoIcon,
    MessageSquareIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Transcript } from "./transcript";
import { ChatProvider } from "./chat-provider";
import { motion } from "framer-motion";

interface Props {
    data: MeetingGetOne;
}
export const CompletedState = ({ data }: Props) => {
    // Check if this is a LiveKit meeting (has transcript in JSON format, no transcriptUrl)
    const isLiveKitMeeting = data.transcript && !data.transcriptUrl;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-y-6"
        >
            {/* Meeting Header Card */}
            <div className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold capitalize mb-1">
                                {data.name}
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Link
                                    href={`/agents/${data.agent.id}`}
                                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                >
                                    <GenerateAvatar
                                        variant="botttsNeutral"
                                        seed={data.agent.name}
                                        className="size-5"
                                    />
                                    <span className="capitalize">{data.agent.name}</span>
                                </Link>
                                <span>•</span>
                                <span>
                                    {data.startedAt ? format(data.startedAt, "PPP") : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-2 py-2 px-4 bg-white/50 dark:bg-gray-900/50 w-fit"
                    >
                        <ClockFadingIcon className="text-blue-600 w-4 h-4" />
                        <span className="font-medium">
                            {data.duration ? formatDuration(data.duration) : "No duration"}
                        </span>
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
                <div className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm">
                    <ScrollArea>
                        <TabsList className="p-0 bg-background justify-start rounded-none h-14 w-full border-b">
                            <TabsTrigger
                                value="summary"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600 h-full hover:text-accent-foreground px-6 gap-2"
                            >
                                <BookOpenTextIcon className="w-4 h-4" /> Summary
                            </TabsTrigger>
                            {isLiveKitMeeting && (
                                <TabsTrigger
                                    value="conversation"
                                    className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-purple-600 data-[state=active]:text-purple-600 h-full hover:text-accent-foreground px-6 gap-2"
                                >
                                    <MessageSquareIcon className="w-4 h-4" /> Conversation
                                </TabsTrigger>
                            )}
                            {!isLiveKitMeeting && (
                                <>
                                    <TabsTrigger
                                        value="transcript"
                                        className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-purple-600 data-[state=active]:text-purple-600 h-full hover:text-accent-foreground px-6 gap-2"
                                    >
                                        <FileTextIcon className="w-4 h-4" /> Transcript
                                    </TabsTrigger>
                                    {data.recordingUrl && (
                                        <TabsTrigger
                                            value="recording"
                                            className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-red-600 data-[state=active]:text-red-600 h-full hover:text-accent-foreground px-6 gap-2"
                                        >
                                            <FileVideoIcon className="w-4 h-4" /> Recording
                                        </TabsTrigger>
                                    )}
                                </>
                            )}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
                <TabsContent value="chat">
                    <ChatProvider meetingId={data.id} meetingName={data.name} />
                </TabsContent>
                {isLiveKitMeeting && (
                    <TabsContent value="conversation">
                        <div className="bg-white rounded-lg border px-4 py-5">
                            <div className="space-y-4">
                                {JSON.parse(data.transcript || '[]').map((entry: { speaker: string; text: string; timestamp: string }, index: number) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                                entry.speaker === 'User' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {entry.speaker === 'User' ? 'U' : 'AI'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{entry.speaker}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{entry.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                )}
                {!isLiveKitMeeting && (
                    <>
                        <TabsContent value="transcript">
                            <Transcript meetingId={data.id} />
                        </TabsContent>
                        {data.recordingUrl && (
                            <TabsContent value="recording">
                                <div className="bg-white rounded-lg border px-4 py-5">
                                    <video
                                        src={data.recordingUrl}
                                        className="w-full rounded-lg"
                                        controls
                                    />
                                </div>
                            </TabsContent>
                        )}
                    </>
                )}
                <TabsContent value="summary">
                    <div className="bg-white rounded-lg border">
                        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                            <h2 className="text-2xl font-medium capitalize">
                                {data.name}
                            </h2>
                            <div className="flex gap-x-2 items-center">
                                <Link
                                    href={`/agents/${data.agent.id}`}
                                    className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                                >
                                    <GenerateAvatar
                                        variant="botttsNeutral"
                                        seed={data.agent.name}
                                        className="size-5"
                                    />
                                    {data.agent.name}
                                </Link>{" "}
                                <p>
                                    {data.startedAt
                                        ? format(data.startedAt, "PPP")
                                        : " "}
                                </p>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <SparklesIcon className="size-4" />
                                <p>General Summary</p>
                            </div>
                            <Badge
                                variant="outline"
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockFadingIcon className="text-blue-700" />
                                {data.duration
                                    ? formatDuration(data.duration)
                                    : "No duration"}
                            </Badge>
                            <div>
                                <Markdown
                                    components={{
                                        h1: (props) => (
                                            <h1
                                                className="text-2xl font-medium mb-6"
                                                {...props}
                                            />
                                        ),
                                        h2: (props) => (
                                            <h1
                                                className="text-xl font-medium mb-6"
                                                {...props}
                                            />
                                        ),
                                        h3: (props) => (
                                            <h1
                                                className="text-lg font-medium mb-6"
                                                {...props}
                                            />
                                        ),
                                        h4: (props) => (
                                            <h1
                                                className="text-base font-medium mb-6"
                                                {...props}
                                            />
                                        ),
                                        p: (props) => (
                                            <p
                                                className="mb-6 leading-relaxed"
                                                {...props}
                                            />
                                        ),
                                        ul: (props) => (
                                            <ul
                                                className="list-disc list-inside mb-6"
                                                {...props}
                                            />
                                        ),
                                        ol: (props) => (
                                            <ol
                                                className="list-decimal list-inside mb-6"
                                                {...props}
                                            />
                                        ),
                                        li: (props) => (
                                            <li className="mb-1" {...props} />
                                        ),
                                        strong: (props) => (
                                            <strong
                                                className="font-semibold"
                                                {...props}
                                            />
                                        ),
                                        code: (props) => (
                                            <code
                                                className="bg-gray-100 px-1 py-0.5 rounded"
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {data.summary}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};
