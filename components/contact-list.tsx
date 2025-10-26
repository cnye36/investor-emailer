"use client"

import type { Contact } from "./types";
import { ContactCard } from "./contact-card"

interface ContactListProps {
  contacts: Contact[]
  onUpdate: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactList({ contacts, onUpdate, onDelete }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No contacts found</p>
        <p className="text-muted-foreground text-sm mt-1">Add your first contact to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}
