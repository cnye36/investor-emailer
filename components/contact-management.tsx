"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Trash2,
  Mail,
  Phone,
  Building2,
  Upload,
  Globe,
  Linkedin,
  Twitter,
  Users,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CSVUpload } from "./csv-upload"
import { AddContactModal } from "./add-contact-modal"
import type { Contact } from "./types"

export function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCSVUpload, setShowCSVUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Fetch contacts from API on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log('Fetching contacts from API...') // Debug log
        const response = await fetch('/api/contacts')
        console.log('API response status:', response.status) // Debug log
        
        if (response.ok) {
          const data = await response.json()
          console.log('Contacts fetched:', data.length, 'contacts') // Debug log
          setContacts(data)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch contacts:', errorText)
        }
      } catch (e) {
        console.error("Failed to load contacts:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(
    (contact) => {
      // Filter by search term
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Only show contacts that haven't been moved to research or other stages
      const isInContactsStage = !contact.researchStatus || contact.researchStatus === 'pending'
      
      return matchesSearch && isInContactsStage
    }
  )

  // Selection handlers
  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedContacts.size} selected contacts?`)
    if (!confirmed) return

    try {
      // Delete each selected contact
      const deletePromises = Array.from(selectedContacts).map(id => 
        fetch(`/api/contacts?id=${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Update local state
      setContacts(contacts.filter(c => !selectedContacts.has(c.id)))
      setSelectedContacts(new Set())
      
      alert(`Successfully deleted ${selectedContacts.size} contacts`)
    } catch (error) {
      console.error('Error deleting contacts:', error)
      alert('Failed to delete some contacts. Please try again.')
    }
  }

  const handleMoveToResearch = () => {
    if (selectedContacts.size === 0) return
    
    // Update contacts to have research status
    const updatedContacts = contacts.map(contact => 
      selectedContacts.has(contact.id) 
        ? { ...contact, researchStatus: 'researching' as const }
        : contact
    )
    
    // Update in database
    selectedContacts.forEach(async (id) => {
      try {
        const contact = contacts.find(c => c.id === id)
        if (contact) {
          await fetch('/api/contacts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...contact, researchStatus: 'researching' })
          })
        }
      } catch (error) {
        console.error('Error updating contact:', error)
      }
    })
    
    setContacts(updatedContacts)
    setSelectedContacts(new Set())
    alert(`Moved ${selectedContacts.size} contacts to research queue`)
  }

  const handleMoveToEmailsSent = async () => {
    if (selectedContacts.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to mark ${selectedContacts.size} contacts as emails sent?`
    );
    if (!confirmed) return;

    try {
      // Update contacts to have email_sent status
      const updatedContacts = contacts.map((contact) =>
        selectedContacts.has(contact.id)
          ? { ...contact, researchStatus: "email_sent" as const }
          : contact
      );

      // Update in database
      const updatePromises = Array.from(selectedContacts).map(async (id) => {
        try {
          const contact = contacts.find((c) => c.id === id);
          if (contact) {
            await fetch("/api/contacts", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, researchStatus: "email_sent" }),
            });
          }
        } catch (error) {
          console.error("Error updating contact:", error);
        }
      });

      await Promise.all(updatePromises);

      setContacts(updatedContacts);
      setSelectedContacts(new Set());
      alert(`Moved ${selectedContacts.size} contacts to emails sent`);
    } catch (error) {
      console.error("Error moving contacts to emails sent:", error);
      alert("Failed to update some contacts. Please try again.");
    }
  };

  const handleContactsImported = async (importedContacts: Omit<Contact, "id" | "createdAt">[]) => {
    try {
      // Check for duplicates before sending to API
      const existingEmails = new Set(contacts.map(c => c.email.toLowerCase()))
      const duplicates: string[] = []
      const uniqueContacts = importedContacts.filter(contact => {
        const email = contact.email.toLowerCase()
        if (existingEmails.has(email)) {
          duplicates.push(contact.email)
          return false
        }
        existingEmails.add(email) // Add to set to catch duplicates within the same import
        return true
      })

      if (duplicates.length > 0) {
        const duplicateMessage = duplicates.length <= 5 
          ? `Skipping ${duplicates.length} duplicate(s): ${duplicates.join(', ')}`
          : `Skipping ${duplicates.length} duplicates (first 5: ${duplicates.slice(0, 5).join(', ')}...)`
        console.log(duplicateMessage)
      }

      if (uniqueContacts.length === 0) {
        alert('All contacts in the CSV are already imported. No new contacts to add.')
        setShowCSVUpload(false)
        return
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uniqueContacts)
      })

      if (response.ok) {
        const newContacts = await response.json()
        setContacts([...newContacts, ...contacts])
        setShowCSVUpload(false)
        
        // Show success message with duplicate info
        const message = duplicates.length > 0 
          ? `Successfully imported ${newContacts.length} new contacts. Skipped ${duplicates.length} duplicates.`
          : `Successfully imported ${newContacts.length} contacts.`
        alert(message)
      } else {
        console.error('Failed to import contacts:', await response.text())
        alert('Failed to import contacts. Please try again.')
      }
    } catch (error) {
      console.error('Error importing contacts:', error)
      alert('Failed to import contacts. Please try again.')
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setContacts(contacts.filter((c) => c.id !== id))
      } else {
        console.error('Failed to delete contact:', await response.text())
        alert('Failed to delete contact. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
        <p className="text-muted-foreground mt-1">
          Manage your investor contacts
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
        <Button
          onClick={() => setShowCSVUpload(!showCSVUpload)}
          variant="outline"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>

        {selectedContacts.size > 0 && (
          <>
            <Button
              onClick={handleMoveToResearch}
              variant="default"
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Move to Research ({selectedContacts.size})
            </Button>
            <Button
              onClick={handleMoveToEmailsSent}
              variant="outline"
              className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Emails Sent ({selectedContacts.size})
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedContacts.size})
            </Button>
          </>
        )}
      </div>

      {showCSVUpload && (
        <CSVUpload onContactsImported={handleContactsImported} />
      )}

      <AddContactModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onCreated={(contact) => setContacts([contact, ...contacts])}
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredContacts.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedContacts.size === filteredContacts.length &&
                filteredContacts.length > 0
              }
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-muted-foreground">
              {selectedContacts.size === filteredContacts.length
                ? "Deselect All"
                : "Select All"}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading contacts...</p>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? "No contacts found matching your search"
                : "No contacts yet. Import a CSV to get started."}
            </p>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedContacts.has(contact.id)}
                    onCheckedChange={(checked) =>
                      handleSelectContact(contact.id, checked as boolean)
                    }
                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {contact.name}
                      </h3>
                      {contact.title && (
                        <p className="text-sm text-muted-foreground">
                          {contact.title}
                        </p>
                      )}
                      {contact.company && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-4 h-4" />
                          {contact.company}
                        </div>
                      )}
                    </div>

                    {/* Contact Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="hover:text-primary transition-colors truncate"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors truncate"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {contact.linkedin && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Linkedin className="w-4 h-4" />
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors truncate"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                      {contact.twitter && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Twitter className="w-4 h-4" />
                          <a
                            href={contact.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors truncate"
                          >
                            Twitter
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    {(contact.markets || contact.stages || contact.types) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {contact.markets && (
                          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {contact.markets.split(",")[0]}
                          </span>
                        )}
                        {contact.stages && (
                          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {contact.stages.split(",")[0]}
                          </span>
                        )}
                        {contact.types && (
                          <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                            {contact.types.split(",")[0]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{contacts.length}</p>
          <p className="text-sm text-muted-foreground">Total Contacts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {filteredContacts.length}
          </p>
          <p className="text-sm text-muted-foreground">Showing</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {selectedContacts.size}
          </p>
          <p className="text-sm text-muted-foreground">Selected</p>
        </div>
      </div>
    </div>
  );
}
