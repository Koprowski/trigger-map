import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

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
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: true,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
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

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        console.log('User lookup result:', {
          exists: !!existingUser,
          id: existingUser?.id
        });

        // Allow the sign in - the adapter will handle account linking
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      const cleanUrl = (url: string) => url.replace(/[;/]+$/, '').replace(/;/g, '');
      
      const cleanedUrl = cleanUrl(url);
      const cleanedBaseUrl = cleanUrl(baseUrl);
      const nextAuthUrl = process.env.NEXTAUTH_URL ? cleanUrl(process.env.NEXTAUTH_URL) : cleanedBaseUrl;

      console.log('Redirect callback:', { 
        url: cleanedUrl, 
        baseUrl: cleanedBaseUrl,
        NEXTAUTH_URL: nextAuthUrl,
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'Not available'
      });
      
      // Always redirect to the home page after sign in
      return nextAuthUrl;
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
    },
    async createUser(message) {
      console.log('CreateUser event:', message);
    },
    async linkAccount(message) {
      console.log('LinkAccount event:', message);
    }
  },
}; 