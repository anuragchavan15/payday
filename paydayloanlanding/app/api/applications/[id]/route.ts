import { type NextRequest, NextResponse } from "next/server"
import { LoanApplicationService } from "@/lib/services/loanApplicationService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = await LoanApplicationService.getApplicationById(params.id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["new", "approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: new, approved, rejected, pending" },
        { status: 400 },
      )
    }

    const updated = await LoanApplicationService.updateApplicationStatus(params.id, status)

    if (!updated) {
      return NextResponse.json({ error: "Application not found or not updated" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await LoanApplicationService.deleteApplication(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}
