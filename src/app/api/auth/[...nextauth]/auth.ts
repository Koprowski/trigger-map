import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

interface UserWithAccounts {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  accounts: Array<{
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
  }>;
}

// Debug environment variables
console.log('NextAuth Environment:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
  BASE_URL: process.env.VERCEL_URL || process.env.RAILWAY_STATIC_URL
});

export const authOptions: NextAuthOptions = {
  // @ts-ignore - PrismaAdapter typing issue with NextAuth
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: true,
  logger: {
    error(code, ...message) {
      console.error('AUTH ERROR:', code, ...message);
    },
    warn(code, ...message) {
      console.warn('AUTH WARN:', code, ...message);
    },
    debug(code, ...message) {
      console.log('AUTH DEBUG:', code, ...message);
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback started:', {
        user: { id: user.id, email: user.email },
        account: account ? { provider: account.provider, type: account.type } : null,
        profile: profile ? { sub: profile.sub } : null
      });
      
      if (!user.email) {
        console.log('No email provided');
        return false;
      }

      if (!account) {
        console.log('No account provided');
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        }) as UserWithAccounts | null;

        console.log('User lookup result:', {
          exists: !!existingUser,
          hasAccounts: existingUser?.accounts?.length ?? 0
        });

        if (!existingUser) {
          // Create new user if they don't exist
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });
          console.log('Created new user:', { id: newUser.id });
          return true;
        }

        // If user exists but no account is linked
        if (!existingUser.accounts || existingUser.accounts.length === 0) {
          // Create the account link
          const newAccount = await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token || '',
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
            },
          });
          console.log('Linked new account:', { 
            userId: existingUser.id, 
            provider: newAccount.provider 
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { 
        url, 
        baseUrl,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'Not available'
      });
      
      // Force production URL when on Railway
      if (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN) {
        const prodUrl = process.env.NEXTAUTH_URL || baseUrl;
        console.log('Production redirect:', { prodUrl, url });
        
        // If it's a relative URL, prefix with production URL
        if (url.startsWith('/')) {
          const finalUrl = `${prodUrl}${url}`;
          console.log('Redirecting to:', finalUrl);
          return finalUrl;
        }
        // If it's already our production domain, allow it
        if (url.startsWith(prodUrl)) {
          console.log('Allowing production URL:', url);
          return url;
        }
        // Default to production URL
        console.log('Defaulting to production URL:', prodUrl);
        return prodUrl;
      }
      
      console.log('Development redirect:', { url, baseUrl });
      // For local development
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    async session({ session, user }) {
      console.log('Session callback:', { 
        sessionUser: session.user,
        dbUser: { id: user.id, email: user.email }
      });
      
      if (session.user) {
        session.user.id = user.id;
      }
      
      return session;
    },
  },
  events: {
    async signIn(message) {
      console.log('SignIn event:', message);
    },
    async signOut(message) {
      console.log('SignOut event:', message);
    },
    async session(message) {
      console.log('Session event:', message);
    }
  },
}; 