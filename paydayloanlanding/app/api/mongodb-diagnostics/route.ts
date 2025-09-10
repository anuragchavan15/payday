import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        error: "MONGODB_URI environment variable is not set",
        troubleshooting: [
          "Add MONGODB_URI to your environment variables",
          "Format: mongodb+srv://username:password@cluster.mongodb.net/database",
        ],
      })
    }

    // Parse connection string to check format
    const uriParts = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)\?/)

    if (!uriParts) {
      return NextResponse.json({
        success: false,
        error: "Invalid MongoDB connection string format",
        provided: mongoUri.replace(/:[^@]+@/, ":****@"), // Hide password
        expected: "mongodb+srv://username:password@cluster.mongodb.net/database?options",
        troubleshooting: [
          "Check your connection string format",
          "Ensure database name is included in the URL",
          "Verify no special characters in password need URL encoding",
        ],
      })
    }

    const [, username, password, cluster, database] = uriParts

    // Test connection without actually connecting
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    })

    try {
      console.log("[v0] Attempting MongoDB connection...")
      await client.connect()
      console.log("[v0] MongoDB connection successful")

      // Test database access
      const db = client.db(database)
      await db.admin().ping()
      console.log("[v0] Database ping successful")

      // Test collection access
      const collection = db.collection("applications")
      await collection.estimatedDocumentCount()
      console.log("[v0] Collection access successful")

      await client.close()

      return NextResponse.json({
        success: true,
        message: "MongoDB connection successful!",
        details: {
          username,
          cluster: cluster.replace(/\./g, "[.]"), // Obfuscate cluster
          database,
          status: "Connected and accessible",
        },
      })
    } catch (connectionError: any) {
      await client.close().catch(() => {})

      let troubleshooting = []
      let errorType = "Unknown connection error"

      if (connectionError.message.includes("authentication failed")) {
        errorType = "Authentication Error"
        troubleshooting = [
          "1. Check your username and password in MongoDB Atlas",
          "2. Ensure the database user exists and has proper permissions",
          "3. Verify password doesn't contain special characters that need URL encoding",
          "4. Try resetting the database user password in MongoDB Atlas",
        ]
      } else if (connectionError.message.includes("ENOTFOUND") || connectionError.message.includes("getaddrinfo")) {
        errorType = "Network/DNS Error"
        troubleshooting = [
          "1. Check your cluster URL is correct",
          "2. Ensure your cluster is active (not paused)",
          "3. Verify your internet connection",
          "4. Try connecting from MongoDB Compass to test",
        ]
      } else if (connectionError.message.includes("IP") || connectionError.message.includes("whitelist")) {
        errorType = "IP Access Error"
        troubleshooting = [
          "1. Add your IP address to Network Access in MongoDB Atlas",
          "2. Or add 0.0.0.0/0 to allow all IPs (less secure)",
          "3. Check if you're behind a firewall or VPN",
          "4. Wait a few minutes after adding IP for changes to take effect",
        ]
      } else if (connectionError.message.includes("timeout")) {
        errorType = "Connection Timeout"
        troubleshooting = [
          "1. Check your internet connection",
          "2. Verify cluster is active in MongoDB Atlas",
          "3. Try increasing timeout settings",
          "4. Check if firewall is blocking MongoDB ports",
        ]
      } else {
        troubleshooting = [
          "1. Check MongoDB Atlas dashboard for cluster status",
          "2. Verify all connection string components are correct",
          "3. Try connecting with MongoDB Compass using same credentials",
          "4. Check MongoDB Atlas logs for more details",
        ]
      }

      return NextResponse.json({
        success: false,
        errorType,
        error: connectionError.message,
        connectionString: mongoUri.replace(/:[^@]+@/, ":****@"),
        troubleshooting,
        nextSteps: [
          "Visit https://cloud.mongodb.com to check your cluster",
          "Go to Network Access to whitelist your IP",
          "Go to Database Access to check user permissions",
          "Try the connection string in MongoDB Compass first",
        ],
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Failed to load MongoDB client",
      details: error.message,
      troubleshooting: [
        "This might be a deployment issue",
        "Check if mongodb package is installed",
        "Verify environment variables are set correctly",
      ],
    })
  }
}
