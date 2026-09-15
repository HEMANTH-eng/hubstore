import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { cookies } from "next/headers";
import { SessionUser, UserRole } from "@/types";

const SESSION_COOKIE_NAME = "hubstore_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a database session for a user and sets the httpOnly session cookie
 */
export async function createSession(userId: string) {
  const sessionToken = `sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return sessionToken;
}

/**
 * Retrieves the current session user from cookies with role and seller information
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role as UserRole,
      image: session.user.image,
      sellerId: session.user.seller?.id || null,
    };
  } catch (err) {
    console.error("Error retrieving session:", err);
    return null;
  }
}

/**
 * Destroys the current session
 */
export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({
        where: { sessionToken: token },
      });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error("Error destroying session:", err);
  }
}

/**
 * Protects an action/route by verifying required role(s)
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
