// Simple initialization script for Payload
const { getPayload } = require("payload");
const dotenv = require("dotenv");

dotenv.config();

async function init() {
  console.log("Initializing Payload database...");
  
  try {
    // Import the config
    const configModule = await import("./src/payload.config.ts");
    const config = configModule.default;
    
    console.log("Getting Payload instance...");
    const payload = await getPayload({ config });
    
    console.log("✅ Payload initialized successfully!");
    
    // Try to fetch data to verify connection
    const users = await payload.find({
      collection: "users",
      limit: 1,
    });
    
    console.log(`Found ${users.totalDocs} users in database`);
    
    if (users.totalDocs === 0) {
      console.log("\n⚠️  No users found. You may need to run: pnpm db:seed:payload");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize Payload:", error.message);
    process.exit(1);
  }
}

init();