"use client"

import { useState } from "react"
import { Loader2, Zap, CheckCircle2, AlertCircle, Trash2, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ResearchModal } from "@/components/research-modal"
import type { Contact } from "./types"

interface ResearchTabProps {
  contacts: Contact[]
  onContactsResearched: (contacts: Contact[]) => void
  onContactsRemoved: (ids: string[]) => void
  onContactsMoved: (ids: string[]) => void
}

export function ResearchTab({ contacts, onContactsResearched, onContactsRemoved, onContactsMoved }: ResearchTabProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isResearching, setIsResearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
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

  const handleResearch = async () => {
    if (selectedIds.size === 0) return

    setIsResearching(true)
    const selectedContacts = contacts.filter((c) => selectedIds.has(c.id))

    try {
      // Research each contact
      const researchedContacts = await Promise.all(
        selectedContacts.map(async (contact) => {
          try {
            const response = await fetch("/api/research-investor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: contact.name,
                company: contact.company,
                websiteUrl: contact.website,
                linkedinUrl: contact.linkedin,
                twitterUrl: contact.twitter,
              }),
            })

            if (!response.ok) throw new Error("Research failed")

            const data = await response.json()

            return {
              ...contact,
              researchStatus: "completed" as const,
              researchData: {
                summary: data.research.summary,
                completedAt: data.research.generatedAt,
              },
            }
          } catch (error) {
            console.error("Research error:", error)
            return {
              ...contact,
              researchStatus: "failed" as const,
            }
          }
        }),
      )

      onContactsResearched(researchedContacts)
      setSelectedIds(new Set())
    } finally {
      setIsResearching(false)
    }
  }

  const handleDelete = () => {
    if (selectedIds.size === 0) return
    onContactsRemoved(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const handleDeleteSingle = async (contactId: string) => {
    const confirmed = confirm("Are you sure you want to delete this contact?");
    if (!confirmed) return;

    try {
      await fetch(`/api/contacts?id=${contactId}`, {
        method: "DELETE",
      });

      onContactsRemoved([contactId]);
      alert("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  const handleViewResearch = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedContact(null)
  }

  const handleMoveToComposer = async (contactIds: string[]) => {
    try {
      // Update contacts to move them to composer status
      for (const id of contactIds) {
        await fetch('/api/contacts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            researchStatus: 'ready_for_email'
          })
        })
      }
      
      // Remove from local state using the moved handler
      onContactsMoved(contactIds)
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Error moving contacts to composer:', error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Research Investors
        </h1>
        <p className="text-muted-foreground mt-1">
          Select investors to research, then they&apos;ll be ready for email
          composition
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4"
        />
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No investors found matching your search"
                : "No investors to research. Import a CSV first."}
            </p>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                checked={
                  selectedIds.size === filteredContacts.length &&
                  filteredContacts.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium text-foreground">
                Select All ({selectedIds.size} selected)
              </span>
            </div>

            {/* Contact Cards */}
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={() => handleToggleSelect(contact.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {contact.name}
                        </h3>
                        {contact.title && (
                          <p className="text-sm text-muted-foreground">
                            {contact.title}
                          </p>
                        )}
                        {contact.company && (
                          <p className="text-sm text-muted-foreground">
                            {contact.company}
                          </p>
                        )}
                      </div>

                      {contact.researchStatus === "completed" && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Researched
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResearch(contact)}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                      {contact.researchStatus === "failed" && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Failed</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResearch(contact)}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                      {contact.email && (
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-primary hover:underline truncate"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-primary hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.linkedin && (
                        <div>
                          <p className="text-muted-foreground">LinkedIn</p>
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
                      {contact.twitter && (
                        <div>
                          <p className="text-muted-foreground">Twitter</p>
                          <a
                            href={contact.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            Profile
                          </a>
                        </div>
                      )}
                      {contact.website && (
                        <div>
                          <p className="text-muted-foreground">Website</p>
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            Visit
                          </a>
                        </div>
                      )}
                      {contact.markets && (
                        <div>
                          <p className="text-muted-foreground">Markets</p>
                          <p className="text-foreground truncate">
                            {contact.markets.split(",")[0]}
                          </p>
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
          </>
        )}
      </div>

      {/* Action Buttons */}
      {selectedIds.size > 0 && (
        <div className="flex gap-2 sticky bottom-6">
          <Button
            onClick={handleResearch}
            disabled={isResearching}
            className="flex-1 gap-2"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Research Selected ({selectedIds.size})
              </>
            )}
          </Button>

          {/* Move to Composer button - only show for completed research */}
          {Array.from(selectedIds).every((id) => {
            const contact = contacts.find((c) => c.id === id);
            return contact?.researchStatus === "completed";
          }) && (
            <Button
              onClick={() => handleMoveToComposer(Array.from(selectedIds))}
              variant="default"
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="w-4 h-4" />
              Move to Composer
            </Button>
          )}

          <Button
            onClick={handleDelete}
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      )}

      {/* Research Modal */}
      <ResearchModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
