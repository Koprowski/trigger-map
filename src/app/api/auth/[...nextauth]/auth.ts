import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // @ts-ignore - PrismaAdapter typing issue with NextAuth
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      
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
        });

        if (!existingUser) {
          // Create new user if they don't exist
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });
          return true;
        }

        // If user exists but no account is linked
        if (existingUser.accounts.length === 0) {
          // Create the account link
          await prisma.account.create({
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
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      
      // Always use NEXTAUTH_URL as the base URL in production
      const productionUrl = process.env.NEXTAUTH_URL || baseUrl;
      
      // If it's a relative URL, prefix with the production URL
      if (url.startsWith('/')) {
        return `${productionUrl}${url}`;
      }
      
      // If it's already our domain, allow it
      if (url.startsWith(productionUrl)) {
        return url;
      }
      
      // Default to the production URL
      return productionUrl;
    },
    async session({ session, user }) {
      console.log('Session callback:', { session, user });
      
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
  },
  debug: true,
}; 