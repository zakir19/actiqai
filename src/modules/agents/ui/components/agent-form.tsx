import { agentsInsertSchema } from "@/modules/agents/schemas";
import { AgentGetOne } from "@/modules/agents/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import GenerateAvatar from "@/components/generate-avatar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { LimitReachedPopup } from "@/modules/premium/ui/components/limit-popup";

interface AgentFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: AgentGetOne;
}

export const AgentForm = ({ onSuccess, onCancel, initialValues }: AgentFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showLimitPopup, setShowLimitPopup] = useState(false);

    const createAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));

                onSuccess?.();
            },
            onError: (error) => {
                // Check if this is a limit error
                if (error.data?.code === "FORBIDDEN") {
                    setShowLimitPopup(true);
                } else {
                    toast.message(error.message);
                }
            },
        })
    );

    const updateAgent = useMutation(
        trpc.agents.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                if (initialValues?.id) {
                    await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initialValues.id }));
                }
                onSuccess?.();
            },
            onError: (error) => {
                toast.message(error.message);
            },
        })
    );

    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            instructions: initialValues?.instructions ?? "",
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createAgent.isPending || updateAgent.isPending;

    const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
        if (isEdit) {
            updateAgent.mutate({ ...values, id: initialValues.id });
        } else {
            createAgent.mutate(values);
        }
    };

    return (
        <>
            <LimitReachedPopup
                isOpen={showLimitPopup}
                onClose={() => setShowLimitPopup(false)}
                limitType="agents"
                currentLimit={2}
            />
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <GenerateAvatar seed={form.watch("name")} variant="botttsNeutral" className="border size-16" />
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g Math tutor" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="e.g Assistant to help with Math" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-between gap-x-2">
                        {onCancel && (
                            <Button variant="ghost" disabled={isPending} type="button" onClick={() => onCancel()}>
                                Cancel
                            </Button>
                        )}
                        <Button disabled={isPending} type="submit">
                            {isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};
