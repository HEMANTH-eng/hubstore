const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: "novaaudio-apex-pro-anc-headphones" },
    include: { reviews: { include: { images: true } } },
  });

  if (!product || product.reviews.length === 0) {
    console.log("No product or reviews found");
    return;
  }

  console.log(`Found product: ${product.name} (${product.reviews.length} reviews)`);

  const review1 = product.reviews[0];
  const existingImagesCount = await prisma.reviewImage.count({
    where: { reviewId: review1.id },
  });

  if (existingImagesCount === 0) {
    await prisma.reviewImage.createMany({
      data: [
        {
          reviewId: review1.id,
          url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
        },
        {
          reviewId: review1.id,
          url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        },
      ],
    });
    console.log(`Added 2 photos to review ${review1.id}`);
  }

  if (product.reviews.length <= 1) {
    let priya = await prisma.user.findUnique({
      where: { email: "priya.patel@example.com" },
    });
    if (!priya) {
      priya = await prisma.user.create({
        data: {
          name: "Priya Patel",
          email: "priya.patel@example.com",
          role: "CUSTOMER",
        },
      });
    }

    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        userId: priya.id,
        rating: 5,
        title: "Premium packaging & stunning sound clarity!",
        comment:
          "Unboxed these today! The matte space grey finish and memory foam cushions are exceptionally comfortable for 8+ hour work sessions. Noise cancellation cuts out AC hum and street noise completely. Worth every rupee!",
        isVerified: true,
        helpfulVotes: 14,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop",
            },
          ],
        },
      },
    });
    console.log(`Created second photo review for Priya Patel: ${newReview.id}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
