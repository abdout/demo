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
    // Check existing data
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

    // Helper function to create or find category
    const findOrCreateCategory = async (data: {
      name: string;
      slug: string;
      color: string;
      parent?: string | number;
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
          return existing.docs[0];
        }
        
        const created = await payload.create({
          collection: "categories",
          data,
        });
        console.log(`   ✅ Created category "${data.name}"`);
        return created;
      } catch (e) {
        console.log(`   ❌ Could not create category "${data.name}": ${e}`);
        return null;
      }
    };

    // Categories structure
    const categoriesData = [
      {
        main: { name: "Electronics", slug: "electronics", color: "#3B82F6" },
        subs: [
          { name: "Smartphones", slug: "smartphones", color: "#60A5FA" },
          { name: "Laptops & Computers", slug: "laptops-computers", color: "#93C5FD" },
          { name: "Headphones & Audio", slug: "headphones-audio", color: "#BFDBFE" },
          { name: "Gaming", slug: "gaming", color: "#1E40AF" },
          { name: "Cameras", slug: "cameras", color: "#2563EB" },
          { name: "Smart Home", slug: "smart-home", color: "#3B82F6" },
        ]
      },
      {
        main: { name: "Fashion", slug: "fashion", color: "#EC4899" },
        subs: [
          { name: "Men's Clothing", slug: "mens-clothing", color: "#F472B6" },
          { name: "Women's Clothing", slug: "womens-clothing", color: "#F9A8D4" },
          { name: "Shoes", slug: "shoes", color: "#FBB6CE" },
          { name: "Accessories", slug: "accessories", color: "#BE185D" },
          { name: "Bags & Luggage", slug: "bags-luggage", color: "#DB2777" },
          { name: "Watches", slug: "watches", color: "#F43F5E" },
        ]
      },
      {
        main: { name: "Home & Garden", slug: "home-garden", color: "#10B981" },
        subs: [
          { name: "Furniture", slug: "furniture", color: "#34D399" },
          { name: "Kitchen & Dining", slug: "kitchen-dining", color: "#6EE7B7" },
          { name: "Home Decor", slug: "home-decor", color: "#A7F3D0" },
          { name: "Garden & Outdoor", slug: "garden-outdoor", color: "#059669" },
          { name: "Bedding & Bath", slug: "bedding-bath", color: "#10B981" },
          { name: "Tools & Hardware", slug: "tools-hardware", color: "#047857" },
        ]
      },
      {
        main: { name: "Sports & Outdoors", slug: "sports-outdoors", color: "#F59E0B" },
        subs: [
          { name: "Fitness Equipment", slug: "fitness-equipment", color: "#FCD34D" },
          { name: "Outdoor Gear", slug: "outdoor-gear", color: "#FDE68A" },
          { name: "Sportswear", slug: "sportswear", color: "#FEF3C7" },
          { name: "Cycling", slug: "cycling", color: "#FBBF24" },
          { name: "Water Sports", slug: "water-sports", color: "#F59E0B" },
        ]
      },
      {
        main: { name: "Books & Media", slug: "books-media", color: "#8B5CF6" },
        subs: [
          { name: "Fiction", slug: "fiction", color: "#A78BFA" },
          { name: "Non-Fiction", slug: "non-fiction", color: "#C4B5FD" },
          { name: "E-Books", slug: "ebooks", color: "#DDD6FE" },
          { name: "Audiobooks", slug: "audiobooks", color: "#9333EA" },
          { name: "Magazines", slug: "magazines", color: "#7C3AED" },
        ]
      },
      {
        main: { name: "Beauty & Health", slug: "beauty-health", color: "#EF4444" },
        subs: [
          { name: "Skincare", slug: "skincare", color: "#F87171" },
          { name: "Makeup", slug: "makeup", color: "#FCA5A5" },
          { name: "Health & Wellness", slug: "health-wellness", color: "#FECACA" },
          { name: "Fragrances", slug: "fragrances", color: "#FEE2E2" },
          { name: "Personal Care", slug: "personal-care", color: "#EF4444" },
        ]
      },
      {
        main: { name: "Toys & Kids", slug: "toys-kids", color: "#06B6D4" },
        subs: [
          { name: "Toys & Games", slug: "toys-games", color: "#22D3EE" },
          { name: "Baby Products", slug: "baby-products", color: "#67E8F9" },
          { name: "Kids Clothing", slug: "kids-clothing", color: "#A5F3FC" },
          { name: "Educational Toys", slug: "educational-toys", color: "#0EA5E9" },
        ]
      },
      {
        main: { name: "Food & Grocery", slug: "food-grocery", color: "#84CC16" },
        subs: [
          { name: "Snacks & Beverages", slug: "snacks-beverages", color: "#A3E635" },
          { name: "Organic & Natural", slug: "organic-natural", color: "#BEF264" },
          { name: "Pantry Staples", slug: "pantry-staples", color: "#D9F99D" },
          { name: "Fresh Produce", slug: "fresh-produce", color: "#65A30D" },
        ]
      },
      {
        main: { name: "Automotive", slug: "automotive", color: "#6B7280" },
        subs: [
          { name: "Car Accessories", slug: "car-accessories", color: "#9CA3AF" },
          { name: "Motorcycle Parts", slug: "motorcycle-parts", color: "#D1D5DB" },
          { name: "Tools & Equipment", slug: "auto-tools", color: "#4B5563" },
        ]
      },
      {
        main: { name: "Pet Supplies", slug: "pet-supplies", color: "#FB923C" },
        subs: [
          { name: "Dog Supplies", slug: "dog-supplies", color: "#FED7AA" },
          { name: "Cat Supplies", slug: "cat-supplies", color: "#FDBA74" },
          { name: "Pet Food", slug: "pet-food", color: "#FB923C" },
        ]
      }
    ];

    // Create categories
    console.log("\n📚 Creating categories and subcategories...");
    for (const categoryGroup of categoriesData) {
      // Create main category
      const mainCategory = await findOrCreateCategory(categoryGroup.main);
      
      if (mainCategory) {
        // Create subcategories
        const subIds = [];
        for (const subData of categoryGroup.subs) {
          const subCategory = await findOrCreateCategory({
            ...subData,
            parent: mainCategory.id,
          });
          if (subCategory) {
            subIds.push(subCategory.id);
          }
        }
        
        // Update main category with subcategories
        if (subIds.length > 0) {
          try {
            await payload.update({
              collection: "categories",
              id: mainCategory.id,
              data: {
                subcategories: {
                  docs: subIds,
                },
              },
            });
          } catch {
            console.log(`   Could not update subcategories for ${mainCategory.name}`);
          }
        }
      }
    }

    // Create or find users and tenants
    console.log("\n👤 Setting up users and tenants...");
    
    // let adminUser;  // Commented out - not used
    try {
      const existingAdmin = await payload.find({
        collection: "users",
        where: {
          email: { equals: "admin@example.com" },
        },
        limit: 1,
      });
      
      if (existingAdmin.docs.length > 0) {
        // adminUser = existingAdmin.docs[0];  // Not used
        console.log("   - Using existing admin user");
      } else {
        await payload.create({
          collection: "users",
          data: {
            email: "admin@example.com",
            username: "admin",
            password: "admin123",
            roles: ["super-admin"],
          },
        });
        console.log("   - Created admin user");
      }
    } catch {
      console.log("   - Could not create admin user");
    }

    let demoTenant;
    try {
      const existingTenant = await payload.find({
        collection: "tenants",
        where: {
          slug: { equals: "demo" },
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
            name: "Demo Store",
            slug: "demo",
            stripeAccountId: "acct_demo_123",
            stripeDetailsSubmitted: true,
          },
        });
        console.log("   - Created demo tenant");
      }
    } catch {
      console.log("   - Could not create tenant");
    }

    // Create sample products if none exist
    if (existingData.books.totalDocs === 0 && demoTenant) {
      console.log("\n📦 Creating sample products...");
      
      // Get some categories for products
      const allCategories = await payload.find({
        collection: "categories",
        pagination: false,
      });
      
      const sampleProducts = [
        {
          name: "iPhone 15 Pro",
          author: "Apple",
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "The latest iPhone with advanced features" }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          price: 999.99,
          category: allCategories.docs.find(c => c.slug === "smartphones")?.id,
          tenant: demoTenant.id,
          refundPolicy: "30-day",
          content: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Product details..." }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          isPrivate: false,
          isArchived: false,
        },
        {
          name: "MacBook Pro 16\"",
          author: "Apple",
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Professional laptop for creators" }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          price: 2499.99,
          category: allCategories.docs.find(c => c.slug === "laptops-computers")?.id,
          tenant: demoTenant.id,
          refundPolicy: "30-day",
          content: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Product details..." }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          isPrivate: false,
          isArchived: false,
        },
        {
          name: "Sony WH-1000XM5",
          author: "Sony",
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Premium noise-canceling headphones" }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          price: 399.99,
          category: allCategories.docs.find(c => c.slug === "headphones-audio")?.id,
          tenant: demoTenant.id,
          refundPolicy: "30-day",
          content: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Product details..." }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          isPrivate: false,
          isArchived: false,
        },
        {
          name: "Nike Air Max 270",
          author: "Nike",
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Comfortable running shoes" }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          price: 150.00,
          category: allCategories.docs.find(c => c.slug === "shoes")?.id,
          tenant: demoTenant.id,
          refundPolicy: "30-day",
          content: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Product details..." }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          isPrivate: false,
          isArchived: false,
        },
        {
          name: "Modern Office Chair",
          author: "ErgoFurniture",
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Ergonomic office chair for all-day comfort" }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          price: 299.99,
          category: allCategories.docs.find(c => c.slug === "furniture")?.id,
          tenant: demoTenant.id,
          refundPolicy: "30-day",
          content: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ text: "Product details..." }], version: 1 }],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1
            }
          },
          isPrivate: false,
          isArchived: false,
        },
      ];

      for (const product of sampleProducts) {
        try {
          await payload.create({
            collection: "books", // Using books collection as products
            data: product,
          });
          console.log(`   ✅ Created product: ${product.name}`);
        } catch {
          console.log(`   ❌ Could not create product: ${product.name}`);
        }
      }
    }

    // Final summary
    const finalData = {
      users: await payload.find({ collection: "users", limit: 1 }),
      categories: await payload.find({ collection: "categories", limit: 1 }),
      books: await payload.find({ collection: "books", limit: 1 }),
      tenants: await payload.find({ collection: "tenants", limit: 1 }),
    };
    
    console.log("\n🎉 Seeding completed!");
    console.log("\n📊 Final database state:");
    console.log(`   - Users: ${finalData.users.totalDocs}`);
    console.log(`   - Categories: ${finalData.categories.totalDocs}`);
    console.log(`   - Products: ${finalData.books.totalDocs}`);
    console.log(`   - Tenants: ${finalData.tenants.totalDocs}`);
    
    console.log("\n✅ You can now access:");
    console.log("   - Frontend: http://localhost:3000");
    console.log("   - Admin Panel: http://localhost:3000/admin");
    console.log("   - Login: admin@example.com / admin123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();