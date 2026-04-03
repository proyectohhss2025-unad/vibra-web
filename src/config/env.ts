//NOTE: Not implemented
import { z } from "zod";

import dotenv from 'dotenv';
dotenv.config();

const envVars = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    NEXT_PUBLIC_SOCKET_URL: z.string().url()
});

console.log("Loaded environment variables:", process.env);
envVars.parse(process.env);

// Cargar las variables de entorno
const parsedEnv = envVars.safeParse(process.env);
console.info('parsedEnv:', parsedEnv);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    //throw new Error('Environment variable validation failed');
}

export const env = parsedEnv.data;