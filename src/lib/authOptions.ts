import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/db/prisma";

// Mock user for no-auth mode
const mockUser = {
  id: "mock-user-id",
  name: "Demo User",
  email: "demo@example.com",
  image: "https://i.pravatar.cc/150?img=3"
};

// Modified auth options to bypass authentication
export const authOptions: NextAuthOptions = {
  providers: [],
  secret: "mock-secret",
  callbacks: {
    async session() {
      // Always return a mock session
      return {
        user: mockUser,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    async signIn() {
      // Always allow sign in
      return true;
    }
  }
};
