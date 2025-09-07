import { getPayload, Payload } from "payload";
import config from "./src/payload.config";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  console.log("🚀 Starting Payload migration...");
  
  let payload: Payload;
  
  try {
    payload = await getPayload({ config });
    console.log("✅ Connected to Payload");
    
    // Run migrations
    console.log("📦 Running Payload migrations...");
    await payload.db.migrate();
    console.log("✅ Migrations completed successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();