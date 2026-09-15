import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = addressSchema.parse(body);

    // If marked default, unset previous default
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    } else {
      // If user has no existing addresses, make this the default
      const count = await prisma.address.count({ where: { userId: user.id } });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.errors?.[0]?.message || error.message || "Failed to save address" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isDefault, name, phone, street, apartment, area, city, state, pincode } = body;

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // If setting default, unset others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (street !== undefined) updateData.street = street;
    if (apartment !== undefined) updateData.apartment = apartment;
    if (area !== undefined) updateData.area = area;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updated = await prisma.address.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    // If the deleted address was default, promote another address if available
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: user.id },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}

