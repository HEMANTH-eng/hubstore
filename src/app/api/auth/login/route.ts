import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const emailToLookup = validatedData.email.toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: emailToLookup },
      include: { seller: true },
    });

    if (!user) {
      const altEmail = emailToLookup.includes("@hubstore.com")
        ? emailToLookup.replace("@hubstore.com", "@novacart.com")
        : emailToLookup.includes("@novacart.com")
        ? emailToLookup.replace("@novacart.com", "@hubstore.com")
        : null;
      if (altEmail) {
        user = await prisma.user.findUnique({
          where: { email: altEmail },
          include: { seller: true },
        });
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        sellerId: user.seller?.id || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.errors?.[0]?.message || error.message || "Failed to log in" },
      { status: 400 }
    );
  }
}
