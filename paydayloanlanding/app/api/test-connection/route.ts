export async function GET() {
  try {
    console.log("[v0] Testing MongoDB connection...")

    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      return Response.json(
        {
          success: false,
          error: "MONGODB_URI environment variable is not set",
          steps: [
            "1. Add MONGODB_URI to your environment variables",
            "2. Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority",
          ],
        },
        { status: 500 },
      )
    }

    // Show connection string format (without credentials)
    const uri = process.env.MONGODB_URI.replace(/<([^>]+)>/g, "$1")
    const safeUri = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
    console.log("[v0] Connection string format:", safeUri)

    // Test basic connection
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    console.log("[v0] Basic connection successful")

    // Test database access
    const db = client.db("payday")
    await db.admin().ping()
    console.log("[v0] Database ping successful")

    // Test collection access
    const collection = db.collection("applications")
    const count = await collection.countDocuments()
    console.log("[v0] Collection access successful, documents:", count)

    await client.close()

    return Response.json({
      success: true,
      message: "MongoDB connection successful",
      database: "payday",
      collection: "applications",
      documentCount: count,
      connectionString: safeUri,
    })
  } catch (error: any) {
    console.error("[v0] Connection test failed:", error)

    let troubleshooting = []

    if (error.message?.includes("authentication failed")) {
      troubleshooting = [
        "1. Check your MongoDB username and password",
        "2. Ensure the user has read/write permissions",
        "3. Verify the database name in your connection string",
      ]
    } else if (error.message?.includes("connection") || error.message?.includes("timeout")) {
      troubleshooting = [
        "1. Add your IP address to MongoDB Atlas Network Access",
        "2. Check if your connection string is correct",
        "3. Ensure your cluster is running",
      ]
    } else {
      troubleshooting = [
        "1. Verify your MongoDB Atlas cluster is active",
        "2. Check Network Access settings (IP whitelist)",
        "3. Verify Database Access (user permissions)",
        "4. Ensure connection string format is correct",
      ]
    }

    return Response.json(
      {
        success: false,
        error: error.message,
        troubleshooting,
        connectionString: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
      },
      { status: 500 },
    )
  }
}
