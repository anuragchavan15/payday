import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[v0] Testing MongoDB connection...")

    // Test basic connection
    const db = await getDatabase()
    console.log("[v0] Database connection successful")

    // Test collection access
    const collection = db.collection("loan_applications")
    console.log("[v0] Collection access successful")

    // Test basic operation
    const count = await collection.countDocuments()
    console.log("[v0] Document count:", count)

    // Test insert operation
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: "Connection test",
    }

    const insertResult = await collection.insertOne(testDoc)
    console.log("[v0] Test insert successful:", insertResult.insertedId)

    // Clean up test document
    await collection.deleteOne({ _id: insertResult.insertedId })
    console.log("[v0] Test document cleaned up")

    return NextResponse.json({
      success: true,
      message: "MongoDB connection test successful",
      database: "payday",
      collection: "loan_applications",
      documentCount: count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] MongoDB test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : "") : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
