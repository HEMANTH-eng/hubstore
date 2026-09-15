import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HubStore database seeding...");

  // Clean existing tables in proper relational order
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.sellerProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  console.log("Cleared existing database records.");

  // Store Settings
  await prisma.storeSettings.create({
    data: {
      id: "default",
      storeName: "HubStore",
      storeEmail: "support@hubstore.com",
      currency: "INR",
      currencySymbol: "₹",
      taxRate: 18.0,
      freeShippingThreshold: 999.0,
      standardShippingFee: 70.0,
      expressShippingFee: 150.0,
      codEnabled: true,
      codFee: 40.0,
      maxCodAmount: 25000.0,
      razorpayEnabled: true,
      stripeEnabled: true,
    },
  });

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const sellerPassword = await bcrypt.hash("Seller@12345", 10);
  const customerPassword = await bcrypt.hash("Customer@12345", 10);

  // Demo Users
  const admin = await prisma.user.create({
    data: {
      name: "HubStore Admin",
      email: "admin@hubstore.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+91 9876543210",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: "Apex Electronics & Retail",
      email: "seller@hubstore.com",
      passwordHash: sellerPassword,
      role: "SELLER",
      phone: "+91 9876501234",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    },
  });

  const store = await prisma.store.create({
    data: {
      name: "Apex Official Store",
      slug: "apex-official",
      description: "Authorized flagship seller for premium tech, gadgets, and lifestyle gear.",
      rating: 4.8,
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: sellerUser.id,
      storeId: store.id,
      businessName: "Apex Retail Solutions Pvt Ltd",
      gstNumber: "29AAAAA0000A1Z5",
      phone: "+91 9876501234",
      isVerified: true,
      status: "ACTIVE",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "customer@hubstore.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      phone: "+91 9988776655",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces",
    },
  });

  // Customer Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: customer.id,
      name: "Aarav Sharma",
      phone: "9988776655",
      street: "Flat 402, Skyline Heights, 12th Main Road",
      apartment: "Skyline Heights",
      area: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      country: "India",
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      name: "Aarav Sharma (Office)",
      phone: "9988776655",
      street: "Nova Corporate Park, Tower B, 5th Floor",
      apartment: "Tech Hub",
      area: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560066",
      country: "India",
      isDefault: false,
    },
  });

  // Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME50",
        description: "50% off on your first order up to ₹500",
        type: "PERCENTAGE",
        value: 50,
        minOrderValue: 499,
        maxDiscount: 500,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: "FESTIVE20",
        description: "Flat 20% discount on orders above ₹1,499",
        type: "PERCENTAGE",
        value: 20,
        minOrderValue: 1499,
        maxDiscount: 1200,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "FLAT100",
        description: "Flat ₹100 off on purchases over ₹999",
        type: "FIXED",
        value: 100,
        minOrderValue: 999,
        usageLimit: 500,
        isActive: true,
      },
    ],
  });

  // Categories
  const catElectronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Next-gen smartphones, laptops, audio, and personal gadgets.",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop",
      icon: "Cpu",
      featured: true,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: "Fashion & Apparel",
      slug: "fashion",
      description: "Curated contemporary styles, footwear, and designer luxury.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop",
      icon: "Shirt",
      featured: true,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Smart appliances, culinary essentials, and modern home decor.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=400&fit=crop",
      icon: "Home",
      featured: true,
    },
  });

  const catFitness = await prisma.category.create({
    data: {
      name: "Fitness & Wellness",
      slug: "fitness-wellness",
      description: "Performance athletic gear, smart wearables, and wellness tech.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop",
      icon: "Activity",
      featured: true,
    },
  });

  // Subcategories
  const subSmartphones = await prisma.subcategory.create({
    data: {
      categoryId: catElectronics.id,
      name: "Smartphones",
      slug: "smartphones",
      description: "Flagship 5G smartphones with pro-grade cameras.",
    },
  });

  const subAudio = await prisma.subcategory.create({
    data: {
      categoryId: catElectronics.id,
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "Active noise-cancelling headphones and studio earbuds.",
    },
  });

  const subLaptops = await prisma.subcategory.create({
    data: {
      categoryId: catElectronics.id,
      name: "Laptops & Computing",
      slug: "laptops-computing",
      description: "Ultrabooks, workstation laptops, and performance computing.",
    },
  });

  const subMenClothing = await prisma.subcategory.create({
    data: {
      categoryId: catFashion.id,
      name: "Men's Wear",
      slug: "mens-wear",
      description: "Tailored shirts, casual tees, and jackets.",
    },
  });

  const subWomenClothing = await prisma.subcategory.create({
    data: {
      categoryId: catFashion.id,
      name: "Women's Fashion",
      slug: "womens-fashion",
      description: "Elegant dresses, evening wear, and athleisure.",
    },
  });

  const subKitchen = await prisma.subcategory.create({
    data: {
      categoryId: catHome.id,
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      description: "Espresso makers, blenders, and precision cookers.",
    },
  });

  const subDecor = await prisma.subcategory.create({
    data: {
      categoryId: catHome.id,
      name: "Home Decor",
      slug: "home-decor",
      description: "Minimalist lighting, artisan ceramics, and rugs.",
    },
  });

  const subSmartWearables = await prisma.subcategory.create({
    data: {
      categoryId: catFitness.id,
      name: "Smartwatches & Trackers",
      slug: "smartwatches-trackers",
      description: "Fitness trackers with ECG and GPS tracking.",
    },
  });

  // Brands
  const brandNovaAudio = await prisma.brand.create({
    data: { name: "NovaAudio", slug: "novaaudio", featured: true },
  });
  const brandZenith = await prisma.brand.create({
    data: { name: "Zenith Tech", slug: "zenith-tech", featured: true },
  });
  const brandVolt = await prisma.brand.create({
    data: { name: "VoltGear", slug: "voltgear", featured: true },
  });
  const brandAurelia = await prisma.brand.create({
    data: { name: "Aurelia Atelier", slug: "aurelia-atelier", featured: true },
  });
  const brandUrban = await prisma.brand.create({
    data: { name: "UrbanWeave", slug: "urbanweave", featured: true },
  });
  const brandCulinary = await prisma.brand.create({
    data: { name: "CulinaryCraft", slug: "culinarycraft", featured: true },
  });
  const brandPulse = await prisma.brand.create({
    data: { name: "PulseFit", slug: "pulsefit", featured: true },
  });

  // Product Attributes
  const attrColor = await prisma.productAttribute.create({ data: { name: "Color" } });
  const attrStorage = await prisma.productAttribute.create({ data: { name: "Storage" } });
  const attrSize = await prisma.productAttribute.create({ data: { name: "Size" } });

  // 32 High-Quality Realistic Products
  const productsData = [
    // 1. Flagship Smartphone
    {
      name: "Zenith Pro 16 Ultra 5G (Titanium Grey)",
      slug: "zenith-pro-16-ultra-5g",
      sku: "ZEN-P16-256-GRY",
      description:
        "The Zenith Pro 16 Ultra combines aerospace-grade titanium with an advanced 200MP Quad-Camera array. Powered by the high-efficiency Octa-Core 4nm Neural Engine with all-day 5200mAh battery life and 120W HyperCharge.",
      shortDescription: "Aerospace Titanium, 200MP Quad Camera, 120Hz LTPO AMOLED display.",
      price: 79999,
      compareAtPrice: 89999,
      discountPercent: 11,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 48,
      categoryId: catElectronics.id,
      subcategoryId: subSmartphones.id,
      brandId: brandZenith.id,
      stock: 45,
      images: [
        { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop", isPrimary: false, order: 1 },
      ],
      variants: [
        { sku: "ZEN-P16-128", title: "128GB / Titanium Grey", price: 74999, compareAtPrice: 84999, stock: 20 },
        { sku: "ZEN-P16-256", title: "256GB / Titanium Grey", price: 79999, compareAtPrice: 89999, stock: 15 },
        { sku: "ZEN-P16-512", title: "512GB / Titanium Grey", price: 89999, compareAtPrice: 99999, stock: 10 },
      ],
    },
    // 2. Wireless Noise-Cancelling Headphones
    {
      name: "NovaAudio Apex Pro ANC Wireless Headphones",
      slug: "novaaudio-apex-pro-anc-headphones",
      sku: "NOVA-ANC-BLK",
      description:
        "Studio-grade 40mm beryllium drivers paired with hybrid active noise cancellation eliminate up to 98% of ambient noise. Up to 45 hours of continuous wireless playback with plush memory foam earcups.",
      shortDescription: "Hybrid ANC, 45-Hour Battery, Hi-Res Audio Certified.",
      price: 14999,
      compareAtPrice: 19999,
      discountPercent: 25,
      taxRate: 18,
      featured: true,
      rating: 4.9,
      reviewCount: 124,
      categoryId: catElectronics.id,
      subcategoryId: subAudio.id,
      brandId: brandNovaAudio.id,
      stock: 75,
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop", isPrimary: false, order: 1 },
      ],
      variants: [
        { sku: "NOVA-ANC-BLK", title: "Midnight Black", price: 14999, compareAtPrice: 19999, stock: 40 },
        { sku: "NOVA-ANC-SLV", title: "Lunar Silver", price: 14999, compareAtPrice: 19999, stock: 35 },
      ],
    },
    // 3. Pro Laptop
    {
      name: "Zenith StudioBook 16 Thin & Light Laptop",
      slug: "zenith-studiobook-16-laptop",
      sku: "ZEN-SB16-M2",
      description:
        "Built for creators and professionals. Features a calibrated 3.2K OLED 120Hz display, 14-core high-speed CPU, 32GB LPDDR5X RAM, and 1TB NVMe PCIe 4.0 SSD in a sleek 1.4kg all-aluminum chassis.",
      shortDescription: "3.2K OLED, 32GB RAM, 1TB SSD, 18-Hour Battery.",
      price: 124999,
      compareAtPrice: 139999,
      discountPercent: 11,
      taxRate: 18,
      featured: true,
      rating: 4.7,
      reviewCount: 32,
      categoryId: catElectronics.id,
      subcategoryId: subLaptops.id,
      brandId: brandZenith.id,
      stock: 22,
      images: [
        { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop", isPrimary: false, order: 1 },
      ],
    },
    // 4. True Wireless Earbuds
    {
      name: "NovaAudio Pods Flow Spatial TWS",
      slug: "novaaudio-pods-flow-tws",
      sku: "NOVA-PODS-WHT",
      description:
        "Featherlight ergonomic earbuds with real-time 3D spatial audio, quad-mic beamforming noise isolation, and IPX7 water resistance for intense workouts.",
      shortDescription: "Spatial Audio, Quad-Mic ENC, 36hr Battery Case.",
      price: 4499,
      compareAtPrice: 6999,
      discountPercent: 35,
      taxRate: 18,
      featured: false,
      rating: 4.6,
      reviewCount: 89,
      categoryId: catElectronics.id,
      subcategoryId: subAudio.id,
      brandId: brandNovaAudio.id,
      stock: 120,
      images: [
        { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 5. Smart Health Watch
    {
      name: "PulseFit Horizon Pro AMOLED Smartwatch",
      slug: "pulsefit-horizon-pro-smartwatch",
      sku: "PULSE-HZN-BLK",
      description:
        "Comprehensive health tracker with continuous SpO2, Heart Rate, Stress monitoring, dual-band GPS, and 100+ sports tracking modes with up to 14 days on a single charge.",
      shortDescription: "1.43\" AMOLED, Dual-Band GPS, 14-Day Battery.",
      price: 6999,
      compareAtPrice: 9999,
      discountPercent: 30,
      taxRate: 18,
      featured: true,
      rating: 4.5,
      reviewCount: 67,
      categoryId: catFitness.id,
      subcategoryId: subSmartWearables.id,
      brandId: brandPulse.id,
      stock: 80,
      images: [
        { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop", isPrimary: false, order: 1 },
      ],
    },
    // 6. Fast GaN Charger
    {
      name: "VoltGear 100W GaN 4-Port Fast Charger",
      slug: "voltgear-100w-gan-fast-charger",
      sku: "VOLT-GAN-100",
      description:
        "Compact GaN III technology capable of fast-charging two laptops and two phones simultaneously. International voltage compatibility with multi-layer surge protection.",
      shortDescription: "100W PD 3.0, 3x USB-C + 1x USB-A, GaN Fast Charging.",
      price: 2799,
      compareAtPrice: 3999,
      discountPercent: 30,
      taxRate: 18,
      featured: false,
      rating: 4.9,
      reviewCount: 53,
      categoryId: catElectronics.id,
      subcategoryId: subSmartphones.id,
      brandId: brandVolt.id,
      stock: 140,
      images: [
        { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 7. Men's Cotton Oxford Shirt
    {
      name: "UrbanWeave Tailored Oxford Cotton Shirt",
      slug: "urbanweave-tailored-oxford-shirt",
      sku: "URB-OXF-BLU",
      description:
        "Crafted from 100% long-staple Egyptian cotton. Breathable, wrinkle-resistant weave tailored for smart casual wear or office styling.",
      shortDescription: "100% Egyptian Cotton, Slim Fit, Machine Washable.",
      price: 1899,
      compareAtPrice: 2799,
      discountPercent: 32,
      taxRate: 12,
      featured: true,
      rating: 4.6,
      reviewCount: 42,
      categoryId: catFashion.id,
      subcategoryId: subMenClothing.id,
      brandId: brandUrban.id,
      stock: 65,
      images: [
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
      variants: [
        { sku: "URB-OXF-M", title: "Medium / Sky Blue", price: 1899, compareAtPrice: 2799, stock: 25 },
        { sku: "URB-OXF-L", title: "Large / Sky Blue", price: 1899, compareAtPrice: 2799, stock: 25 },
        { sku: "URB-OXF-XL", title: "X-Large / Sky Blue", price: 1899, compareAtPrice: 2799, stock: 15 },
      ],
    },
    // 8. Women's Mulberry Silk Evening Dress
    {
      name: "Aurelia Atelier Mulberry Silk Wrap Dress",
      slug: "aurelia-mulberry-silk-wrap-dress",
      sku: "AUR-SLK-EMR",
      description:
        "100% pure 22-Momme mulberry silk dress featuring a flattering adjustable wrap waist and delicate French seams. Unmatched softness and natural drape.",
      shortDescription: "Pure 22-Momme Silk, Emerald Green, Handcrafted.",
      price: 8499,
      compareAtPrice: 11999,
      discountPercent: 29,
      taxRate: 12,
      featured: true,
      rating: 4.9,
      reviewCount: 19,
      categoryId: catFashion.id,
      subcategoryId: subWomenClothing.id,
      brandId: brandAurelia.id,
      stock: 30,
      images: [
        { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 9. Precision Espresso Maker
    {
      name: "CulinaryCraft Barista Touch Espresso Machine",
      slug: "culinarycraft-barista-touch-espresso-machine",
      sku: "CUL-ESP-01",
      description:
        "15-bar Italian pump with PID thermal temperature regulation and integrated conical burr grinder. Make cafe-quality lattes and cappuccinos in 60 seconds.",
      shortDescription: "15-Bar Italian Pump, Conical Burr Grinder, Microfoam Wand.",
      price: 34999,
      compareAtPrice: 42999,
      discountPercent: 18,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 29,
      categoryId: catHome.id,
      subcategoryId: subKitchen.id,
      brandId: brandCulinary.id,
      stock: 18,
      images: [
        { url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 10. Cast Iron Dutch Oven
    {
      name: "CulinaryCraft Enameled Cast Iron Dutch Oven (5.5 Qt)",
      slug: "culinarycraft-enameled-cast-iron-dutch-oven",
      sku: "CUL-DO-55",
      description:
        "Heavy-duty enameled cast iron offers superior heat retention and distribution. Perfect for sourdough baking, slow braises, and stews.",
      shortDescription: "5.5 Quart, Oven-Safe to 260°C, Vibrant French Blue Enamel.",
      price: 4999,
      compareAtPrice: 6999,
      discountPercent: 28,
      taxRate: 18,
      featured: false,
      rating: 4.9,
      reviewCount: 64,
      categoryId: catHome.id,
      subcategoryId: subKitchen.id,
      brandId: brandCulinary.id,
      stock: 40,
      images: [
        { url: "https://images.unsplash.com/photo-1584990347449-39908cfd0d82?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 11. Minimalist Ceramic Lamp
    {
      name: "UrbanWeave Artisan Ceramic Table Lamp",
      slug: "urbanweave-artisan-ceramic-table-lamp",
      sku: "URB-LMP-01",
      description:
        "Hand-thrown matte ceramic base paired with a natural textured linen shade. Warm ambient 2700K LED included with smooth touch dimming.",
      shortDescription: "Handmade Ceramic, Natural Linen Shade, Touch Dimmable.",
      price: 2999,
      compareAtPrice: 3999,
      discountPercent: 25,
      taxRate: 18,
      featured: false,
      rating: 4.7,
      reviewCount: 38,
      categoryId: catHome.id,
      subcategoryId: subDecor.id,
      brandId: brandUrban.id,
      stock: 50,
      images: [
        { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 12. Smart Running Shoes
    {
      name: "PulseFit CarbonFlow Performance Running Shoes",
      slug: "pulsefit-carbonflow-running-shoes",
      sku: "PULSE-SHOE-01",
      description:
        "Embedded full-length curved carbon fiber plate with supercritical nitrogen-infused foam. Delivers maximum energy return and propulsion for marathon training.",
      shortDescription: "Carbon Fiber Plate, Nitrogen Foam, 210g Ultralight.",
      price: 7999,
      compareAtPrice: 10999,
      discountPercent: 27,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 51,
      categoryId: catFitness.id,
      subcategoryId: subSmartWearables.id,
      brandId: brandPulse.id,
      stock: 45,
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
      variants: [
        { sku: "PULSE-SHOE-UK8", title: "UK 8 / Solar Red", price: 7999, compareAtPrice: 10999, stock: 15 },
        { sku: "PULSE-SHOE-UK9", title: "UK 9 / Solar Red", price: 7999, compareAtPrice: 10999, stock: 20 },
        { sku: "PULSE-SHOE-UK10", title: "UK 10 / Solar Red", price: 7999, compareAtPrice: 10999, stock: 10 },
      ],
    },
    // 13. Mechanical Keyboard
    {
      name: "VoltGear Apex Pro Wireless Mechanical Keyboard",
      slug: "voltgear-apex-pro-mechanical-keyboard",
      sku: "VOLT-KB-RGB",
      description:
        "Hot-swappable pre-lubed linear switches, gasket mounted sound dampening foam, CNC aluminum top case, and tri-mode Bluetooth/2.4G/Type-C connectivity.",
      shortDescription: "Gasket Mount, Hot-Swap Switches, PBT Keycaps, RGB.",
      price: 6499,
      compareAtPrice: 8999,
      discountPercent: 27,
      taxRate: 18,
      featured: false,
      rating: 4.9,
      reviewCount: 47,
      categoryId: catElectronics.id,
      subcategoryId: subLaptops.id,
      brandId: brandVolt.id,
      stock: 55,
      images: [
        { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 14. Ergonomic Wireless Mouse
    {
      name: "VoltGear Precision Master Ergonomic Wireless Mouse",
      slug: "voltgear-precision-master-mouse",
      sku: "VOLT-MS-01",
      description:
        "Sculpted ergonomic contour for reduced wrist fatigue, 8000 DPI Darkfield sensor tracks on any surface including glass, electromagnetic MagSpeed scroll wheel.",
      shortDescription: "8000 DPI Sensor, MagSpeed Wheel, 70-Day Battery.",
      price: 4299,
      compareAtPrice: 5999,
      discountPercent: 28,
      taxRate: 18,
      featured: false,
      rating: 4.7,
      reviewCount: 39,
      categoryId: catElectronics.id,
      subcategoryId: subLaptops.id,
      brandId: brandVolt.id,
      stock: 60,
      images: [
        { url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 15. Smart 4K Video Projector
    {
      name: "Zenith Vision 4K Laser Cinema Projector",
      slug: "zenith-vision-4k-laser-projector",
      sku: "ZEN-PRJ-4K",
      description:
        "True 4K UHD projection up to 150 inches with 2400 ANSI lumens, HDR10+ and Dolby Vision support, built-in Harman Kardon acoustic sound system, and Google TV OS.",
      shortDescription: "4K UHD 150\" Display, 2400 Lumens, Dolby Atmos Audio.",
      price: 89999,
      compareAtPrice: 109999,
      discountPercent: 18,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 15,
      categoryId: catElectronics.id,
      subcategoryId: subSmartphones.id,
      brandId: brandZenith.id,
      stock: 14,
      images: [
        { url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 16. Noise Cancelling Soundbar
    {
      name: "NovaAudio Horizon Soundbar with Wireless Subwoofer",
      slug: "novaaudio-horizon-soundbar-subwoofer",
      sku: "NOVA-SB-51",
      description:
        "5.1.2 channel Dolby Atmos soundbar with upward-firing speakers and a punchy 8-inch wireless subwoofer for immersive home cinematic theater experiences.",
      shortDescription: "5.1.2 Dolby Atmos, 450W Peak Power, eARC & Bluetooth 5.3.",
      price: 24999,
      compareAtPrice: 32999,
      discountPercent: 24,
      taxRate: 18,
      featured: false,
      rating: 4.6,
      reviewCount: 28,
      categoryId: catElectronics.id,
      subcategoryId: subAudio.id,
      brandId: brandNovaAudio.id,
      stock: 35,
      images: [
        { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 17. Men's Leather Messenger Bag
    {
      name: "UrbanWeave Heritage Full-Grain Leather Briefcase",
      slug: "urbanweave-heritage-leather-briefcase",
      sku: "URB-BAG-BRN",
      description:
        "Handcrafted from vegetable-tanned Italian full-grain leather that develops a rich patina over time. Padded laptop compartment holds up to 16-inch laptops.",
      shortDescription: "Full-Grain Italian Leather, Solid Brass Hardware, Fits 16\" Laptops.",
      price: 6999,
      compareAtPrice: 9999,
      discountPercent: 30,
      taxRate: 18,
      featured: true,
      rating: 4.9,
      reviewCount: 22,
      categoryId: catFashion.id,
      subcategoryId: subMenClothing.id,
      brandId: brandUrban.id,
      stock: 25,
      images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 18. Designer Sunglasses
    {
      name: "Aurelia Aviator Titanium Polarized Sunglasses",
      slug: "aurelia-aviator-titanium-sunglasses",
      sku: "AUR-SUN-GLD",
      description:
        "Featherlight Japanese titanium frame with Carl Zeiss polarized emerald lenses. 100% UV400 protection with anti-reflective back coating.",
      shortDescription: "Japanese Titanium Frame, Carl Zeiss Polarized Lenses, UV400.",
      price: 5499,
      compareAtPrice: 7999,
      discountPercent: 31,
      taxRate: 18,
      featured: false,
      rating: 4.8,
      reviewCount: 36,
      categoryId: catFashion.id,
      subcategoryId: subWomenClothing.id,
      brandId: brandAurelia.id,
      stock: 45,
      images: [
        { url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 19. Smart Air Purifier
    {
      name: "Zenith PureAir Pro HEPA-14 Smart Purifier",
      slug: "zenith-pureair-pro-hepa-purifier",
      sku: "ZEN-AIR-01",
      description:
        "Medical-grade H14 True HEPA filtration captures 99.995% of airborne particles down to 0.1 microns. Laser PM2.5 display with automated whisper-quiet fan control.",
      shortDescription: "Medical H14 HEPA, Laser Air Quality Sensor, Cleans 600 sq ft.",
      price: 11999,
      compareAtPrice: 15999,
      discountPercent: 25,
      taxRate: 18,
      featured: true,
      rating: 4.7,
      reviewCount: 58,
      categoryId: catHome.id,
      subcategoryId: subKitchen.id,
      brandId: brandZenith.id,
      stock: 40,
      images: [
        { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 20. Professional Non-Stick Cookware Set
    {
      name: "CulinaryCraft Tri-Ply Stainless Steel Cookware (5-Piece)",
      slug: "culinarycraft-triply-stainless-cookware-set",
      sku: "CUL-CW-05",
      description:
        "Bonded 3-ply construction with responsive aluminum core between induction-compatible stainless steel layers. Riveted ergonomic stay-cool handles.",
      shortDescription: "Tri-Ply Induction Base, Oven Safe to 300°C, 10-Yr Warranty.",
      price: 8999,
      compareAtPrice: 12999,
      discountPercent: 30,
      taxRate: 18,
      featured: false,
      rating: 4.8,
      reviewCount: 31,
      categoryId: catHome.id,
      subcategoryId: subKitchen.id,
      brandId: brandCulinary.id,
      stock: 30,
      images: [
        { url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 21. Yoga & Pilates Non-Slip Mat
    {
      name: "PulseFit EcoGrip Natural Rubber Yoga Mat (5mm)",
      slug: "pulsefit-ecogrip-natural-yoga-mat",
      sku: "PULSE-MAT-01",
      description:
        "Sustainably harvested biodegradable tree rubber with polyurethane non-slip surface. Laser-etched alignment guides prevent joint strain during yoga flows.",
      shortDescription: "Natural Tree Rubber, Ultimate Wet/Dry Grip, 5mm Cushion.",
      price: 2499,
      compareAtPrice: 3499,
      discountPercent: 28,
      taxRate: 18,
      featured: false,
      rating: 4.9,
      reviewCount: 76,
      categoryId: catFitness.id,
      subcategoryId: subSmartWearables.id,
      brandId: brandPulse.id,
      stock: 85,
      images: [
        { url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 22. Smart Massage Gun
    {
      name: "PulseFit ThermaPro Deep Tissue Percussion Gun",
      slug: "pulsefit-thermapro-percussion-gun",
      sku: "PULSE-GUN-01",
      description:
        "High-torque brushless motor delivering 16mm deep stall-force penetration with 5 heated massage heads. Relieves muscle tension and accelerates athletic recovery.",
      shortDescription: "16mm Amplitude, Heated Heads, Whisper-Quiet 40dB Motor.",
      price: 5999,
      compareAtPrice: 8499,
      discountPercent: 29,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 44,
      categoryId: catFitness.id,
      subcategoryId: subSmartWearables.id,
      brandId: brandPulse.id,
      stock: 50,
      images: [
        { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 23. Hand-Poured Scented Candle Set
    {
      name: "UrbanWeave Botanical Soy Candle Trio",
      slug: "urbanweave-botanical-soy-candle-trio",
      sku: "URB-CND-03",
      description:
        "100% natural soy wax scented with cedarwood, amber, and vetiver essential oils. Cotton wicks provide a clean, soot-free 50-hour burn time per candle.",
      shortDescription: "Natural Soy Wax, 3 Curated Scents, 150 Hours Combined Burn.",
      price: 1499,
      compareAtPrice: 1999,
      discountPercent: 25,
      taxRate: 18,
      featured: false,
      rating: 4.6,
      reviewCount: 27,
      categoryId: catHome.id,
      subcategoryId: subDecor.id,
      brandId: brandUrban.id,
      stock: 90,
      images: [
        { url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 24. Heavyweight Oversized Hoodie
    {
      name: "UrbanWeave Heavyweight French Terry Hoodie",
      slug: "urbanweave-heavyweight-french-terry-hoodie",
      sku: "URB-HD-OVR",
      description:
        "Luxurious 450 GSM heavyweight combed cotton loopback fleece. Drop-shoulder relaxed silhouette with double-layered hood and rib-knit cuffs.",
      shortDescription: "450 GSM Heavyweight Cotton, Preshrunk, Oversized Fit.",
      price: 2699,
      compareAtPrice: 3599,
      discountPercent: 25,
      taxRate: 12,
      featured: false,
      rating: 4.8,
      reviewCount: 38,
      categoryId: catFashion.id,
      subcategoryId: subMenClothing.id,
      brandId: brandUrban.id,
      stock: 70,
      images: [
        { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
      variants: [
        { sku: "URB-HD-M", title: "M / Charcoal Grey", price: 2699, compareAtPrice: 3599, stock: 25 },
        { sku: "URB-HD-L", title: "L / Charcoal Grey", price: 2699, compareAtPrice: 3599, stock: 25 },
        { sku: "URB-HD-XL", title: "XL / Charcoal Grey", price: 2699, compareAtPrice: 3599, stock: 20 },
      ],
    },
    // 25. Women's Cashmere Knit Sweater
    {
      name: "Aurelia Atelier 100% Grade-A Mongolian Cashmere Sweater",
      slug: "aurelia-mongolian-cashmere-sweater",
      sku: "AUR-CSH-SWT",
      description:
        "Made exclusively from sustainably sourced Grade-A Inner Mongolian cashmere. Cloud-soft warmth with an elegant ribbed crewneck cut.",
      shortDescription: "100% Grade-A Cashmere, Featherlight Warmth, Classic Crewneck.",
      price: 6499,
      compareAtPrice: 8999,
      discountPercent: 27,
      taxRate: 12,
      featured: true,
      rating: 4.9,
      reviewCount: 33,
      categoryId: catFashion.id,
      subcategoryId: subWomenClothing.id,
      brandId: brandAurelia.id,
      stock: 35,
      images: [
        { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 26. Precision Kitchen Scale & Timer
    {
      name: "CulinaryCraft Precision Smart Coffee & Kitchen Scale",
      slug: "culinarycraft-smart-kitchen-scale",
      sku: "CUL-SCL-01",
      description:
        "Ultra-accurate to 0.1g with integrated auto-flow timer, high-contrast invisible LED display, and heat-resistant silicone protector.",
      shortDescription: "0.1g Precision, Auto-Timer, USB-C Rechargeable.",
      price: 1999,
      compareAtPrice: 2799,
      discountPercent: 28,
      taxRate: 18,
      featured: false,
      rating: 4.7,
      reviewCount: 41,
      categoryId: catHome.id,
      subcategoryId: subKitchen.id,
      brandId: brandCulinary.id,
      stock: 65,
      images: [
        { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 27. High-Speed MagSafe Wireless Power Bank
    {
      name: "VoltGear MagCharge 10,000mAh Ultra-Slim Power Bank",
      slug: "voltgear-magcharge-power-bank",
      sku: "VOLT-PB-MAG",
      description:
        "Strong neodymium magnetic lock aligns with iPhone 12-16 series. 15W wireless output plus 20W PD Type-C fast bi-directional charging.",
      shortDescription: "10,000mAh Capacity, Strong Magnetic Snap, 20W USB-C PD.",
      price: 2499,
      compareAtPrice: 3499,
      discountPercent: 28,
      taxRate: 18,
      featured: false,
      rating: 4.8,
      reviewCount: 88,
      categoryId: catElectronics.id,
      subcategoryId: subSmartphones.id,
      brandId: brandVolt.id,
      stock: 110,
      images: [
        { url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 28. Smart Wi-Fi 6E Mesh Router
    {
      name: "Zenith Nexus Mesh Wi-Fi 6E Dual-Band System",
      slug: "zenith-nexus-mesh-wifi-router",
      sku: "ZEN-WIFI-6E",
      description:
        "Covers up to 5,500 sq. ft. with lag-free speeds up to 5.4 Gbps. Connects up to 200 devices with AI-optimized beamforming and WPA3 security.",
      shortDescription: "Tri-Band 5.4Gbps, 5500 Sq Ft Coverage, 200+ Devices.",
      price: 13999,
      compareAtPrice: 17999,
      discountPercent: 22,
      taxRate: 18,
      featured: false,
      rating: 4.6,
      reviewCount: 23,
      categoryId: catElectronics.id,
      subcategoryId: subLaptops.id,
      brandId: brandZenith.id,
      stock: 28,
      images: [
        { url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 29. Vintage Automatic Mechanical Watch
    {
      name: "Aurelia Chrono Heritage Automatic Watch",
      slug: "aurelia-chrono-heritage-automatic-watch",
      sku: "AUR-WTC-AUTO",
      description:
        "Japanese 24-jewel automatic movement with 41-hour power reserve. Exhibition caseback, sapphire crystal with anti-glare, and hand-stitched horween leather strap.",
      shortDescription: "Automatic 24-Jewel Movement, Sapphire Glass, 50m Water Resist.",
      price: 15999,
      compareAtPrice: 21999,
      discountPercent: 27,
      taxRate: 18,
      featured: true,
      rating: 4.9,
      reviewCount: 37,
      categoryId: catFashion.id,
      subcategoryId: subMenClothing.id,
      brandId: brandAurelia.id,
      stock: 20,
      images: [
        { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 30. Smart Adjustable Dumbbells Set
    {
      name: "PulseFit QuickSelect Adjustable Dumbbells (2.5 - 24kg)",
      slug: "pulsefit-quickselect-adjustable-dumbbells",
      sku: "PULSE-DB-24",
      description:
        "Replaces 15 sets of weights in one compact tray. Turn the dial to smoothly adjust from 2.5kg up to 24kg with heavy-duty interlocking steel plates.",
      shortDescription: "Replaces 15 Dumbbells, 2.5kg to 24kg per hand, Steel Plates.",
      price: 14999,
      compareAtPrice: 19999,
      discountPercent: 25,
      taxRate: 18,
      featured: true,
      rating: 4.8,
      reviewCount: 49,
      categoryId: catFitness.id,
      subcategoryId: subSmartWearables.id,
      brandId: brandPulse.id,
      stock: 25,
      images: [
        { url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 31. Artisan Scent Diffuser
    {
      name: "UrbanWeave Ultrasonic Aromatherapy Stone Diffuser",
      slug: "urbanweave-ultrasonic-stone-diffuser",
      sku: "URB-DIF-01",
      description:
        "Crafted from matte stone ceramic. Ultrasonic vibrations disperse natural essential oils without heat, preserving holistic therapeutic properties.",
      shortDescription: "Matte Ceramic Stone, Whisper Quiet, Auto Shut-Off.",
      price: 2499,
      compareAtPrice: 3299,
      discountPercent: 24,
      taxRate: 18,
      featured: false,
      rating: 4.7,
      reviewCount: 34,
      categoryId: catHome.id,
      subcategoryId: subDecor.id,
      brandId: brandUrban.id,
      stock: 55,
      images: [
        { url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
    // 32. 4K Ultra-Wide Curved Monitor
    {
      name: "Zenith Curved UltraWide 34\" Productivity Display",
      slug: "zenith-curved-ultrawide-34-monitor",
      sku: "ZEN-MN-34",
      description:
        "WQHD 3440 x 1440 IPS panel with 1900R curve, 98% DCI-P3 color accuracy, and 90W USB-C single cable docking to power your laptop.",
      shortDescription: "34\" WQHD 144Hz, 1900R Curve, 90W USB-C Charging Hub.",
      price: 46999,
      compareAtPrice: 56999,
      discountPercent: 17,
      taxRate: 18,
      featured: true,
      rating: 4.9,
      reviewCount: 26,
      categoryId: catElectronics.id,
      subcategoryId: subLaptops.id,
      brandId: brandZenith.id,
      stock: 18,
      images: [
        { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop", isPrimary: true, order: 0 },
      ],
    },
  ];

  console.log(`Inserting ${productsData.length} products with variants and inventory...`);

  const createdProducts = [];

  for (const item of productsData) {
    const { images, variants, stock, ...productFields } = item;

    const createdProduct = await prisma.product.create({
      data: {
        ...productFields,
        status: "PUBLISHED",
        images: {
          create: images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
        inventory: {
          create: {
            quantity: stock,
            reservedQuantity: 0,
            lowStockThreshold: 5,
          },
        },
      },
    });

    // Create Rating breakdown distribution
    await prisma.rating.create({
      data: {
        productId: createdProduct.id,
        average: createdProduct.rating,
        totalCount: createdProduct.reviewCount,
        fiveStar: Math.round(createdProduct.reviewCount * 0.75),
        fourStar: Math.round(createdProduct.reviewCount * 0.18),
        threeStar: Math.round(createdProduct.reviewCount * 0.05),
        twoStar: Math.round(createdProduct.reviewCount * 0.01),
        oneStar: Math.round(createdProduct.reviewCount * 0.01),
      },
    });

    // Connect to seller
    await prisma.sellerProduct.create({
      data: {
        sellerId: seller.id,
        productId: createdProduct.id,
      },
    });

    // Create variants if defined
    if (variants && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            sku: v.sku,
            title: v.title,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
          },
        });
      }
    }

    createdProducts.push(createdProduct);
  }

  // Create sample verified reviews for customer on top products
  const topProduct1 = createdProducts[0]; // Zenith Pro 16
  const topProduct2 = createdProducts[1]; // NovaAudio Apex Pro ANC

  await prisma.review.create({
    data: {
      productId: topProduct1.id,
      userId: customer.id,
      rating: 5,
      title: "Phenomenal build quality and camera!",
      comment:
        "Upgraded from my 3-year-old phone and this is night and day. The titanium finish feels so premium and the battery easily lasts me 1.5 days even with high usage. Delivery took just 2 days in Bangalore!",
      isVerified: true,
      helpfulVotes: 14,
    },
  });

  await prisma.review.create({
    data: {
      productId: topProduct2.id,
      userId: customer.id,
      rating: 5,
      title: "Best ANC headphones under ₹20,000",
      comment:
        "I fly frequently and these completely block engine drone. The earcups are super soft memory foam and soundstage is crisp with tight, punchy bass. Absolutely recommended.",
      isVerified: true,
      helpfulVotes: 23,
    },
  });

  // Create Sample Order for Customer
  const orderNumber = "NC-2026-84920";
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: customer.id,
      addressId: address1.id,
      status: "SHIPPED",
      subtotal: 14999,
      discountAmount: 500,
      shippingAmount: 0,
      taxAmount: 2609.82,
      totalAmount: 14499,
      couponCode: "WELCOME50",
      items: {
        create: [
          {
            productId: topProduct2.id,
            quantity: 1,
            price: 14999,
            total: 14999,
          },
        ],
      },
      payment: {
        create: {
          amount: 14499,
          currency: "INR",
          provider: "RAZORPAY",
          method: "UPI",
          status: "SUCCESS",
          transactionId: "pay_sample_razorpay_99812",
        },
      },
      shipment: {
        create: {
          carrier: "NovaCart Express",
          trackingNumber: "TRK899201948IN",
          status: "IN_TRANSIT",
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          shippedAt: new Date(),
        },
      },
    },
  });

  // Sample Delivered Order
  await prisma.order.create({
    data: {
      orderNumber: "NC-2026-72810",
      userId: customer.id,
      addressId: address1.id,
      status: "DELIVERED",
      subtotal: 2799,
      discountAmount: 100,
      shippingAmount: 0,
      taxAmount: 486,
      totalAmount: 2699,
      couponCode: "FLAT100",
      items: {
        create: [
          {
            productId: createdProducts[5].id, // GaN Charger
            quantity: 1,
            price: 2799,
            total: 2799,
          },
        ],
      },
      payment: {
        create: {
          amount: 2699,
          currency: "INR",
          provider: "COD",
          method: "CASH",
          status: "SUCCESS",
          transactionId: "COD_NC-2026-72810_PAID",
        },
      },
      shipment: {
        create: {
          carrier: "NovaCart Express",
          trackingNumber: "TRK728100223IN",
          status: "DELIVERED",
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("Seeding completed successfully!");
  console.log("Demo Accounts Created:");
  console.log("- Admin: admin@hubstore.com / Admin@12345");
  console.log("- Seller: seller@hubstore.com / Seller@12345");
  console.log("- Customer: customer@hubstore.com / Customer@12345");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
