"use client"

import { useState } from "react"
import { Loader2, Sparkles, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Contact } from "./types"

interface AIEmailGeneratorProps {
  contact: Contact
  onEmailGenerated?: (email: { subject: string; body: string }) => void
}

export function AIEmailGenerator({ contact, onEmailGenerated }: AIEmailGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string
    body: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null)

  // Form fields for company context
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [fundingStage, setFundingStage] = useState("Series A")
  const [tone, setTone] = useState<"professional" | "casual" | "friendly">("professional")

  const generateEmail = async () => {
    if (!companyName || !companyDescription) {
      setError("Please provide your company name and description")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // First, research the investor
      const researchResponse = await fetch("/api/research-investor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          company: contact.company,
          email: contact.email,
        }),
      })

      if (!researchResponse.ok) {
        throw new Error("Failed to research investor")
      }

      const researchData = await researchResponse.json()
      const researchSummary = researchData.research.summary

      // Generate subject line
      const subjectResponse = await fetch("/api/generate-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contact.name,
          companyName,
          investorFocus: contact.markets,
        }),
      })

      if (!subjectResponse.ok) {
        throw new Error("Failed to generate subject")
      }

      const subjectData = await subjectResponse.json()

      // Generate email body
      const emailResponse = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contact.name,
          contactCompany: contact.company,
          contactPosition: contact.title,
          investorFocus: contact.markets,
          companyName,
          companyDescription,
          fundingStage,
          researchSummary,
          tone,
        }),
      })

      if (!emailResponse.ok) {
        throw new Error("Failed to generate email")
      }

      const emailData = await emailResponse.json()

      const email = {
        subject: subjectData.subject,
        body: emailData.email.body,
      }

      setGeneratedEmail(email)
      onEmailGenerated?.(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: "subject" | "body") => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Company Context Form */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Company Context</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Company Name *</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your startup name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Company Description *</label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="What does your company do? (2-3 sentences)"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Funding Stage</label>
              <select
                value={fundingStage}
                onChange={(e) => setFundingStage(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option>Pre-seed</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
                <option>Series C+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Investor Context */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Investor Information</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-foreground">Name:</span> {contact.name}
          </p>
          <p>
            <span className="font-medium text-foreground">Company:</span> {contact.company}
          </p>
          <p>
            <span className="font-medium text-foreground">Position:</span> {contact.title}
          </p>
          <p>
            <span className="font-medium text-foreground">Focus:</span> {contact.markets}
          </p>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      <Button
        onClick={generateEmail}
        disabled={isLoading || !companyName || !companyDescription}
        className="w-full gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating email...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Personalized Email
          </>
        )}
      </Button>

      {/* Generated Email */}
      {generatedEmail && (
        <div className="space-y-4">
          <Card className="p-6 border-primary/20 bg-primary/5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Generated Email</h3>

            {/* Subject */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Subject Line</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail.subject, "subject")}
                  className="gap-1"
                >
                  {copiedField === "subject" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-3 bg-background border border-border rounded-md">
                <p className="text-foreground font-medium">{generatedEmail.subject}</p>
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Email Body</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail.body, "body")}
                  className="gap-1"
                >
                  {copiedField === "body" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-background border border-border rounded-md whitespace-pre-wrap text-sm text-foreground">
                {generatedEmail.body}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
