"use client"

import React, { useState, useEffect } from "react"
import { X, Send, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Contact } from "./types"

interface EmailPreviewModalProps {
  contact: Contact | null
  email: { subject: string; body: string } | null
  isOpen: boolean
  onClose: () => void
  onSend?: (email: { subject: string; body: string }) => void
}

export function EmailPreviewModal({ 
  contact, 
  email, 
  isOpen, 
  onClose, 
  onSend 
}: EmailPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSubject, setEditedSubject] = useState("")
  const [editedBody, setEditedBody] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Update state when email prop changes
  useEffect(() => {
    if (email) {
      setEditedSubject(email.subject || "")
      setEditedBody(email.body || "")
    }
  }, [email])


  if (!isOpen || !contact || !email) return null

  const handleSend = async () => {
    if (!onSend) return
    
    setIsSending(true)
    try {
      await onSend({
        subject: editedSubject,
        body: editedBody
      })
      onClose()
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Email Preview</h2>
            <p className="text-muted-foreground">To: {contact.name} ({contact.email})</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows={12}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <div className="p-3 bg-muted rounded-md mt-1">
                  {editedSubject}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Email Body</Label>
                <div className="p-4 bg-muted rounded-md mt-1 whitespace-pre-wrap">
                  {editedBody}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {onSend && (
              <Button 
                onClick={handleSend} 
                disabled={isSending}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
