import { getDatabase } from "@/lib/mongodb"
import type { LoanApplication, LoanApplicationStats } from "@/lib/models/LoanApplication"
import type { Collection } from "mongodb"
import { ObjectId } from "mongodb"

export class LoanApplicationService {
  private static async getCollection(): Promise<Collection<LoanApplication>> {
    try {
      console.log("[v0] Getting database connection...")
      const db = await getDatabase()
      console.log("[v0] Getting loan_applications collection...")
      const collection = db.collection<LoanApplication>("loan_applications")
      console.log("[v0] Collection obtained successfully")
      return collection
    } catch (error) {
      console.error("[v0] Error getting collection:", error)
      throw error
    }
  }

  static async createApplication(
    applicationData: Omit<LoanApplication, "_id" | "submittedAt" | "updatedAt">,
  ): Promise<LoanApplication> {
    try {
      console.log("[v0] Creating new application...")
      const collection = await this.getCollection()

      const application: Omit<LoanApplication, "_id"> = {
        ...applicationData,
        submittedAt: new Date(),
        updatedAt: new Date(),
      }

      console.log("[v0] Inserting application into database...")
      const result = await collection.insertOne(application as LoanApplication)
      console.log("[v0] Application inserted with ID:", result.insertedId)

      const createdApplication = await collection.findOne({ _id: result.insertedId })
      if (!createdApplication) {
        throw new Error("Failed to retrieve created application")
      }

      return {
        ...createdApplication,
        _id: createdApplication._id.toString(),
      }
    } catch (error) {
      console.error("[v0] Error creating application:", error)
      throw error
    }
  }

  static async getAllApplications(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<{ applications: LoanApplication[]; total: number; page: number; totalPages: number }> {
    const collection = await this.getCollection()

    const filter = status ? { status } : {}
    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      collection.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ])

    return {
      applications: applications.map((app) => ({
        ...app,
        _id: app._id?.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async getApplicationById(id: string): Promise<LoanApplication | null> {
    const collection = await this.getCollection()
    const application = await collection.findOne({ _id: new ObjectId(id) })

    if (!application) return null

    return {
      ...application,
      _id: application._id?.toString(),
    }
  }

  static async updateApplicationStatus(id: string, status: LoanApplication["status"]): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }

  static async getApplicationStats(): Promise<LoanApplicationStats> {
    const collection = await this.getCollection()

    const [totalApplications, statusCounts, loanAmountStats] = await Promise.all([
      collection.countDocuments(),
      collection
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalAmount: {
                $sum: { $toDouble: "$loanAmount" },
              },
              avgAmount: {
                $avg: { $toDouble: "$loanAmount" },
              },
            },
          },
        ])
        .toArray(),
    ])

    const statusMap = statusCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count
        return acc
      },
      {} as Record<string, number>,
    )

    const loanStats = loanAmountStats[0] || { totalAmount: 0, avgAmount: 0 }

    return {
      totalApplications,
      newApplications: statusMap.new || 0,
      approvedApplications: statusMap.approved || 0,
      rejectedApplications: statusMap.rejected || 0,
      pendingApplications: statusMap.pending || 0,
      totalLoanAmount: loanStats.totalAmount || 0,
      averageLoanAmount: loanStats.avgAmount || 0,
    }
  }

  static async deleteApplication(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}
