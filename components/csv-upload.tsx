"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Contact {
  name: string
  email: string
  phone?: string
  title?: string
  company?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  country?: string
  state?: string
  city?: string
  markets?: string
  pastInvestments?: string
  types?: string
  stages?: string
  notes?: string
}

interface CSVUploadProps {
  onContactsImported: (contacts: Contact[]) => void
}

interface ParseError {
  row: number
  field: string
  message: string
}

export function CSVUpload({ onContactsImported }: CSVUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ParseError[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const validateEmail = (email: string): boolean => {
    // Clean the email string
    const cleanEmail = email.trim()
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    // Additional checks
    if (cleanEmail.length === 0) return false
    if (cleanEmail.includes(' ')) return false // No spaces allowed
    if (cleanEmail.startsWith('.') || cleanEmail.endsWith('.')) return false
    if (cleanEmail.includes('..')) return false // No consecutive dots
    
    // Must have @ symbol and at least one character before and after
    if (!cleanEmail.includes('@')) return false
    if (cleanEmail.indexOf('@') === 0) return false // Can't start with @
    if (cleanEmail.lastIndexOf('@') === cleanEmail.length - 1) return false // Can't end with @
    
    return emailRegex.test(cleanEmail)
  }

  // Proper CSV parsing function that handles quoted fields
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < row.length) {
      const char = row[i]
      const nextChar = row[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i += 2
          continue
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
      i++
    }
    
    // Add the last field
    result.push(current.trim())
    return result
  }

  const parseCSV = (content: string): Contact[] => {
    const lines = content.trim().split("\n")
    if (lines.length < 2) {
      setErrors([{ row: 0, field: "file", message: "CSV file must contain at least a header row and one data row" }])
      return []
    }

    const rawHeaders = parseCSVRow(lines[0])
    console.log("Raw headers:", rawHeaders) // Debug log
    
    // Properly handle quoted CSV fields by removing quotes and trimming
    const headers = rawHeaders.map((h) => h.replace(/^["']|["']$/g, '').toLowerCase())
    console.log("Processed headers:", headers) // Debug log
    
    // Check for name field - try multiple variations
    const hasName = headers.includes("name") || 
                   headers.includes("name ") || 
                   headers.includes(" name") ||
                   headers.some(h => h.replace(/\s+/g, '') === "name")
    
    // Check for email field - try multiple variations
    const hasEmail = headers.includes("email") || 
                    headers.includes("emails") ||
                    headers.includes("email ") || 
                    headers.includes(" emails") ||
                    headers.some(h => h.replace(/\s+/g, '') === "email") ||
                    headers.some(h => h.replace(/\s+/g, '') === "emails")
    
    console.log("Header analysis:") // Debug log
    console.log("- Raw first header:", JSON.stringify(rawHeaders[0])) // Debug log
    console.log("- Processed first header:", JSON.stringify(headers[0])) // Debug log
    console.log("- Looking for 'name' in:", headers) // Debug log
    console.log("- Looking for 'email/emails' in:", headers) // Debug log
    console.log("- Has name:", hasName) // Debug log
    console.log("- Has email/emails:", hasEmail) // Debug log
    
    const missingFields = []
    if (!hasName) missingFields.push("name")
    if (!hasEmail) missingFields.push("email")
    
    console.log("- Missing fields:", missingFields) // Debug log

    if (missingFields.length > 0) {
      setErrors([
        {
          row: 0,
          field: "headers",
          message: `Missing required columns: ${missingFields.join(", ")}. Required: name, email (or emails)`,
        },
      ])
      return []
    }

    const contacts: Contact[] = []
    const parseErrors: ParseError[] = []

    for (let i = 1; i < lines.length; i++) {
      // Use proper CSV parsing for data rows too
      const values = parseCSVRow(lines[i]).map((v) => v.replace(/^["']|["']$/g, ''))
      if (values.every((v) => v === "")) continue

      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      
      console.log(`Row ${i + 1} data:`, {
        headers,
        values,
        rowData: row
      }) // Debug log

      // Handle both "email" and "emails" headers
      const emailValue = row.email || row.emails

      if (!row.name) {
        parseErrors.push({ row: i + 1, field: "name", message: "Name is required" })
        continue
      }

      if (!emailValue) {
        parseErrors.push({ row: i + 1, field: "email", message: "Email is required" })
        continue
      }

      // Handle multiple emails - take the first valid one
      const emailCandidates = emailValue.split(',').map(e => e.trim()).filter(e => e.length > 0)
      let validEmail = null
      
      for (const candidate of emailCandidates) {
        if (validateEmail(candidate)) {
          validEmail = candidate
          break
        }
      }

      // Debug email validation
      console.log(`Row ${i + 1} email validation:`, {
        originalEmailValue: JSON.stringify(emailValue),
        emailCandidates,
        validEmail,
        isValid: !!validEmail
      })

      if (!validEmail) {
        parseErrors.push({ row: i + 1, field: "email", message: "No valid email found (tried multiple emails if separated by comma)" })
        continue
      }

      contacts.push({
        name: row.name,
        email: validEmail,
        phone: row.phone || undefined,
        title: row.title || undefined,
        company: row.company || undefined,
        website: row.website || undefined,
        linkedin: row.linkedin || undefined,
        twitter: row.twitter || undefined,
        facebook: row.facebook || undefined,
        country: row.country || undefined,
        state: row.state || undefined,
        city: row.city || undefined,
        markets: row.markets || undefined,
        pastInvestments: row.pastinvestments || undefined,
        types: row.types || undefined,
        stages: row.stages || undefined,
        notes: row.notes || undefined,
      })
    }

    setErrors(parseErrors)
    setSuccessCount(contacts.length)
    return contacts
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setErrors([])
    setSuccessCount(0)

    try {
      const content = await file.text()
      const contacts = parseCSV(content)

      if (contacts.length > 0) {
        onContactsImported(contacts)
        setShowResults(true)
      }
    } catch (error) {
      setErrors([
        {
          row: 0,
          field: "file",
          message: `Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ])
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">Import investors from CSV</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a CSV file with investor data (name, email, and optional fields like LinkedIn, website, etc.)
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} variant="outline">
            {isLoading ? "Processing..." : "Select CSV File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
        </div>
      </Card>

      {showResults && successCount > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Successfully imported {successCount} investor{successCount !== 1 ? "s" : ""}
          </AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">{errors.length} error(s) found:</p>
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                {errors.map((error, idx) => (
                  <li key={idx}>
                    {error.row > 0 ? `Row ${error.row}` : "File"} - {error.field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 bg-muted/50">
        <p className="text-sm font-medium text-foreground mb-2">Supported CSV Columns:</p>
        <p className="text-xs text-muted-foreground">
          Required: name, email (or emails) | Optional: phone, title, company, website, linkedin, twitter, facebook, country, state,
          city, markets, pastInvestments, types, stages, notes
        </p>
      </Card>
    </div>
  )
}
