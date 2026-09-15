import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        // Customers can only see their own orders; Admins can view any order
        ...(user.role !== "ADMIN" ? { userId: user.id } : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: { select: { title: true } },
          },
        },
        payment: true,
        shipment: true,
        address: true,
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to retrieve order" }, { status: 500 });
  }
}
