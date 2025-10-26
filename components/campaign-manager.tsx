"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Pause, Trash2, Calendar, Users, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Campaign, Contact } from "./types"

interface CampaignManagerProps {
  contacts: Contact[]
  onCampaignsChange?: () => void
  onCampaignSelect?: (campaign: Campaign) => void
}

export function CampaignManager({ contacts, onCampaignsChange, onCampaignSelect }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  const [followUpDays, setFollowUpDays] = useState([3, 6])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || selectedContacts.size === 0) {
      setError("Please provide a campaign name and select at least one contact")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          description: campaignDescription,
          contactIds: Array.from(selectedContacts),
          followUpDays
        })
      })

      if (response.ok) {
        const newCampaign = await response.json()
        setCampaigns(prev => [newCampaign, ...prev])
        setShowCreateDialog(false)
        setCampaignName("")
        setCampaignDescription("")
        setSelectedContacts(new Set())
        onCampaignsChange?.()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create campaign")
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      setError("Failed to create campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCampaignStatus = async (campaignId: string, newStatus: 'active' | 'paused') => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaignId,
          status: newStatus
        })
      })

      if (response.ok) {
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: newStatus } : c
        ))
        onCampaignsChange?.()
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId))
        onCampaignsChange?.()
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <p className="text-gray-600">Create and manage automated email sequences</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onCampaignSelect?.(campaign)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {campaign.name}
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{campaign.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCampaignStatus(campaign.id, 'paused')}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCampaignStatus(campaign.id, 'active')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {campaign.totalContacts || 0} contacts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {campaign.sentEmails || 0} sent
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {campaign.pendingEmails || 0} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Created {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first campaign to start automated email sequences
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name*</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 2024 Investor Outreach"
              />
            </div>

            <div>
              <Label htmlFor="campaignDescription">Description</Label>
              <Textarea
                id="campaignDescription"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Optional description for this campaign"
                rows={3}
              />
            </div>

            <div>
              <Label>Follow-up Schedule</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Days"
                  value={followUpDays[0] || ''}
                  onChange={(e) => setFollowUpDays([parseInt(e.target.value) || 3, followUpDays[1] || 6])}
                  className="w-20"
                />
                <span className="text-sm text-gray-500 self-center">and</span>
                <Input
                  type="number"
                  placeholder="Days"
                  value={followUpDays[1] || ''}
                  onChange={(e) => setFollowUpDays([followUpDays[0] || 3, parseInt(e.target.value) || 6])}
                  className="w-20"
                />
                <span className="text-sm text-gray-500 self-center">days later</span>
              </div>
            </div>

            <div>
              <Label>Select Contacts ({selectedContacts.size} selected)</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={contact.id}
                      checked={selectedContacts.has(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <Label htmlFor={contact.id} className="text-sm">
                      {contact.name} ({contact.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
