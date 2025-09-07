import { getPayload } from "payload";
import config from "./src/payload.config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log("🔍 Testing Payload CMS database connection...");
  console.log("📋 Environment check:");
  console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
  console.log("  - PAYLOAD_SECRET:", process.env.PAYLOAD_SECRET ? "✅ Set" : "❌ Not set");
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in environment variables!");
    process.exit(1);
  }

  try {
    console.log("\n🔌 Attempting to connect to Payload...");
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000);
    });
    
    // Try to get Payload instance with timeout
    const payloadPromise = getPayload({ config });
    const payload = await Promise.race([payloadPromise, timeoutPromise]) as any;
    
    console.log("✅ Successfully connected to Payload!");
    
    // Test each collection
    console.log("\n📊 Testing collections:");
    
    try {
      const categories = await payload.find({
        collection: "categories",
        limit: 1,
      });
      console.log(`  - Categories: ✅ (${categories.totalDocs} total)`);
    } catch (e) {
      console.log(`  - Categories: ❌ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    
    try {
      const books = await payload.find({
        collection: "books",
        limit: 1,
      });
      console.log(`  - Books: ✅ (${books.totalDocs} total)`);
    } catch (e) {
      console.log(`  - Books: ❌ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    
    try {
      const users = await payload.find({
        collection: "users",
        limit: 1,
      });
      console.log(`  - Users: ✅ (${users.totalDocs} total)`);
    } catch (e) {
      console.log(`  - Users: ❌ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    
    try {
      const tenants = await payload.find({
        collection: "tenants",
        limit: 1,
      });
      console.log(`  - Tenants: ✅ (${tenants.totalDocs} total)`);
    } catch (e) {
      console.log(`  - Tenants: ❌ ${e instanceof Error ? e.message : "Unknown error"}`);
    }
    
    console.log("\n🎉 Database connection test completed!");
    
  } catch (error) {
    console.error("\n❌ Failed to connect to Payload:");
    if (error instanceof Error) {
      console.error("  Error:", error.message);
      if (error.message.includes("timeout")) {
        console.error("\n💡 Possible issues:");
        console.error("  1. Database server is not reachable");
        console.error("  2. DATABASE_URL is incorrect");
        console.error("  3. Network/firewall issues");
        console.error("  4. Database server is down");
      }
    } else {
      console.error("  Unknown error:", error);
    }
    process.exit(1);
  }
  
  process.exit(0);
}

testConnection();