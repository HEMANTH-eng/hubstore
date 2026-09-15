import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      if (dbUser.passwordHash) {
        const isMatch = await verifyPassword(currentPassword, dbUser.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { error: "Incorrect current password" },
            { status: 400 }
          );
        }
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
