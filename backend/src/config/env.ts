import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  SESSION_SECRET: z.string().min(16),
  ENCRYPTION_KEY: z.string().length(64),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().default(''),
  GROQ_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
