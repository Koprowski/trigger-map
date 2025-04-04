import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { authOptions } from '../[...nextauth]/auth';

export async function GET() {
  const headersList = headers();
  
  // Get all environment variables related to auth
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN,
  };

  // Get relevant headers
  const relevantHeaders = {
    host: headersList.get('host'),
    origin: headersList.get('origin'),
    referer: headersList.get('referer'),
    'user-agent': headersList.get('user-agent'),
  };

  // Get auth configuration
  const authConfig = {
    providers: authOptions.providers.map(provider => provider.id),
    debug: authOptions.debug,
    hasAdapter: !!authOptions.adapter,
    callbacks: Object.keys(authOptions.callbacks || {}),
    events: Object.keys(authOptions.events || {}),
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
    headers: relevantHeaders,
    authConfig,
  });
} 