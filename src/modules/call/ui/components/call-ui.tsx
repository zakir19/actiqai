import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallLobby } from "./call-lobby";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
    meetingName: string;
    meetingId: string;
}

export const CallUI = ({ meetingName, meetingId }: Props) => {
    const call = useCall();
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

    const handleJoin = async () => {
        if (!call) return;

        await call.join();

        setShow("call");
    };
    const handleLeave = async () => {
        if (!call) return;

        call.endCall();
        
        // Mark meeting as processing and trigger summary
        try {
            await fetch(`/api/meetings/${meetingId}/end`, {
                method: "POST",
            });
        } catch (error) {
            console.error("Error ending meeting:", error);
        }
        
        setShow("ended");
    };

    return (
        <StreamTheme className='h-full'>
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && (
                <CallActive onLeave={handleLeave} meetingName={meetingName} />
            )}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    );
};
