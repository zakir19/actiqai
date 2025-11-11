import { betterAuth, check } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal} from "@polar-sh/better-auth";
import { db } from "@/db";
import * as schema from "@/db/schema";

import {polarClient} from "./polar";
import { create } from "domain";

export const auth = betterAuth({
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignup: true,
            use: [
                checkout({
                    authenticatedUsersOnly: true,
                    successUrl: "/upgrade",
                }),
                portal(),
            ],
        }),
    ],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
});
