"use client"

import { useState, useEffect } from "react"
import { Mail, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/components/types"

export default function EmailsSentPage() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
        if (response.ok) {
          const data = await response.json()
          // Only show contacts that have sent emails
          const sentContacts = data.filter((c: Contact) => c.researchStatus === "email_sent")
          setContacts(sentContacts)
        } else {
          console.error('Failed to fetch contacts:', await response.text())
        }
      } catch (e) {
        console.error("Failed to load contacts:", e)
      }
    }
    fetchContacts()
  }, [])

  const handleFollowUp = async (contactId: string) => {
    // Move contact back to ready_for_email status for follow-up
    try {
      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contactId,
          researchStatus: 'ready_for_email'
        })
      })
      
      // Remove from sent contacts
      setContacts(prev => prev.filter(c => c.id !== contactId))
    } catch (error) {
      console.error('Error moving contact for follow-up:', error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    const confirmed = confirm('Are you sure you want to delete this contact?')
    if (!confirmed) return

    try {
      await fetch(`/api/contacts?id=${contactId}`, {
        method: 'DELETE'
      })
      
      // Remove from local state
      setContacts(prev => prev.filter(c => c.id !== contactId))
      alert('Contact deleted successfully')
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emails Sent</h1>
          <p className="text-muted-foreground mt-1">
            Track your sent emails and manage follow-ups
          </p>
        </div>

        {contacts.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No emails sent yet</h3>
            <p className="text-muted-foreground">
              Send some emails from the Email Composer to see them here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <Badge variant="default" className="bg-green-600">
                        Email Sent
                      </Badge>
                    </div>
                    
                    {contact.title && <p className="text-sm text-muted-foreground mb-1">{contact.title}</p>}
                    {contact.company && <p className="text-sm text-muted-foreground mb-3">{contact.company}</p>}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFollowUp(contact.id)}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Follow Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
