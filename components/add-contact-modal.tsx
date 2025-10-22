"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Contact } from "./types"

interface AddContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (contact: Contact) => void
}

export function AddContactModal({ open, onOpenChange, onCreated }: AddContactModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [title, setTitle] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [twitter, setTwitter] = useState("")
  const [secondaryEmail, setSecondaryEmail] = useState("")
  const [tertiaryEmail, setTertiaryEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setName("")
    setEmail("")
    setCompany("")
    setTitle("")
    setPhone("")
    setWebsite("")
    setLinkedin("")
    setTwitter("")
    setSecondaryEmail("")
    setTertiaryEmail("")
    setError("")
  }

  const handleSubmit = async () => {
    setError("")
    if (!name.trim() || !email.trim()) {
      setError("Name and primary email are required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid primary email")
      return
    }
    if (secondaryEmail && !emailRegex.test(secondaryEmail)) {
      setError("Secondary email is invalid")
      return
    }
    if (tertiaryEmail && !emailRegex.test(tertiaryEmail)) {
      setError("Third email is invalid")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        title: title.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        twitter: twitter.trim() || undefined,
        researchStatus: "pending" as const,
        // Store alternate emails inside researchData so they persist
        researchData: {
          altEmails: [secondaryEmail, tertiaryEmail].filter(Boolean),
        },
      }

      const resp = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(text || "Failed to create contact")
      }

      const created: Contact[] = await resp.json()
      const newContact = Array.isArray(created) ? created[0] : created
      if (newContact) {
        onCreated(newContact)
        reset()
        onOpenChange(false)
      }
    } catch (e) {
      console.error("Create contact error:", e)
      setError("Failed to create contact")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Primary Email*</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="secondaryEmail">Additional Emails</Label>
              <Input id="secondaryEmail" type="email" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tertiaryEmail">Industy Focus</Label>
              <Input id="tertiaryEmail" type="email" value={tertiaryEmail} onChange={(e) => setTertiaryEmail(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Contact</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


