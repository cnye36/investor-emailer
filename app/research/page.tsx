"use client"

import { useState, useEffect } from "react"
import { ResearchTab } from "@/components/research-tab"
import type { Contact } from "@/components/types"

export default function ResearchPage() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
        if (response.ok) {
          const data = await response.json()
          // Only show contacts that are in research stage
          const researchContacts = data.filter((contact: Contact) => 
            contact.researchStatus === 'researching' || contact.researchStatus === 'completed'
          )
          setContacts(researchContacts)
        } else {
          console.error('Failed to fetch contacts:', await response.text())
        }
      } catch (e) {
        console.error("Failed to load contacts:", e)
      }
    }
    fetchContacts()
  }, [])

  const handleContactsResearched = async (researchedContacts: Contact[]) => {
    // Update contacts in database
    for (const contact of researchedContacts) {
      try {
        await fetch('/api/contacts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact)
        })
      } catch (error) {
        console.error('Error updating contact:', error)
      }
    }

    // Update local state
    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        const researched = researchedContacts.find((r) => r.id === contact.id)
        return researched ? researched : contact
      }),
    )
  }

  const handleContactsRemoved = async (ids: string[]) => {
    // Delete contacts from database
    for (const id of ids) {
      try {
        await fetch(`/api/contacts?id=${id}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }

    // Update local state
    setContacts((prevContacts) => prevContacts.filter((c) => !ids.includes(c.id)))
  }

  const handleContactsMoved = async (ids: string[]) => {
    // Update local state to remove moved contacts
    setContacts((prevContacts) => prevContacts.filter((c) => !ids.includes(c.id)))
  }

  return (
    <main className="min-h-screen bg-background">
      <ResearchTab
        contacts={contacts}
        onContactsResearched={handleContactsResearched}
        onContactsRemoved={handleContactsRemoved}
        onContactsMoved={handleContactsMoved}
      />
    </main>
  )
}
