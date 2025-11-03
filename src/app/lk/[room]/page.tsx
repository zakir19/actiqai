import { LiveKitEntry } from "@/modules/livekit/entry";

interface Props {
  params: Promise<{ room: string }>;
  searchParams: Promise<{ meetingId?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { room } = await params;
  const { meetingId } = await searchParams;
  return <LiveKitEntry room={room} meetingId={meetingId} />;
}
