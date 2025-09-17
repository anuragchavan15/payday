export interface LoanApplication {
  _id?: string
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssnLastFour: string

  // Financial Information
  monthlyIncome: string
  loanAmount: string
  employmentStatus: string
  bankAccount: string
  bankName: string
  customBankName?: string
  bankDuration: string

  // Application metadata
  status: "new" | "approved" | "rejected" | "pending"
  submittedAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
}

export interface LoanApplicationStats {
  totalApplications: number
  newApplications: number
  approvedApplications: number
  rejectedApplications: number
  pendingApplications: number
  totalLoanAmount: number
  averageLoanAmount: number
}
