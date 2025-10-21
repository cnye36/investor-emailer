"use client"

import { useState, useEffect } from "react"
import { EmailComposer } from "@/components/email-composer"
import type { Contact } from "@/components/types"

export default function ComposerPage() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
        if (response.ok) {
          const data = await response.json()
          // Only show contacts that are ready for email (moved from research)
          const researchedContacts = data.filter((c: Contact) => c.researchStatus === "ready_for_email")
          setContacts(researchedContacts)
        } else {
          console.error('Failed to fetch contacts:', await response.text())
        }
      } catch (e) {
        console.error("Failed to load contacts:", e)
      }
    }
    fetchContacts()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <EmailComposer contacts={contacts} />
    </main>
  )
}
