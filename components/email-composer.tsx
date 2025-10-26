"use client"

import { useState } from "react"
import { Loader2, Sparkles, Send, AlertCircle, CheckCircle2, Mail, Phone, Globe, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AIEmailGenerator } from "./ai-email-generator"
import type { Contact } from "./types"

interface EmailComposerProps {
  contacts: Contact[]
}

export function EmailComposer({ contacts }: EmailComposerProps) {
  const [selectedContactId, setSelectedContactId] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const selectedContact = contacts.find((c) => c.id === selectedContactId)

  const handleEmailGenerated = (email: { subject: string; body: string }) => {
    setSubject(email.subject)
    setBody(email.body)
    setShowAIGenerator(false)
  }

  const handleSendEmail = async () => {
    if (!selectedContact || !subject || !body) {
      setError("Please select a contact and fill in subject and body")
      return
    }

    setIsSending(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedContact.email,
          subject,
          body,
          contactName: selectedContact.name,
          companyName: "Your Company",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send email")
      }

      setSuccess(true)
      setSubject("")
      setBody("")
      setSelectedContactId("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Composer</h1>
        <p className="text-muted-foreground mt-1">
          Generate and send personalized emails to researched investors
        </p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Email sent successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Selection */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Select Investor
            </h2>

            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No researched contacts available. Go to Research tab to research
                investors first.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedContactId === contact.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">
                      {contact.name}
                    </p>
                    {contact.title && (
                      <p className="text-xs text-muted-foreground">
                        {contact.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {contact.company}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Email Composition */}
        <div className="lg:col-span-2 space-y-6">
          {selectedContact ? (
            <>
              {/* Contact Info Card */}
              <Card className="p-6 bg-muted/50">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Investor Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">
                        {selectedContact.name}
                      </p>
                    </div>
                    {selectedContact.title && (
                      <div>
                        <p className="text-muted-foreground">Title</p>
                        <p className="font-medium text-foreground">
                          {selectedContact.title}
                        </p>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div>
                        <p className="text-muted-foreground">Company</p>
                        <p className="font-medium text-foreground">
                          {selectedContact.company}
                        </p>
                      </div>
                    )}
                    {selectedContact.city && (
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">
                          {selectedContact.city}
                          {selectedContact.state
                            ? `, ${selectedContact.state}`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
                    {selectedContact.email && (
                      <a
                        href={`mailto:${selectedContact.email}`}
                        className="flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                    {selectedContact.phone && (
                      <a
                        href={`tel:${selectedContact.phone}`}
                        className="flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    {selectedContact.website && (
                      <a
                        href={selectedContact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Globe className="w-3 h-3" />
                        Website
                      </a>
                    )}
                    {selectedContact.linkedin && (
                      <a
                        href={selectedContact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Linkedin className="w-3 h-3" />
                        LinkedIn
                      </a>
                    )}
                    {selectedContact.twitter && (
                      <a
                        href={selectedContact.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-xs"
                      >
                        <Twitter className="w-3 h-3" />
                        Twitter
                      </a>
                    )}
                  </div>

                  {/* Research Data */}
                  {selectedContact.researchData && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground font-medium mb-2">
                        Research Insights
                      </p>
                      {selectedContact.researchData.insights && (
                        <p className="text-foreground text-xs">
                          {selectedContact.researchData.insights}
                        </p>
                      )}
                      {selectedContact.researchData.focusAreas &&
                        selectedContact.researchData.focusAreas.length > 0 && (
                          <div className="mt-2">
                            <p className="text-muted-foreground text-xs mb-1">
                              Focus Areas:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedContact.researchData.focusAreas
                                .slice(0, 3)
                                .map((area, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                  >
                                    {area}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </Card>

              {/* AI Generator Toggle */}
              {!showAIGenerator ? (
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Email with AI
                </Button>
              ) : (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Email Generator
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAIGenerator(false)}
                    >
                      Close
                    </Button>
                  </div>
                  <AIEmailGenerator
                    contact={{
                      name: selectedContact.name || "",
                      email: selectedContact.email || "",
                      id: selectedContact.id || "",
                      createdAt: selectedContact.createdAt || "",
                      phone: selectedContact.phone || "",
                      website: selectedContact.website || "",
                      linkedin: selectedContact.linkedin || "",
                      twitter: selectedContact.twitter || "",
                      company: selectedContact.company || "",
                      title: selectedContact.title || "",
                      markets: selectedContact.markets || "",
                    }}
                    onEmailGenerated={handleEmailGenerated}
                  />
                </Card>
              )}

              {/* Email Composition */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Compose Email
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject Line
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Body
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your email here..."
                      rows={12}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      onClick={() => {
                        setSubject("");
                        setBody("");
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={isSending || !subject || !body}
                      className="gap-2"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                Select an investor from the list to compose an email
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
