import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 [Test DB] Starting database connection test...");
  
  try {
    // Get Payload instance
    const payload = await getPayload({ config });
    console.log("✅ [Test DB] Payload connected successfully");

    // Test fetching categories
    console.log("🔍 [Test DB] Fetching categories...");
    const categories = await payload.find({
      collection: "categories",
      pagination: false,
    });
    console.log(`✅ [Test DB] Found ${categories.docs.length} categories`);
    
    // Test fetching books
    console.log("🔍 [Test DB] Fetching books...");
    const books = await payload.find({
      collection: "books",
      pagination: false,
    });
    console.log(`✅ [Test DB] Found ${books.docs.length} books`);
    
    // Test fetching users
    console.log("🔍 [Test DB] Fetching users...");
    const users = await payload.find({
      collection: "users",
      pagination: false,
    });
    console.log(`✅ [Test DB] Found ${users.docs.length} users`);
    
    // Test fetching tenants
    console.log("🔍 [Test DB] Fetching tenants...");
    const tenants = await payload.find({
      collection: "tenants",
      pagination: false,
    });
    console.log(`✅ [Test DB] Found ${tenants.docs.length} tenants`);

    const summary = {
      status: "success",
      database: "connected",
      collections: {
        categories: categories.docs.length,
        books: books.docs.length,
        users: users.docs.length,
        tenants: tenants.docs.length,
      },
      sampleData: {
        categories: categories.docs.slice(0, 2).map(c => ({ id: c.id, name: c.name, slug: c.slug })),
        books: books.docs.slice(0, 2).map(b => ({ id: b.id, name: b.name, price: b.price })),
      }
    };

    console.log("📊 [Test DB] Summary:", JSON.stringify(summary, null, 2));
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error("❌ [Test DB] Error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}