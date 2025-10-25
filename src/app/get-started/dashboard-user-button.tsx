import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/ui/genrated-avtar";
import { CreditCardIcon, LogOutIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { on } from "events";
export const DashboardUserButton = () => {

    const router = useRouter();
    const isMobile = useIsMobile();
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

    if (isMobile){
        return (
            <Drawer>
                <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
                {data.user.image ? (
                    <Avatar>
                        <AvatarImage src={data.user.image} />
                    </Avatar>
                ) : (
                    <GeneratedAvatar seed={data.user.name }
                    variant="initials"
                    className="size-9 mr-3" />
                )}
                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
                    <p className="text-sm truncate w-full">
                        {data.user.name}
                    </p>
                    <p className="text-xs truncate w-full">
                        {data.user.email}
                    </p>
                </div>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{data.user.name}</DrawerTitle>
                        <DrawerDescription>{data.user.email}</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button
                            variant = "outline"
                            onClick={() => { }}
                            >
                                <CreditCardIcon className="size-4 text-black" />
                                Billing
                        </Button>
                        <Button
                            variant = "outline"
                            onClick={onLogout}
                            >
                                <LogOutIcon className="size-4 text-black" />
                                Logout
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
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