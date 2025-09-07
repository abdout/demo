import { NextResponse } from "next/server";
import type { Collection } from "payload";

export async function GET() {
  console.log("🔍 [Test Simple] Testing basic endpoint...");
  console.log("🔍 [Test Simple] DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("🔍 [Test Simple] PAYLOAD_SECRET exists:", !!process.env.PAYLOAD_SECRET);
  console.log("🔍 [Test Simple] NODE_ENV:", process.env.NODE_ENV);
  
  // Try to import Payload config
  try {
    console.log("🔍 [Test Simple] Importing Payload config...");
    const config = await import("@payload-config");
    console.log("✅ [Test Simple] Payload config imported successfully");
    console.log("🔍 [Test Simple] Config loaded");
    
    // Try to get Payload instance
    console.log("🔍 [Test Simple] Getting Payload instance...");
    const { getPayload } = await import("payload");
    
    // Set a timeout for Payload initialization
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Payload initialization timeout after 5 seconds")), 5000)
    );
    
    const payloadPromise = getPayload({ config: config.default });
    
    try {
      const payload = await Promise.race([payloadPromise, timeoutPromise]) as Awaited<ReturnType<typeof getPayload>>;
      console.log("✅ [Test Simple] Payload instance created");
      
      // Quick test to see if we can access collections
      const collections = payload.config.collections;
      console.log("✅ [Test Simple] Available collections:", collections.map((c: Collection) => c.slug).join(", "));
      
      return NextResponse.json({
        status: "success",
        message: "Payload connected",
        collections: collections.map((c: Collection) => c.slug),
      });
    } catch {
      console.error("⏱️ [Test Simple] Payload initialization timed out");
      return NextResponse.json({
        status: "timeout",
        message: "Payload initialization timed out - likely database connection issue",
        databaseUrlSet: !!process.env.DATABASE_URL,
      });
    }
  } catch (error) {
    console.error("❌ [Test Simple] Error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined,
    }, { status: 500 });
  }
}