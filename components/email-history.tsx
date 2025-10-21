"use client"

import { useState, useEffect } from "react"
import { Mail, Calendar, User, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface EmailRecord {
  id: string
  to: string
  contactName: string
  subject: string
  body: string
  sentAt: string
  status: "sent" | "failed"
  messageId?: string
}

export function EmailHistory() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadEmailHistory()
  }, [])

  useEffect(() => {
    const filtered = emails.filter(
      (email) =>
        email.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEmails(filtered)
  }, [searchTerm, emails])

  const loadEmailHistory = async () => {
    try {
      const response = await fetch("/api/email-history")
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error("Failed to load email history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email History</h1>
        <p className="text-muted-foreground mt-1">Track all emails sent to investors</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by contact name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Email List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading email history...</p>
          </Card>
        ) : filteredEmails.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {emails.length === 0 ? "No emails sent yet" : "No emails match your search"}
            </p>
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{email.subject}</h3>
                      <Badge variant={email.status === "sent" ? "default" : "destructive"}>
                        {email.status === "sent" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Sent
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {email.contactName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {email.to}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(email.sentAt)}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(email.body, email.id)}
                    className="gap-1"
                  >
                    {copiedId === email.id ? (
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

                {/* Email Body Preview */}
                <div className="p-4 bg-muted/50 rounded-md border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{email.body}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {emails.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{emails.length}</p>
            <p className="text-sm text-muted-foreground">Total Sent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{emails.filter((e) => e.status === "sent").length}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{emails.filter((e) => e.status === "failed").length}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>
      )}
    </div>
  )
}
