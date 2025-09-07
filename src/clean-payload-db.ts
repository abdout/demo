import { getPayload } from "payload";
import dotenv from "dotenv";
import path from "path";

// Load environment variables BEFORE importing config
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Now import config after env vars are loaded
import config from "@payload-config";

async function cleanDatabase() {
  console.log("🧹 Starting database cleanup...");
  console.log("📋 Environment check:");
  console.log("  - PAYLOAD_SECRET:", process.env.PAYLOAD_SECRET ? "✅ Set" : "❌ Not set");
  console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");

  const payload = await getPayload({ config });

  try {
    // Delete in correct order to avoid foreign key constraints
    console.log("🗑️ Deleting reviews...");
    const reviews = await payload.find({ collection: "reviews", pagination: false });
    for (const review of reviews.docs) {
      try {
        await payload.delete({ collection: "reviews", id: review.id });
      } catch {
        console.log(`  - Could not delete review ${review.id}`);
      }
    }

    console.log("🗑️ Deleting orders...");
    const orders = await payload.find({ collection: "orders", pagination: false });
    for (const order of orders.docs) {
      try {
        await payload.delete({ collection: "orders", id: order.id });
      } catch {
        console.log(`  - Could not delete order ${order.id}`);
      }
    }

    console.log("🗑️ Deleting books...");
    const books = await payload.find({ collection: "books", pagination: false });
    for (const book of books.docs) {
      try {
        await payload.delete({ collection: "books", id: book.id });
      } catch {
        console.log(`  - Could not delete book ${book.id}`);
      }
    }

    console.log("🗑️ Deleting tags...");
    const tags = await payload.find({ collection: "tags", pagination: false });
    for (const tag of tags.docs) {
      try {
        await payload.delete({ collection: "tags", id: tag.id });
      } catch {
        console.log(`  - Could not delete tag ${tag.id}`);
      }
    }

    console.log("🗑️ Deleting categories...");
    const categories = await payload.find({ collection: "categories", pagination: false });
    // Delete subcategories first (those with parents)
    const subcategories = categories.docs.filter(c => c.parent);
    const parentCategories = categories.docs.filter(c => !c.parent);
    
    for (const category of subcategories) {
      try {
        await payload.delete({ collection: "categories", id: category.id });
      } catch {
        console.log(`  - Could not delete subcategory ${category.id}`);
      }
    }
    
    for (const category of parentCategories) {
      try {
        await payload.delete({ collection: "categories", id: category.id });
      } catch {
        console.log(`  - Could not delete category ${category.id}`);
      }
    }

    console.log("🗑️ Deleting users...");
    const users = await payload.find({ collection: "users", pagination: false });
    for (const user of users.docs) {
      try {
        await payload.delete({ collection: "users", id: user.id });
      } catch {
        console.log(`  - Could not delete user ${user.id}`);
      }
    }

    console.log("🗑️ Deleting tenants...");
    const tenants = await payload.find({ collection: "tenants", pagination: false });
    for (const tenant of tenants.docs) {
      try {
        await payload.delete({ collection: "tenants", id: tenant.id });
      } catch {
        console.log(`  - Could not delete tenant ${tenant.id}`);
      }
    }

    console.log("🗑️ Deleting media...");
    const media = await payload.find({ collection: "media", pagination: false });
    for (const item of media.docs) {
      try {
        await payload.delete({ collection: "media", id: item.id });
      } catch {
        console.log(`  - Could not delete media ${item.id}`);
      }
    }

    console.log("\n✅ Database cleaned successfully!");
    
    // Verify
    const finalCheck = {
      categories: await payload.find({ collection: "categories", limit: 1 }),
      books: await payload.find({ collection: "books", limit: 1 }),
      users: await payload.find({ collection: "users", limit: 1 }),
      tenants: await payload.find({ collection: "tenants", limit: 1 }),
    };
    
    console.log("\n📊 Final database state:");
    console.log(`   - Categories: ${finalCheck.categories.totalDocs}`);
    console.log(`   - Books: ${finalCheck.books.totalDocs}`);
    console.log(`   - Users: ${finalCheck.users.totalDocs}`);
    console.log(`   - Tenants: ${finalCheck.tenants.totalDocs}`);
    
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }

  process.exit(0);
}

cleanDatabase();