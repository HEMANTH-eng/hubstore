import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Setting up Hemanth Master Account...");

  const passwordHash = await bcrypt.hash("bhemanth", 10);

  // 1. Check if hemanth@2006 exists or create it
  let hemanth = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "hemanth@2006" },
        { email: "hemanth2006t@gmail.com" },
      ],
    },
    include: { seller: true },
  });

  if (!hemanth) {
    hemanth = await prisma.user.create({
      data: {
        email: "hemanth@2006",
        name: "Boda Hemanth",
        passwordHash,
        role: "ADMIN",
        cart: { create: {} },
        wishlist: { create: {} },
      },
      include: { seller: true },
    });
    console.log("Created user hemanth@2006");
  } else {
    hemanth = await prisma.user.update({
      where: { id: hemanth.id },
      data: {
        email: "hemanth@2006",
        name: "Boda Hemanth",
        passwordHash,
        role: "ADMIN",
      },
      include: { seller: true },
    });
    console.log("Updated master user to hemanth@2006");
  }

  // 2. Ensure Seller profile is linked to Hemanth
  let seller = hemanth.seller;
  if (!seller) {
    // Find if there was an existing seller
    const existingSeller = await prisma.seller.findFirst();
    if (existingSeller) {
      seller = await prisma.seller.update({
        where: { id: existingSeller.id },
        data: {
          user: { connect: { id: hemanth.id } },
          businessName: "HypperStore Official",
        },
      });
      console.log("Reassigned existing seller profile to Hemanth");
    } else {
      seller = await prisma.seller.create({
        data: {
          userId: hemanth.id,
          businessName: "HypperStore Official",
          isVerified: true,
        },
      });
      console.log("Created new seller profile for Hemanth");
    }
  }

  // 3. Reassign orders from customer@hubstore.com to Hemanth so user history is preserved
  const oldCustomer = await prisma.user.findUnique({
    where: { email: "customer@hubstore.com" },
  });
  if (oldCustomer && oldCustomer.id !== hemanth.id) {
    await prisma.order.updateMany({
      where: { userId: oldCustomer.id },
      data: { userId: hemanth.id },
    });
    await prisma.review.updateMany({
      where: { userId: oldCustomer.id },
      data: { userId: hemanth.id },
    });
    await prisma.address.updateMany({
      where: { userId: oldCustomer.id },
      data: { userId: hemanth.id },
    });
  }

  // 4. Remove all old demo accounts
  const demoEmails = [
    "admin@hubstore.com",
    "seller@hubstore.com",
    "customer@hubstore.com",
  ];

  for (const email of demoEmails) {
    const oldUser = await prisma.user.findUnique({ where: { email } });
    if (oldUser && oldUser.id !== hemanth.id) {
      // Clean up sessions, carts, wishlists
      await prisma.session.deleteMany({ where: { userId: oldUser.id } });
      await prisma.cartItem.deleteMany({ where: { cart: { userId: oldUser.id } } });
      await prisma.cart.deleteMany({ where: { userId: oldUser.id } });
      await prisma.wishlistItem.deleteMany({ where: { wishlist: { userId: oldUser.id } } });
      await prisma.wishlist.deleteMany({ where: { userId: oldUser.id } });
      await prisma.notification.deleteMany({ where: { userId: oldUser.id } });
      await prisma.searchHistory.deleteMany({ where: { userId: oldUser.id } });
      await prisma.couponUsage.deleteMany({ where: { userId: oldUser.id } });
      await prisma.address.deleteMany({ where: { userId: oldUser.id } });
      await prisma.seller.deleteMany({ where: { userId: oldUser.id } });
      await prisma.user.delete({ where: { id: oldUser.id } });
      console.log(`Deleted demo user: ${email}`);
    }
  }

  console.log("Setup complete! Master user:", {
    email: hemanth.email,
    name: hemanth.name,
    role: hemanth.role,
  });
}

main()
  .catch((e) => {
    console.error("Error setting up master user:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
