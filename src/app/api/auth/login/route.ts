import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const emailToLookup = validatedData.email.trim().toLowerCase();

    // 1. Find user by exact email/identifier or alias
    let user = await prisma.user.findUnique({
      where: { email: emailToLookup },
      include: { seller: true },
    });

    // Special match for master owner account (hemanth2006t, hemanth2006t@gmail.com, hemanth@2006, etc.)
    const masterAliases = [
      "hemanth2006t",
      "hemanth2006t@gmail.com",
      "hemanth@2006t",
      "hemanth@2006",
      "hemanth2006",
      "hemanth",
    ];

    if (!user && masterAliases.includes(emailToLookup)) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { in: masterAliases } },
            { email: "hemanth2006t@gmail.com" },
          ],
        },
        include: { seller: true },
      });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email/user ID or password" },
        { status: 401 }
      );
    }

    // 2. Verify password with bcrypt
    const isValid = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email/user ID or password" },
        { status: 401 }
      );
    }

    // 3. If master user (Hemanth) and role not yet selected, ask for role selection
    const isMasterUser = masterAliases.includes(user.email.toLowerCase()) || masterAliases.includes(emailToLookup);
    const selectedRole = validatedData.selectedRole;

    if (isMasterUser && !selectedRole) {
      return NextResponse.json({
        success: true,
        requireRoleSelection: true,
        availableRoles: ["ADMIN", "SELLER", "CUSTOMER"],
        user: {
          id: user.id,
          name: user.name || "Boda Hemanth",
          email: user.email,
        },
      });
    }

    // If master user provided a role, set their active role in database
    if (isMasterUser && selectedRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: selectedRole },
        include: { seller: true },
      });
    }

    // 4. Create session
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
