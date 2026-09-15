import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
        role: validatedData.role,
        phone: validatedData.phone,
      },
    });

    // If registering as a seller, auto-create a seller profile
    if (validatedData.role === "SELLER") {
      const store = await prisma.store.create({
        data: {
          name: `${validatedData.name}'s Store`,
          slug: `store-${Math.random().toString(36).substring(2, 8)}`,
        },
      });

      await prisma.seller.create({
        data: {
          userId: user.id,
          storeId: store.id,
          businessName: `${validatedData.name} Retail`,
          phone: validatedData.phone,
        },
      });
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.errors?.[0]?.message || error.message || "Failed to register" },
      { status: 400 }
    );
  }
}
