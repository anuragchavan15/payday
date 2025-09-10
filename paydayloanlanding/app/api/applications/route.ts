import { type NextRequest, NextResponse } from "next/server"
import { LoanApplicationService } from "@/lib/services/loanApplicationService"
import type { LoanApplication } from "@/lib/models/LoanApplication"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting application submission")
    const body = await request.json()
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dateOfBirth",
      "ssnLastFour",
      "monthlyIncome",
      "loanAmount",
      "employmentStatus",
      "bankAccount",
      "bankName",
      "bankDuration",
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

    const applicationData: Omit<LoanApplication, "_id" | "submittedAt" | "updatedAt"> = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      ssnLastFour: body.ssnLastFour,
      monthlyIncome: body.monthlyIncome,
      loanAmount: body.loanAmount,
      employmentStatus: body.employmentStatus,
      bankAccount: body.bankAccount,
      bankName: body.bankName,
      customBankName: body.customBankName,
      bankDuration: body.bankDuration,
      status: "new",
      ipAddress,
      userAgent,
    }

    console.log("[v0] Application data prepared:", JSON.stringify(applicationData, null, 2))

    // Testing MongoDB connection before processing
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

    console.log("[v0] Creating application...")
    const application = await LoanApplicationService.createApplication(applicationData)
    console.log("[v0] Application created successfully:", application._id)

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: application._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error submitting application:", error)

    const errorResponse = {
      error: "Failed to submit application",
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

    const result = await LoanApplicationService.getAllApplications(page, limit, status)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
