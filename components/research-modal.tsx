"use client"

import { X, ExternalLink, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "./types"

interface ResearchModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
}

export function ResearchModal({ contact, isOpen, onClose }: ResearchModalProps) {
  if (!isOpen || !contact || !contact.researchData) return null

  const researchData = contact.researchData

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{contact.name}</h2>
            {contact.title && <p className="text-muted-foreground">{contact.title}</p>}
            {contact.company && <p className="text-muted-foreground">{contact.company}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {contact.email && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Email:</span>
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Phone:</span>
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.linkedin && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">LinkedIn:</span>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {contact.twitter && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Twitter:</span>
                <a
                  href={contact.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {contact.website && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Website:</span>
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Visit Site <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Research Status */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={contact.researchStatus === "completed" ? "default" : "destructive"}>
                {contact.researchStatus === "completed" ? "Research Completed" : "Research Failed"}
              </Badge>
              {researchData.completedAt && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(researchData.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Research Results */}
          {contact.researchStatus === "completed" && researchData.summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Research Summary</h3>
              </div>
              
              <Card className="p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {researchData.summary}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {contact.researchStatus === "failed" && (
            <Card className="p-4 border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-2 text-destructive">
                <X className="w-4 h-4" />
                <span className="font-medium">Research Failed</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Unable to generate research for this contact. This could be due to insufficient information or API issues.
              </p>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
