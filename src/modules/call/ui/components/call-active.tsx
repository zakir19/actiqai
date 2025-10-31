import Link from "next/link";
import Image from "next/image";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import { CallParticipantsList } from "./call-participants-list";
import { AudioBridge } from "./audio-bridge";

interface Props {
    onLeave: () => void;
    meetingName: string;
    meetingId: string;
}

export const CallActive = ({ onLeave, meetingName, meetingId }: Props) => {
    return (
        <div className='flex flex-col justify-between p-4 h-full text-white relative'>
            <div className='bg-[#101213] rounded-full p-4 flex items-center gap-4 relative z-10'>
                <Link
                    href='/'
                    className='flex items-center justify-center p-1 bg-white/10 rounded-full w-fit'
                >
                    <Image src='/logo.svg' width={22} height={22} alt='logo' />
                </Link>
                <h4 className='text-base'>{meetingName}</h4>
            </div>
            <CallParticipantsList />
            <AudioBridge meetingId={meetingId} />
            <SpeakerLayout />
            <div className='bg-[#101213] rounded-full px-4 relative z-10'>
                <CallControls onLeave={onLeave} />
            </div>
        </div>
    );
};
