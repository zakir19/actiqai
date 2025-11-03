"use client";
import { authClient } from "@/lib/auth-client";
import { MeetingRoom } from "@/modules/livekit/meeting-room";
import { ErrorState } from "@/components/error-state";
import { useEffect, useState } from "react";

export function LiveKitEntry({ room, meetingId }: { room: string; meetingId?: string }) {
  const { data } = authClient.useSession();
  const [meetingStatus, setMeetingStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(!!meetingId);
  
  const identity = data?.user?.id || `guest-${Math.random().toString(36).slice(2, 8)}`;
  const name = data?.user?.name || "Guest";
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL as string;

  // Check meeting status if meetingId is provided
  useEffect(() => {
    if (!meetingId) return;

    const checkMeetingStatus = async () => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (response.ok) {
          const meeting = await response.json();
          setMeetingStatus(meeting.status);
        }
      } catch (error) {
        console.error("Error checking meeting status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkMeetingStatus();
  }, [meetingId]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading meeting...</p>
        </div>
      </div>
    );
  }

  // Prevent joining completed, processing, or cancelled meetings
  if (meetingId && (meetingStatus === "completed" || meetingStatus === "processing" || meetingStatus === "cancelled")) {
    const title = meetingStatus === "cancelled" ? "Meeting was cancelled" : "Meeting has ended";
    const description = meetingStatus === "cancelled" 
      ? "This meeting has been cancelled and is no longer available."
      : "This meeting is no longer available. The summary will be available shortly.";

    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <ErrorState
          title={title}
          description={description}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <MeetingRoom url={url} roomName={room} identity={identity} displayName={name} meetingId={meetingId} />
    </div>
  );
}
