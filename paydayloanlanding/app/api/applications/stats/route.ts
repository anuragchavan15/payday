import { type NextRequest, NextResponse } from "next/server"
import { LoanApplicationService } from "@/lib/services/loanApplicationService"

export async function GET(request: NextRequest) {
  try {
    const stats = await LoanApplicationService.getApplicationStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching application stats:", error)
    return NextResponse.json({ error: "Failed to fetch application statistics" }, { status: 500 })
  }
}
