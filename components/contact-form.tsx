"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Contact } from "./types";
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"


interface ContactFormProps {
  contact?: Contact & { id: string; createdAt: string }
  onSubmit: (data: Contact) => void
  onCancel: () => void
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<Contact>(
    contact || {
      id: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      title: "",
      markets: "",
      notes: "",
      createdAt: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {contact ? "Edit Contact" : "Add New Contact"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Company *
          </label>
          <Input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Position
          </label>
          <Input
            type="text"
            name="position"
            value={formData.title}
            onChange={handleChange}
            placeholder="Job title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Industry
          </label>
          <select
            name="industry"
            value={formData.markets}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Select industry</option>
            <option value="Venture Capital">Venture Capital</option>
            <option value="Private Equity">Private Equity</option>
            <option value="Angel Investor">Angel Investor</option>
            <option value="Corporate">Corporate</option>
            <option value="Bank">Bank</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this contact..."
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {contact ? "Update Contact" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}
