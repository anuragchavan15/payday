"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, DollarSign, Clock, Shield, ArrowRight, AlertCircle, Zap, TrendingUp, Loader2 } from "lucide-react"

interface FormData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  birthMonth: string
  birthDay: string
  birthYear: string
  ssnLastFour: string

  // Step 2: Financial Details
  monthlyIncome: string
  loanAmount: string
  employmentStatus: string
  bankAccount: string
  bankName: string
  customBankName: string
  bankDuration: string
}

interface FormErrors {
  [key: string]: string
}

export default function PaydayLoanLanding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    ssnLastFour: "",
    monthlyIncome: "",
    loanAmount: "",
    employmentStatus: "",
    bankAccount: "",
    bankName: "",
    customBankName: "",
    bankDuration: "",
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  const formatSSN = (value: string) => {
    const ssnDigits = value.replace(/[^\d]/g, "")
    return ssnDigits.slice(0, 4)
  }

  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case "firstName":
      case "lastName":
        return value.length < 2 ? "Must be at least 2 characters" : ""
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? "Please enter a valid email address" : ""
      case "phone":
        return value ? "" : "This field is required"
      case "birthMonth":
      case "birthDay":
      case "birthYear":
        return value ? "" : "This field is required"
      case "ssnLastFour":
        return value.length === 4 ? "" : "Must be exactly 4 digits"
      case "customBankName":
        return value ? "" : "This field is required"
      default:
        return value ? "" : "This field is required"
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    let formattedValue = value

    if (field === "phone") {
      formattedValue = formatPhoneNumber(value)
    }
    if (field === "ssnLastFour") {
      formattedValue = formatSSN(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))

    if (touchedFields.has(field)) {
      const error = validateField(field, formattedValue)
      setFormErrors((prev) => ({ ...prev, [field]: error }))
    }
  }

  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => new Set(prev).add(field))
    const error = validateField(field, formData[field])
    setFormErrors((prev) => ({ ...prev, [field]: error }))
  }

  const nextStep = () => {
    const currentStepFields = getCurrentStepFields()
    let hasErrors = false
    const newErrors: FormErrors = {}

    currentStepFields.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    if (hasErrors) {
      setFormErrors((prev) => ({ ...prev, ...newErrors }))
      setTouchedFields((prev) => {
        const newTouched = new Set(prev)
        currentStepFields.forEach((field) => newTouched.add(field))
        return newTouched
      })
      return
    }

    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const getCurrentStepFields = (): (keyof FormData)[] => {
    switch (currentStep) {
      case 1:
        return ["firstName", "lastName", "email", "phone", "birthMonth", "birthDay", "birthYear", "ssnLastFour"]
      case 2:
        const fields: (keyof FormData)[] = [
          "monthlyIncome",
          "loanAmount",
          "employmentStatus",
          "bankAccount",
          "bankName",
          "bankDuration",
        ]
        if (formData.bankName === "other") {
          fields.push("customBankName")
        }
        return fields
      default:
        return []
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const dateOfBirth = `${formData.birthYear}-${formData.birthMonth.padStart(2, "0")}-${formData.birthDay.padStart(2, "0")}`

      const applicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth,
        ssnLastFour: formData.ssnLastFour,
        monthlyIncome: formData.monthlyIncome,
        loanAmount: formData.loanAmount,
        employmentStatus: formData.employmentStatus,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        customBankName: formData.customBankName,
        bankDuration: formData.bankDuration,
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application")
      }

      setSubmitSuccess(true)

      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          birthMonth: "",
          birthDay: "",
          birthYear: "",
          ssnLastFour: "",
          monthlyIncome: "",
          loanAmount: "",
          employmentStatus: "",
          bankAccount: "",
          bankName: "",
          customBankName: "",
          bankDuration: "",
        })
        setFormErrors({})
        setTouchedFields(new Set())
        setCurrentStep(1)
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting application:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = (step: number) => {
    const fields = getCurrentStepFields()
    return fields.every((field) => formData[field] && !formErrors[field])
  }

  const getMaxLoanAmount = () => {
    return ["10000"]
  }

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: String(i + 1),
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => ({
    value: String(currentYear - 18 - i),
    label: String(currentYear - 18 - i),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-gray-900">Quick Cash</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 border-green-200">
                <Shield className="h-3 w-3" />
                SSL Secured
              </Badge>
              <Badge variant="outline" className="border-amber-200 text-amber-800">
                BBB Accredited
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-100/50 to-transparent py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 text-balance">
            Get Cash Fast with <span className="text-amber-600">QuickCash</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-2xl mx-auto">
            Need money today? Get approved for up to $10,000 in minutes with our simple application.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-800 font-medium">Fast Approval</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-gray-800 font-medium">Same Day Funding</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
              <Shield className="h-5 w-5 text-amber-600" />
              <span className="text-gray-800 font-medium">100% Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-full mb-6 animate-pulse">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">98% Approval Rate • Instant Decision</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4 mx-auto">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">2 Minutes</h3>
                <p className="text-sm text-gray-600">Quick application process</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Up to $10K</h3>
                <p className="text-sm text-gray-600">Loan amount available</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Same Day</h3>
                <p className="text-sm text-gray-600">Funding when approved</p>
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="text-2xl text-gray-900">Apply for Your Loan</CardTitle>
              <CardDescription className="text-gray-600">
                Complete our simple application to get your cash today
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center animate-in slide-in-from-top-5 duration-300">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Application Submitted Successfully!</h3>
                  <p className="text-green-700">
                    Thank you for your application. We will review it and contact you within 24 hours with your loan
                    decision.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg animate-in slide-in-from-top-5 duration-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-medium">Error submitting application</p>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{submitError}</p>
                </div>
              )}

              {!submitSuccess && (
                <>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-amber-100 pb-2">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-gray-700 font-medium">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            onBlur={() => handleFieldBlur("firstName")}
                            placeholder="Enter your first name"
                            className={`bg-white border-2 transition-all duration-200 ${
                              formErrors.firstName && touchedFields.has("firstName")
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-200 focus:border-amber-500"
                            }`}
                            required
                          />
                          {formErrors.firstName && touchedFields.has("firstName") && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-gray-700 font-medium">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            onBlur={() => handleFieldBlur("lastName")}
                            placeholder="Enter your last name"
                            className={`bg-white border-2 transition-all duration-200 ${
                              formErrors.lastName && touchedFields.has("lastName")
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-200 focus:border-amber-500"
                            }`}
                            required
                          />
                          {formErrors.lastName && touchedFields.has("lastName") && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          onBlur={() => handleFieldBlur("email")}
                          placeholder="Enter your email address"
                          className={`bg-white border-2 transition-all duration-200 ${
                            formErrors.email && touchedFields.has("email")
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-amber-500"
                          }`}
                          required
                        />
                        {formErrors.email && touchedFields.has("email") && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value)}
                          onBlur={() => handleFieldBlur("phone")}
                          placeholder="(555) 123-4567"
                          className={`bg-white border-2 transition-all duration-200 ${
                            formErrors.phone && touchedFields.has("phone")
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-amber-500"
                          }`}
                          maxLength={14}
                          required
                        />
                        {formErrors.phone && touchedFields.has("phone") && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.phone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Date of Birth</Label>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="birthMonth" className="text-sm text-gray-600">
                              Month
                            </Label>
                            <Select
                              value={formData.birthMonth}
                              onValueChange={(value) => updateFormData("birthMonth", value)}
                            >
                              <SelectTrigger
                                className={`bg-white border-2 transition-all duration-200 ${
                                  formErrors.birthMonth && touchedFields.has("birthMonth")
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-200 focus:border-amber-500"
                                }`}
                              >
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {months.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.birthMonth && touchedFields.has("birthMonth") && (
                              <p className="text-red-500 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Required
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="birthDay" className="text-sm text-gray-600">
                              Day
                            </Label>
                            <Select
                              value={formData.birthDay}
                              onValueChange={(value) => updateFormData("birthDay", value)}
                            >
                              <SelectTrigger
                                className={`bg-white border-2 transition-all duration-200 ${
                                  formErrors.birthDay && touchedFields.has("birthDay")
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-200 focus:border-amber-500"
                                }`}
                              >
                                <SelectValue placeholder="Day" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {days.map((day) => (
                                  <SelectItem key={day.value} value={day.value}>
                                    {day.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.birthDay && touchedFields.has("birthDay") && (
                              <p className="text-red-500 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Required
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="birthYear" className="text-sm text-gray-600">
                              Year
                            </Label>
                            <Select
                              value={formData.birthYear}
                              onValueChange={(value) => updateFormData("birthYear", value)}
                            >
                              <SelectTrigger
                                className={`bg-white border-2 transition-all duration-200 ${
                                  formErrors.birthYear && touchedFields.has("birthYear")
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-200 focus:border-amber-500"
                                }`}
                              >
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {years.map((year) => (
                                  <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.birthYear && touchedFields.has("birthYear") && (
                              <p className="text-red-500 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Required
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ssnLastFour" className="text-gray-700 font-medium">
                          Last 4 Digits of SSN
                        </Label>
                        <Input
                          id="ssnLastFour"
                          type="text"
                          value={formData.ssnLastFour}
                          onChange={(e) => updateFormData("ssnLastFour", e.target.value)}
                          onBlur={() => handleFieldBlur("ssnLastFour")}
                          placeholder="1234"
                          className={`bg-white border-2 transition-all duration-200 ${
                            formErrors.ssnLastFour && touchedFields.has("ssnLastFour")
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-amber-500"
                          }`}
                          maxLength={4}
                          required
                        />
                        {formErrors.ssnLastFour && touchedFields.has("ssnLastFour") && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.ssnLastFour}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Financial Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-amber-100 pb-2">
                        Financial Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="monthlyIncome" className="text-gray-700 font-medium">
                          Monthly Income
                        </Label>
                        <Select
                          value={formData.monthlyIncome}
                          onValueChange={(value) => updateFormData("monthlyIncome", value)}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select your monthly income range" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                            <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                            <SelectItem value="3000-4000">$3,000 - $4,000</SelectItem>
                            <SelectItem value="4000-5000">$4,000 - $5,000</SelectItem>
                            <SelectItem value="5000+">$5,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loanAmount" className="text-gray-700 font-medium">
                          Loan Amount
                        </Label>
                        <Select
                          value={formData.loanAmount}
                          onValueChange={(value) => updateFormData("loanAmount", value)}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select loan amount" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="1000">$1,000</SelectItem>
                            <SelectItem value="2000">$2,000</SelectItem>
                            <SelectItem value="3000">$3,000</SelectItem>
                            <SelectItem value="4000">$4,000</SelectItem>
                            <SelectItem value="5000">$5,000</SelectItem>
                            <SelectItem value="6000">$6,000</SelectItem>
                            <SelectItem value="7000">$7,000</SelectItem>
                            <SelectItem value="8000">$8,000</SelectItem>
                            <SelectItem value="9000">$9,000</SelectItem>
                            <SelectItem value="10000">$10,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employmentStatus" className="text-gray-700 font-medium">
                          Employment Status
                        </Label>
                        <Select
                          value={formData.employmentStatus}
                          onValueChange={(value) => updateFormData("employmentStatus", value)}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select your employment status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="full-time">Full-time Employee</SelectItem>
                            <SelectItem value="part-time">Part-time Employee</SelectItem>
                            <SelectItem value="self-employed">Self-employed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                            <SelectItem value="benefits">Government Benefits</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankAccount" className="text-gray-700 font-medium">
                          Bank Account Type
                        </Label>
                        <Select
                          value={formData.bankAccount}
                          onValueChange={(value) => updateFormData("bankAccount", value)}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select your bank account type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="checking">Checking Account</SelectItem>
                            <SelectItem value="savings">Savings Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-gray-700 font-medium">
                          Which Bank Do You Use?
                        </Label>
                        <Select value={formData.bankName} onValueChange={(value) => updateFormData("bankName", value)}>
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="chase">Chase Bank</SelectItem>
                            <SelectItem value="bofa">Bank of America</SelectItem>
                            <SelectItem value="wells-fargo">Wells Fargo</SelectItem>
                            <SelectItem value="citi">Citibank</SelectItem>
                            <SelectItem value="us-bank">US Bank</SelectItem>
                            <SelectItem value="pnc">PNC Bank</SelectItem>
                            <SelectItem value="td">TD Bank</SelectItem>
                            <SelectItem value="capital-one">Capital One</SelectItem>
                            <SelectItem value="regions">Regions Bank</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.bankName === "other" && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <Label htmlFor="customBankName" className="text-gray-700 font-medium">
                            Enter Your Bank Name
                          </Label>
                          <Input
                            id="customBankName"
                            value={formData.customBankName}
                            onChange={(e) => updateFormData("customBankName", e.target.value)}
                            onBlur={() => handleFieldBlur("customBankName")}
                            placeholder="Enter your bank name"
                            className={`bg-white border-2 transition-all duration-200 ${
                              formErrors.customBankName && touchedFields.has("customBankName")
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-200 focus:border-amber-500"
                            }`}
                            required
                          />
                          {formErrors.customBankName && touchedFields.has("customBankName") && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.customBankName}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="bankDuration" className="text-gray-700 font-medium">
                          How Long Have You Been Using This Bank?
                        </Label>
                        <Select
                          value={formData.bankDuration}
                          onValueChange={(value) => updateFormData("bankDuration", value)}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-amber-500 h-12">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="less-than-6-months">Less than 6 months</SelectItem>
                            <SelectItem value="6-12-months">6-12 months</SelectItem>
                            <SelectItem value="1-2-years">1-2 years</SelectItem>
                            <SelectItem value="2-5-years">2-5 years</SelectItem>
                            <SelectItem value="more-than-5-years">More than 5 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Submit */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-amber-100 pb-2">
                        Review Your Application
                      </h3>

                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Name:</span>
                            <p className="font-bold text-gray-900 text-lg">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Email:</span>
                            <p className="font-semibold text-gray-800">{formData.email}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Phone:</span>
                            <p className="font-semibold text-gray-800">{formData.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Date of Birth:</span>
                            <p className="font-semibold text-gray-800">
                              {formData.birthMonth && formData.birthDay && formData.birthYear
                                ? `${months.find((m) => m.value === formData.birthMonth)?.label} ${formData.birthDay}, ${formData.birthYear}`
                                : "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">SSN (Last 4):</span>
                            <p className="font-semibold text-gray-800">****{formData.ssnLastFour}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Monthly Income:</span>
                            <p className="font-semibold text-green-700">${formData.monthlyIncome}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Loan Amount:</span>
                            <p className="font-bold text-amber-700 text-xl">
                              ${formData.loanAmount ? Number(formData.loanAmount).toLocaleString() : "0"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Employment:</span>
                            <p className="font-semibold text-gray-800 capitalize">
                              {formData.employmentStatus?.replace("-", " ")}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Bank:</span>
                            <p className="font-semibold text-gray-800 capitalize">
                              {formData.bankName === "other"
                                ? formData.customBankName
                                : formData.bankName?.replace("-", " ")}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-600 font-medium">Banking Duration:</span>
                            <p className="font-semibold text-gray-800 capitalize">
                              {formData.bankDuration?.replace("-", " ")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 leading-relaxed">
                          <strong>Important:</strong> By submitting this application, you agree to our terms of service
                          and privacy policy. We will contact you within 24 hours with your loan decision. Your
                          information is encrypted and secure.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-center pt-8 border-t border-gray-100">
                    {currentStep < 3 ? (
                      <Button
                        onClick={nextStep}
                        disabled={!isStepValid(currentStep)}
                        className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-16 py-6 h-16 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Zap className="h-6 w-6" />
                        Get Your Cash Now
                        <ArrowRight className="h-6 w-6" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!isStepValid(currentStep) || isSubmitting}
                        className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-16 py-6 h-16 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-6 w-6" />
                            Submit Application
                            <CheckCircle className="h-6 w-6" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-6 w-6 text-amber-400" />
                <span className="text-xl font-bold">QuickCash</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Fast, reliable payday loans when you need them most. Licensed and regulated for your protection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-amber-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    Rates & Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-amber-400">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors">
                    Responsible Lending
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 QuickCash. All rights reserved. Licensed lender.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
