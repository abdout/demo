import { getPayload } from "payload";
import dotenv from "dotenv";
import path from "path";

// Load environment variables BEFORE importing config
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Now import config after env vars are loaded
import config from "@payload-config";

async function seed() {
  console.log("🌱 Starting Payload CMS database seed...");
  console.log("📋 Environment check:");
  console.log("  - PAYLOAD_SECRET:", process.env.PAYLOAD_SECRET ? "✅ Set" : "❌ Not set");
  console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");

  if (!process.env.PAYLOAD_SECRET) {
    console.error("❌ PAYLOAD_SECRET is not set in environment variables!");
    process.exit(1);
  }

  const payload = await getPayload({ config });

  try {
    // Check if we should clean existing data
    // const existingUsers = await payload.find({
    //   collection: "users",
    //   limit: 1,
    // });
    
    const existingData = {
      users: await payload.find({ collection: "users", limit: 1 }),
      categories: await payload.find({ collection: "categories", limit: 1 }),
      books: await payload.find({ collection: "books", limit: 1 }),
      tenants: await payload.find({ collection: "tenants", limit: 1 }),
    };
    
    console.log(`\n📊 Current data in database:`);
    console.log(`   - Users: ${existingData.users.totalDocs}`);
    console.log(`   - Categories: ${existingData.categories.totalDocs}`);
    console.log(`   - Books: ${existingData.books.totalDocs}`);
    console.log(`   - Tenants: ${existingData.tenants.totalDocs}`);
    
    if (existingData.categories.totalDocs > 20 && existingData.books.totalDocs > 5) {
      console.log("\n✅ Data already fully seeded! Skipping...");
      console.log("   Run 'pnpm db:reset:payload' to clean and reseed.");
      process.exit(0);
    }
    
    console.log("\n🌱 Proceeding with seed...");

    // Create or find super admin user
    console.log("👤 Setting up admin user...");
    let adminUser;
    try {
      // Try to find existing admin
      const existingAdmin = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: "admin@example.com",
          },
        },
        limit: 1,
      });
      
      if (existingAdmin.docs.length > 0) {
        adminUser = existingAdmin.docs[0];
        console.log("   - Using existing admin user");
      } else {
        adminUser = await payload.create({
          collection: "users",
          data: {
            email: "admin@example.com",
            username: "admin",
            password: "admin123",
            roles: ["super-admin"],
          },
        });
        console.log("   - Created new admin user");
      }
    } catch {
      // If creation fails, try a different email
      adminUser = await payload.create({
        collection: "users",
        data: {
          email: `admin${Date.now()}@example.com`,
          username: "admin",
          password: "admin123",
          roles: ["super-admin"],
        },
      });
      console.log("   - Created admin with unique email");
    }

    // Create or find demo tenant
    console.log("🏪 Setting up demo tenant...");
    let demoTenant;
    try {
      const existingTenant = await payload.find({
        collection: "tenants",
        where: {
          slug: {
            equals: "demo",
          },
        },
        limit: 1,
      });
      
      if (existingTenant.docs.length > 0) {
        demoTenant = existingTenant.docs[0];
        console.log("   - Using existing demo tenant");
      } else {
        demoTenant = await payload.create({
          collection: "tenants",
          data: {
            name: "Demo Bookstore",
            slug: "demo",
            stripeAccountId: "acct_demo_123",
            stripeDetailsSubmitted: true,
          },
        });
        console.log("   - Created new demo tenant");
      }
    } catch {
      demoTenant = await payload.create({
        collection: "tenants",
        data: {
          name: "Demo Bookstore",
          slug: `demo-${Date.now()}`,
          stripeAccountId: `acct_demo_${Date.now()}`,
          stripeDetailsSubmitted: true,
        },
      });
      console.log("   - Created tenant with unique slug");
    }

    // Update admin user with tenant
    await payload.update({
      collection: "users",
      id: adminUser.id,
      data: {
        tenants: [
          {
            tenant: demoTenant.id,
          },
        ],
      },
    });

    // Create main categories
    console.log("📚 Creating categories and subcategories...");
    
    // Helper function to create or find category
    const findOrCreateCategory = async (data: {
      name: string;
      slug: string;
      color: string;
      parent?: string | number;
      subcategories?: { docs: string[] };
    }) => {
      try {
        const existing = await payload.find({
          collection: "categories",
          where: {
            slug: {
              equals: data.slug,
            },
          },
          limit: 1,
        });
        
        if (existing.docs.length > 0) {
          console.log(`   - Category "${data.name}" already exists`);
          return existing.docs[0];
        }
        
        const created = await payload.create({
          collection: "categories",
          data,
        });
        console.log(`   ✅ Created category "${data.name}"`);
        return created;
      } catch {
        console.log(`   ❌ Could not create category "${data.name}"`);
        throw e;
      }
    };
    
    // Electronics & Technology
    const electronicsCategory = await findOrCreateCategory({
      name: "Electronics",
      slug: "electronics",
      color: "#3B82F6",
    });

    // Electronics subcategories
    const smartphones = await findOrCreateCategory({
      name: "Smartphones",
      slug: "smartphones",
      color: "#60A5FA",
      parent: electronicsCategory.id,
    });

    const laptops = await payload.create({
      collection: "categories",
      data: {
        name: "Laptops & Computers",
        slug: "laptops-computers",
        color: "#93C5FD",
        parent: electronicsCategory.id,
      },
    });

    const headphones = await payload.create({
      collection: "categories",
      data: {
        name: "Headphones & Audio",
        slug: "headphones-audio",
        color: "#BFDBFE",
        parent: electronicsCategory.id,
      },
    });

    const gaming = await payload.create({
      collection: "categories",
      data: {
        name: "Gaming",
        slug: "gaming",
        color: "#1E40AF",
        parent: electronicsCategory.id,
      },
    });

    // Fashion
    const fashionCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Fashion",
        slug: "fashion",
        color: "#EC4899",
      },
    });

    // Fashion subcategories
    const mensClothing = await payload.create({
      collection: "categories",
      data: {
        name: "Men's Clothing",
        slug: "mens-clothing",
        color: "#F472B6",
        parent: fashionCategory.id,
      },
    });

    const womensClothing = await payload.create({
      collection: "categories",
      data: {
        name: "Women's Clothing",
        slug: "womens-clothing",
        color: "#F9A8D4",
        parent: fashionCategory.id,
      },
    });

    const shoes = await payload.create({
      collection: "categories",
      data: {
        name: "Shoes",
        slug: "shoes",
        color: "#FBB6CE",
        parent: fashionCategory.id,
      },
    });

    const accessories = await payload.create({
      collection: "categories",
      data: {
        name: "Accessories",
        slug: "accessories",
        color: "#BE185D",
        parent: fashionCategory.id,
      },
    });

    // Home & Garden
    const homeCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Home & Garden",
        slug: "home-garden",
        color: "#10B981",
      },
    });

    // Home subcategories
    const furniture = await payload.create({
      collection: "categories",
      data: {
        name: "Furniture",
        slug: "furniture",
        color: "#34D399",
        parent: homeCategory.id,
      },
    });

    const kitchen = await payload.create({
      collection: "categories",
      data: {
        name: "Kitchen & Dining",
        slug: "kitchen-dining",
        color: "#6EE7B7",
        parent: homeCategory.id,
      },
    });

    const decor = await payload.create({
      collection: "categories",
      data: {
        name: "Home Decor",
        slug: "home-decor",
        color: "#A7F3D0",
        parent: homeCategory.id,
      },
    });

    const garden = await payload.create({
      collection: "categories",
      data: {
        name: "Garden & Outdoor",
        slug: "garden-outdoor",
        color: "#059669",
        parent: homeCategory.id,
      },
    });

    // Sports & Outdoors
    const sportsCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Sports & Outdoors",
        slug: "sports-outdoors",
        color: "#F59E0B",
      },
    });

    // Sports subcategories
    const fitness = await payload.create({
      collection: "categories",
      data: {
        name: "Fitness Equipment",
        slug: "fitness-equipment",
        color: "#FCD34D",
        parent: sportsCategory.id,
      },
    });

    const outdoor = await payload.create({
      collection: "categories",
      data: {
        name: "Outdoor Gear",
        slug: "outdoor-gear",
        color: "#FDE68A",
        parent: sportsCategory.id,
      },
    });

    const sportswear = await payload.create({
      collection: "categories",
      data: {
        name: "Sportswear",
        slug: "sportswear",
        color: "#FEF3C7",
        parent: sportsCategory.id,
      },
    });

    // Books & Media
    const booksCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Books & Media",
        slug: "books-media",
        color: "#8B5CF6",
      },
    });

    // Books subcategories
    const fiction = await payload.create({
      collection: "categories",
      data: {
        name: "Fiction",
        slug: "fiction",
        color: "#A78BFA",
        parent: booksCategory.id,
      },
    });

    const nonFiction = await payload.create({
      collection: "categories",
      data: {
        name: "Non-Fiction",
        slug: "non-fiction",
        color: "#C4B5FD",
        parent: booksCategory.id,
      },
    });

    const ebooks = await payload.create({
      collection: "categories",
      data: {
        name: "E-Books",
        slug: "ebooks",
        color: "#DDD6FE",
        parent: booksCategory.id,
      },
    });

    // Beauty & Health
    const beautyCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Beauty & Health",
        slug: "beauty-health",
        color: "#EF4444",
      },
    });

    // Beauty subcategories
    const skincare = await payload.create({
      collection: "categories",
      data: {
        name: "Skincare",
        slug: "skincare",
        color: "#F87171",
        parent: beautyCategory.id,
      },
    });

    const makeup = await payload.create({
      collection: "categories",
      data: {
        name: "Makeup",
        slug: "makeup",
        color: "#FCA5A5",
        parent: beautyCategory.id,
      },
    });

    const health = await payload.create({
      collection: "categories",
      data: {
        name: "Health & Wellness",
        slug: "health-wellness",
        color: "#FECACA",
        parent: beautyCategory.id,
      },
    });

    // Toys & Kids
    const toysCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Toys & Kids",
        slug: "toys-kids",
        color: "#06B6D4",
      },
    });

    // Toys subcategories
    const toys = await payload.create({
      collection: "categories",
      data: {
        name: "Toys & Games",
        slug: "toys-games",
        color: "#22D3EE",
        parent: toysCategory.id,
      },
    });

    const babyProducts = await payload.create({
      collection: "categories",
      data: {
        name: "Baby Products",
        slug: "baby-products",
        color: "#67E8F9",
        parent: toysCategory.id,
      },
    });

    const kidsClothing = await payload.create({
      collection: "categories",
      data: {
        name: "Kids Clothing",
        slug: "kids-clothing",
        color: "#A5F3FC",
        parent: toysCategory.id,
      },
    });

    // Food & Grocery
    const foodCategory = await payload.create({
      collection: "categories",
      data: {
        name: "Food & Grocery",
        slug: "food-grocery",
        color: "#84CC16",
      },
    });

    // Food subcategories
    const snacks = await payload.create({
      collection: "categories",
      data: {
        name: "Snacks & Beverages",
        slug: "snacks-beverages",
        color: "#A3E635",
        parent: foodCategory.id,
      },
    });

    const organic = await payload.create({
      collection: "categories",
      data: {
        name: "Organic & Natural",
        slug: "organic-natural",
        color: "#BEF264",
        parent: foodCategory.id,
      },
    });

    const pantry = await payload.create({
      collection: "categories",
      data: {
        name: "Pantry Staples",
        slug: "pantry-staples",
        color: "#D9F99D",
        parent: foodCategory.id,
      },
    });

    // Update parent categories with their subcategories
    await payload.update({
      collection: "categories",
      id: electronicsCategory.id,
      data: {
        subcategories: {
          docs: [smartphones.id, laptops.id, headphones.id, gaming.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: fashionCategory.id,
      data: {
        subcategories: {
          docs: [mensClothing.id, womensClothing.id, shoes.id, accessories.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: homeCategory.id,
      data: {
        subcategories: {
          docs: [furniture.id, kitchen.id, decor.id, garden.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: sportsCategory.id,
      data: {
        subcategories: {
          docs: [fitness.id, outdoor.id, sportswear.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: booksCategory.id,
      data: {
        subcategories: {
          docs: [fiction.id, nonFiction.id, ebooks.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: beautyCategory.id,
      data: {
        subcategories: {
          docs: [skincare.id, makeup.id, health.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: toysCategory.id,
      data: {
        subcategories: {
          docs: [toys.id, babyProducts.id, kidsClothing.id],
        },
      },
    });

    await payload.update({
      collection: "categories",
      id: foodCategory.id,
      data: {
        subcategories: {
          docs: [snacks.id, organic.id, pantry.id],
        },
      },
    });

    // Create tags
    console.log("🏷️ Creating tags...");
    const bestsellerTag = await payload.create({
      collection: "tags",
      data: {
        name: "bestseller",
      },
    });

    const newReleaseTag = await payload.create({
      collection: "tags",
      data: {
        name: "new-release",
      },
    });

    const classicTag = await payload.create({
      collection: "tags",
      data: {
        name: "classic",
      },
    });

    const recommendedTag = await payload.create({
      collection: "tags",
      data: {
        name: "recommended",
      },
    });

    // Create sample books
    console.log("📖 Creating sample books...");
    
    const book1 = await payload.create({
      collection: "books",
      data: {
        name: "The Great Adventure",
        author: "John Doe",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "An epic tale of adventure and discovery. Follow our hero as they journey through mystical lands, facing challenges and uncovering ancient secrets." },
            ],
          },
        ],
        price: 19.99,
        refundPolicy: "30-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "Full content of the book would go here..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: fictionCategory.id,
        tags: [bestsellerTag.id, classicTag.id],
      },
    });

    const book2 = await payload.create({
      collection: "books",
      data: {
        name: "Learning TypeScript",
        author: "Jane Smith",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "Master TypeScript from basics to advanced concepts. This comprehensive guide covers everything from setup to advanced type system features." },
            ],
          },
        ],
        price: 39.99,
        refundPolicy: "14-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "Complete TypeScript guide content..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: techCategory.id,
        tags: [newReleaseTag.id, recommendedTag.id],
      },
    });

    const book3 = await payload.create({
      collection: "books",
      data: {
        name: "History of Science",
        author: "Dr. Robert Brown",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "A comprehensive look at scientific discoveries through the ages. From ancient astronomy to modern quantum physics." },
            ],
          },
        ],
        price: 29.99,
        refundPolicy: "30-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "Science history content..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: scienceCategory.id,
        tags: [bestsellerTag.id],
      },
    });

    await payload.create({
      collection: "books",
      data: {
        name: "The Startup Playbook",
        author: "Sarah Johnson",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "Essential strategies for building and scaling your startup. Learn from real-world examples and proven methodologies." },
            ],
          },
        ],
        price: 34.99,
        refundPolicy: "7-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "Startup guide content..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: businessCategory.id,
        tags: [newReleaseTag.id, bestsellerTag.id],
      },
    });

    await payload.create({
      collection: "books",
      data: {
        name: "The Martian Chronicles",
        author: "Alex Turner",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "A thrilling sci-fi adventure set on Mars. Humanity's first colony faces unexpected challenges in this gripping tale." },
            ],
          },
        ],
        price: 24.99,
        refundPolicy: "30-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "Sci-fi adventure content..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: sciFiCategory.id,
        tags: [recommendedTag.id],
      },
    });

    await payload.create({
      collection: "books",
      data: {
        name: "JavaScript: The Good Parts",
        author: "Michael Chen",
        description: [
          {
            type: "paragraph",
            children: [
              { text: "Discover the elegant and powerful features of JavaScript. Learn to write clean, efficient, and maintainable code." },
            ],
          },
        ],
        price: 32.99,
        refundPolicy: "14-day",
        content: [
          {
            type: "paragraph",
            children: [{ text: "JavaScript guide content..." }],
          },
        ],
        isPrivate: false,
        isArchived: false,
        tenant: demoTenant.id,
        category: techCategory.id,
        tags: [classicTag.id, recommendedTag.id],
      },
    });

    // Create a regular user for testing
    console.log("👤 Creating test user...");
    const regularUser = await payload.create({
      collection: "users",
      data: {
        email: "user@example.com",
        username: "testuser",
        password: "user123",
        roles: ["user"],
      },
    });

    // Create sample order
    console.log("📦 Creating sample order...");
    await payload.create({
      collection: "orders",
      data: {
        name: "Order #1",
        stripeCheckoutSessionId: "cs_test_123456",
        stripeAccountId: "acct_demo_123",
        user: regularUser.id,
        book: book1.id,
        tenant: demoTenant.id,
      },
    });

    // Create sample reviews
    console.log("⭐ Creating sample reviews...");
    await payload.create({
      collection: "reviews",
      data: {
        description:
          "Amazing book! Highly recommended for anyone interested in adventure stories.",
        rating: 5,
        book: book1.id,
        user: regularUser.id,
        tenant: demoTenant.id,
      },
    });

    await payload.create({
      collection: "reviews",
      data: {
        description:
          "Great resource for learning TypeScript. Very detailed and well-explained.",
        rating: 4,
        book: book2.id,
        user: adminUser.id,
        tenant: demoTenant.id,
      },
    });

    await payload.create({
      collection: "reviews",
      data: {
        description: "Excellent overview of scientific history. Well-written and engaging.",
        rating: 5,
        book: book3.id,
        user: regularUser.id,
        tenant: demoTenant.id,
      },
    });

    console.log("\n🎉 Payload CMS database seeding completed successfully!");
    console.log("\nYou can log in with:");
    console.log("Admin: admin@example.com / admin123");
    console.log("User: user@example.com / user123");
    console.log("\nAccess the admin panel at: http://localhost:3000/admin");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();