/**
 * Application Configuration
 * 
 * Centralized configuration management for the Booklite API.
 * Loads and validates environment variables.
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:4321'),

  // Rate Limiting
  RATE_LIMIT_GLOBAL: z.string().transform(Number).default('100'),
  RATE_LIMIT_PER_USER: z.string().transform(Number).default('1000'),
  RATE_LIMIT_AUTH: z.string().transform(Number).default('5'),

  // JWT
  JWT_SECRET: z.string().min(32).optional(),

  // Storage
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_BUCKET_NAME: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(['postmark', 'ses']).default('postmark'),
  POSTMARK_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@booklite.app'),

  // PDF
  PDF_SERVICE_URL: z.string().url().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Validate and parse environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

const env = parseEnv();

/**
 * Application configuration object
 */
export const config = {
  // Server configuration
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Logging configuration
  logging: {
    level: env.LOG_LEVEL,
    prettyPrint: env.NODE_ENV === 'development',
  },

  // Supabase configuration
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // CORS configuration
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },

  // Rate limiting configuration
  rateLimit: {
    global: env.RATE_LIMIT_GLOBAL,
    perUser: env.RATE_LIMIT_PER_USER,
    auth: env.RATE_LIMIT_AUTH,
  },

  // JWT configuration
  jwt: {
    secret: env.JWT_SECRET,
  },

  // Storage configuration
  storage: {
    provider: 'cloudflare-r2',
    cloudflare: {
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
      bucketName: env.CLOUDFLARE_BUCKET_NAME,
    },
  },

  // Email configuration
  email: {
    provider: env.EMAIL_PROVIDER,
    from: env.EMAIL_FROM,
    postmark: {
      apiKey: env.POSTMARK_API_KEY,
    },
  },

  // PDF configuration
  pdf: {
    serviceUrl: env.PDF_SERVICE_URL,
  },

  // Monitoring configuration
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
  },
} as const;

export type Config = typeof config;