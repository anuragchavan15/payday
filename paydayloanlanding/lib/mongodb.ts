import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

let uri = process.env.MONGODB_URI.replace(/<([^>]+)>/g, "$1") // Remove angle brackets from password

if (!uri.includes("/payday?")) {
  console.log("[v0] Adding database name to connection string")
  uri = uri.replace(/\/\?/, "/payday?")
}

console.log("[v0] Using MongoDB URI:", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"))

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  try {
    console.log("[v0] Attempting MongoDB connection...")
    console.log("[v0] Environment check - MONGODB_URI exists:", !!process.env.MONGODB_URI)
    console.log("[v0] Processed URI format:", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"))

    const client = await clientPromise
    console.log("[v0] MongoDB client connected successfully")

    const db = client.db("payday")
    console.log("[v0] Selected database: payday")

    await db.admin().ping()
    console.log("[v0] Database ping successful - connection is active")

    const collections = await db.listCollections().toArray()
    console.log(
      "[v0] Available collections:",
      collections.map((c) => c.name),
    )

    return db
  } catch (error) {
    console.error("[v0] MongoDB connection failed:")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Connection URI (masked):", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"))

    if (error instanceof Error && error.message.includes("authentication")) {
      throw new Error("Database authentication failed. Please check your username and password in MongoDB Atlas.")
    }
    if (error instanceof Error && error.message.includes("network")) {
      throw new Error("Network connection failed. Please check your IP whitelist in MongoDB Atlas Network Access.")
    }

    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
