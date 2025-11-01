"use client";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Bot, User, Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const CallParticipantsList = () => {
    const { useParticipants, useCallCustomData } = useCallStateHooks();
    const participants = useParticipants();
    const customData = useCallCustomData();

    // Get AI agent info from call metadata
    const agentJoined = customData?.agentJoined === true;
    const agentId = customData?.agentId as string | undefined;
    const agentName = customData?.agentName as string | undefined;

    // Create virtual participant for AI agent if joined
    const allParticipants = [...participants];
    
    if (agentJoined && agentId && agentName) {
        // Check if agent is already in participants list
        const agentExists = participants.some(p => p.userId === agentId);
        
        if (!agentExists) {
            // Add virtual AI agent participant
            allParticipants.push({
                userId: agentId,
                name: agentName,
                image: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${agentName}`,
                sessionId: `agent-${agentId}`,
                publishedTracks: [],
                isSpeaking: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                custom: { isAgent: true } as any,
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    }

    return (
        <div className="absolute top-20 left-4 bg-[#101213]/95 backdrop-blur-sm rounded-lg p-4 max-w-xs z-20">
            <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Participants ({allParticipants.length})
            </h3>
            <div className="space-y-2">
                {allParticipants.map((participant) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const customData = participant.custom as any;
                    const isAgent =
                        participant.userId === agentId ||
                        customData?.isAgent === true;
                    const participantName =
                        participant.name || participant.userId;
                    
                    // Check if participant is speaking
                    const isSpeaking = participant.isSpeaking;
                    const hasAudio = participant.publishedTracks.length > 0;

                    return (
                        <div
                            key={participant.sessionId}
                            className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                                isAgent
                                    ? isSpeaking
                                        ? "bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                        : "bg-cyan-500/20 border border-cyan-500/30"
                                    : isSpeaking
                                      ? "bg-white/20 border-2 border-white/50"
                                      : "bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            <div className="relative">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src={participant.image}
                                        alt={participantName}
                                    />
                                    <AvatarFallback className="bg-slate-700 text-white text-xs">
                                        {isAgent ? (
                                            <Bot className="w-4 h-4" />
                                        ) : (
                                            participantName[0]?.toUpperCase() ||
                                            "?"
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                {isSpeaking && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3">
                                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                                        <div className="absolute inset-0 bg-green-500 rounded-full" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-sm font-medium truncate">
                                        {participantName}
                                    </p>
                                    {isAgent && (
                                        <Badge
                                            variant="outline"
                                            className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs px-1.5 py-0"
                                        >
                                            <Bot className="w-3 h-3 mr-1" />
                                            AI
                                        </Badge>
                                    )}
                                </div>
                                {isAgent && (
                                    <p className="text-cyan-400/70 text-xs">
                                        Voice Assistant
                                    </p>
                                )}
                            </div>
                            {hasAudio ? (
                                <Mic className="w-4 h-4 text-white/50" />
                            ) : (
                                <MicOff className="w-4 h-4 text-red-400/50" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
