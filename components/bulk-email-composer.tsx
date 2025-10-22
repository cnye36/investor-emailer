"use client"

import { useState, useEffect } from "react"
import { Loader2, Send, CheckCircle2, AlertCircle, Mail, Users, Zap, Settings, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { EmailPreviewModal } from "@/components/email-preview-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Contact } from "./types"

interface CompanyProfile {
  name: string
  description: string
  fundingStage: string
  tone: string
  userName: string
  userPosition: string
}

interface EmailDraft {
  contact_id: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

interface BulkEmailComposerProps {
  contacts: Contact[]
  onContactsDeleted?: (deletedIds: string[]) => void
}

export function BulkEmailComposer({ contacts, onContactsDeleted }: BulkEmailComposerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [generatedEmails, setGeneratedEmails] = useState<Record<string, { subject: string; body: string }>>({})
  const [previewContact, setPreviewContact] = useState<Contact | null>(null)
  const [previewEmail, setPreviewEmail] = useState<{ subject: string; body: string } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Load company profile and email drafts on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/company-profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setCompanyProfile({
              name: data.profile.name,
              description: data.profile.description,
              fundingStage: data.profile.funding_stage,
              tone: data.profile.tone,
              userName: data.profile.user_name || "",
              userPosition: data.profile.user_position || ""
            })
          }
        }
      } catch (error) {
        console.error('Error loading company profile:', error)
      }
    }

    const fetchDrafts = async () => {
      try {
        const response = await fetch('/api/email-drafts')
        if (response.ok) {
          const data = await response.json()
          if (data.drafts && data.drafts.length > 0) {
            const draftsMap: Record<string, { subject: string; body: string }> = {}
            data.drafts.forEach((draft: EmailDraft) => {
              draftsMap[draft.contact_id] = {
                subject: draft.subject,
                body: draft.body
              }
            })
            setGeneratedEmails(draftsMap)
          }
        }
      } catch (error) {
        console.error('Error loading email drafts:', error)
      }
    }

    fetchProfile()
    fetchDrafts()
  }, [])

  const handleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)))
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleGenerateEmails = async () => {
    if (!companyProfile) {
      setError("Please set up your company profile first")
      return
    }

    if (selectedIds.size === 0) {
      setError("Please select contacts to generate emails for")
      return
    }

    setIsGenerating(true)
    setError("")
    setSuccess(false)

    try {
      const selectedContacts = contacts.filter((c) => selectedIds.has(c.id))
      const emailPromises = selectedContacts.map(async (contact) => {
        try {
          const response = await fetch("/api/generate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactName: contact.name,
              contactCompany: contact.company,
              contactPosition: contact.title,
              investorFocus: contact.markets,
              companyName: companyProfile.name,
              companyDescription: companyProfile.description,
              fundingStage: companyProfile.fundingStage,
              userName: companyProfile.userName,
              userPosition: companyProfile.userPosition,
              researchSummary: contact.researchData?.summary || "",
              tone: companyProfile.tone,
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to generate email for ${contact.name}`)
          }

          const data = await response.json()
          return { contactId: contact.id, email: data.email }
        } catch (err) {
          console.error(`Error generating email for ${contact.name}:`, err)
          return { contactId: contact.id, email: null }
        }
      })

      const results = await Promise.all(emailPromises)
      const emails: Record<string, { subject: string; body: string }> = {}
      
      results.forEach(({ contactId, email }) => {
        if (email) {
          emails[contactId] = email
        }
      })

      setGeneratedEmails(emails)
      
      // Save drafts to database
      const saveDraftPromises = results.map(async ({ contactId, email }) => {
        if (email) {
          try {
            await fetch('/api/email-drafts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contactId,
                subject: email.subject,
                body: email.body
              })
            })
          } catch (error) {
            console.error(`Error saving draft for contact ${contactId}:`, error)
          }
        }
      })
      
      await Promise.all(saveDraftPromises)
      setSuccess(true)
    } catch (err) {
      console.error("Email generation error:", err)
      setError("Failed to generate emails. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendAllEmails = async () => {
    if (Object.keys(generatedEmails).length === 0) {
      setError("No emails generated yet")
      return
    }

    setIsSending(true)
    setError("")
    setSuccess(false)

    try {
      const selectedContacts = contacts.filter((c) => selectedIds.has(c.id))
      const sendPromises = selectedContacts.map(async (contact) => {
        const email = generatedEmails[contact.id]
        if (!email) return { success: false, contact: contact.name }

        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: contact.email,
              subject: email.subject,
              body: email.body,
              contactName: contact.name,
              companyName: companyProfile?.name || "Your Company",
            }),
          })

          return { success: response.ok, contact: contact.name }
        } catch (err) {
          console.error("Email send error:", err)
          return { success: false, contact: contact.name }
        }
      })

      const results = await Promise.all(sendPromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      // Update contact status and delete drafts for successfully sent emails
      const successfulContactIds = selectedContacts
        .filter((c, idx) => results[idx]?.success)
        .map(c => c.id)
      
      const updatePromises = successfulContactIds.map(async (contactId) => {
        try {
          // Update contact status to email_sent
          await fetch('/api/contacts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: contactId,
              researchStatus: 'email_sent'
            })
          })
          
          // Delete draft
          await fetch(`/api/email-drafts?contactId=${contactId}`, {
            method: 'DELETE'
          })
        } catch (error) {
          console.error(`Error updating contact ${contactId}:`, error)
        }
      })
      
      await Promise.all(updatePromises)
      
      // Remove successful emails from state
      setGeneratedEmails(prev => {
        const updated = { ...prev }
        successfulContactIds.forEach(id => delete updated[id])
        return updated
      })

      setSuccess(true)
      setError(`Sent ${successful} emails successfully. ${failed} failed.`)
    } catch (err) {
      console.error("Email sending error:", err)
      setError("Failed to send emails. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handlePreviewEmail = (contact: Contact) => {
    const email = generatedEmails[contact.id]
    if (email) {
      setPreviewContact(contact)
      setPreviewEmail(email)
      setIsPreviewOpen(true)
    }
  }

  const handleDeleteContacts = async () => {
    if (selectedIds.size === 0) return
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.size} selected contacts?`)
    if (!confirmed) return

    try {
      // Delete each selected contact
      const deletePromises = Array.from(selectedIds).map(async (id) => {
        try {
          await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' })
          return id
        } catch (error) {
          console.error(`Error deleting contact ${id}:`, error)
          return null
        }
      })
      
      const deletedIds = (await Promise.all(deletePromises)).filter(id => id !== null) as string[]
      
      // Remove from generated emails if they exist
      setGeneratedEmails(prev => {
        const updated = { ...prev }
        deletedIds.forEach(id => delete updated[id])
        return updated
      })
      
      // Clear selection
      setSelectedIds(new Set())
      
      // Notify parent component
      if (onContactsDeleted) {
        onContactsDeleted(deletedIds)
      }
      
      alert(`Successfully deleted ${deletedIds.length} contacts`)
    } catch (error) {
      console.error('Error deleting contacts:', error)
      alert('Failed to delete some contacts. Please try again.')
    }
  }

  const handleDeleteSingle = async (contactId: string) => {
    const confirmed = confirm('Are you sure you want to delete this contact?')
    if (!confirmed) return

    try {
      await fetch(`/api/contacts?id=${contactId}`, {
        method: 'DELETE'
      })
      
      // Remove from generated emails if it exists
      setGeneratedEmails(prev => {
        const updated = { ...prev }
        delete updated[contactId]
        return updated
      })
      
      // Remove from selection if it was selected
      setSelectedIds(prev => {
        const updated = new Set(prev)
        updated.delete(contactId)
        return updated
      })
      
      // Notify parent component
      if (onContactsDeleted) {
        onContactsDeleted([contactId])
      }
      
      alert('Contact deleted successfully')
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }


  const handleSendSingleEmail = async (email: { subject: string; body: string }) => {
    if (!previewContact || !companyProfile) return

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: previewContact.email,
          subject: email.subject,
          body: email.body,
          contactName: previewContact.name,
          companyName: companyProfile.name,
        }),
      })

      if (response.ok) {
        // Move contact to sent status
        await fetch('/api/contacts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: previewContact.id,
            researchStatus: 'email_sent'
          })
        })
        
        // Delete draft from database
        await fetch(`/api/email-drafts?contactId=${previewContact.id}`, {
          method: 'DELETE'
        })
        
        // Remove from generated emails
        setGeneratedEmails(prev => {
          const updated = { ...prev }
          delete updated[previewContact.id]
          return updated
        })
        
        setIsPreviewOpen(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setError('Failed to send email')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Composer</h1>
        <p className="text-muted-foreground mt-1">
          Generate and send personalized emails to your researched investors
        </p>
      </div>

      {/* Company Profile Status */}
      {!companyProfile && (
        <Card className="p-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Company Profile Required</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
            Please set up your company profile in Settings before generating emails.
          </p>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="mt-3 gap-2">
              <Settings className="w-4 h-4" />
              Go to Settings
            </Button>
          </Link>
        </Card>
      )}

      {/* Contacts Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Select Contacts</h3>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === contacts.length && contacts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Select All ({selectedIds.size} selected)</span>
          </div>
        </div>

        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No contacts ready for email. Move some contacts from the Research section first.
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={() => handleToggleSelect(contact.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                        {contact.company && <p className="text-sm text-muted-foreground">{contact.company}</p>}
                      </div>

                      {generatedEmails[contact.id] && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Generated</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewEmail(contact)}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline truncate">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.linkedin && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">LinkedIn:</span>
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            Profile
                          </a>
                        </div>
                      )}
                      {contact.company && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="text-foreground truncate">{contact.company}</span>
                        </div>
                      )}
                      {contact.markets && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Focus:</span>
                          <span className="text-foreground truncate">{contact.markets.split(",")[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSingle(contact.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      {selectedIds.size > 0 && (
        <div className="flex gap-2 sticky bottom-6">
          <Button
            onClick={handleGenerateEmails}
            disabled={isGenerating || !companyProfile}
            className="flex-1 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Emails...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Emails ({selectedIds.size})
              </>
            )}
          </Button>

          {Object.keys(generatedEmails).length > 0 && (
            <Button
              onClick={handleSendAllEmails}
              disabled={isSending}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send All ({Object.keys(generatedEmails).length})
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleDeleteContacts}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {Object.keys(generatedEmails).length > 0 
              ? "Emails generated successfully! You can now send them."
              : "Emails sent successfully!"
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Email Preview Modal */}
      <EmailPreviewModal
        contact={previewContact}
        email={previewEmail}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSend={handleSendSingleEmail}
      />
    </div>
  )
}
