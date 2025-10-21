"use client"

import { useState } from "react"
import type { Contact } from "./contact-management"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Mail, Phone, Edit2, Trash2 } from "lucide-react"
import { ContactForm } from "./contact-form"

interface ContactCardProps {
  contact: Contact
  onUpdate: (contact: Contact) => void
  onDelete: (id: string) => void
}

const statusColors: Record<Contact["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  interested: "bg-purple-100 text-purple-800",
  invested: "bg-green-100 text-green-800",
}

export function ContactCard({ contact, onUpdate, onDelete }: ContactCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleUpdate = (updatedData: Omit<Contact, "id" | "createdAt">) => {
    onUpdate({
      ...contact,
      ...updatedData,
    })
    setIsEditOpen(false)
  }

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{contact.name}</h3>
              <Badge className={statusColors[contact.status]}>{contact.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {contact.title} at {contact.company}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="w-4 h-4" />
                {contact.email}
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </a>
              )}
            </div>

            {contact.notes && <p className="text-sm text-muted-foreground mt-3 italic">{contact.notes}</p>}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <ContactForm initialData={contact} onSubmit={handleUpdate} />
        </DialogContent>
      </Dialog>
    </>
  )
}
