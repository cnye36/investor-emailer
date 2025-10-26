"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (investor: Record<string, unknown>) => void;
}

export function AddContactDialog({ open, onOpenChange, onAdd }: AddContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    linkedin_url: "",
    investment_range: "",
    focus_areas: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate AI research - in production, this would call your API
      const focusAreas = formData.focus_areas
        .split(",")
        .map((area) => area.trim())
        .filter(Boolean)

      onAdd({
        ...formData,
        focus_areas: focusAreas,
      })

      setFormData({
        name: "",
        email: "",
        company: "",
        website: "",
        linkedin_url: "",
        investment_range: "",
        focus_areas: "",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Investor</DialogTitle>
          <DialogDescription>Add a new investor to your outreach list</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Venture Capital Fund"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/johndoe"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="investment">Investment Range</Label>
            <Input
              id="investment"
              placeholder="$500K - $5M"
              value={formData.investment_range}
              onChange={(e) => setFormData({ ...formData, investment_range: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="focus">Focus Areas (comma-separated)</Label>
            <Input
              id="focus"
              placeholder="AI, SaaS, FinTech"
              value={formData.focus_areas}
              onChange={(e) => setFormData({ ...formData, focus_areas: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Investor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
