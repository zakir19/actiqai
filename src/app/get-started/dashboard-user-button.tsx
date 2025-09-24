import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/ui/genrated-avtar";
import { CreditCardIcon, LogOutIcon } from "lucide-react";
export const DashboardUserButton = () => {

    const router = useRouter();
    const {data, isPending} = authClient.useSession();

    const onLogout = async () => {
        try {
            await authClient.signOut();
        } finally {
            router.push("/login");
            router.refresh();
        }
    };

    if (isPending || !data?.user) {
        return null;
    }

    const userName = data.user.name || data.user.email || "User";
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="rounded-lg border border-border/10 p-2 w-full flex items-center justify-between bg-black/5 hover:bg-black/10 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                            {data.user.image ? (
                                <AvatarImage src={data.user.image} alt={userName} />
                            ) : (
                                <GeneratedAvatar seed={userName} size={32} className="size-8" title={userName} />
                            )}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[10rem]">{userName}</span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5">
                    <div className="text-sm font-medium leading-none">{userName}</div>
                    {data.user.email && (
                        <div className="text-muted-foreground text-sm truncate">{data.user.email}</div>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <a href="/billing" className="flex w-full items-center justify-between">
                        <span>Billing</span>
                        <CreditCardIcon className="size-4" />
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onLogout(); }}>
                    <span>Logout</span>
                    <LogOutIcon className="ml-auto size-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}