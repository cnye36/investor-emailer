"use client"

import { useState, useEffect } from "react"
import { CampaignManager } from "@/components/campaign-manager"
import { CampaignDetails } from "@/components/campaign-details"
import type { Contact, Campaign } from "@/components/types"

export default function CampaignsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignsChange = () => {
    // Refresh campaigns if needed
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (selectedCampaign) {
    return (
      <div className="container mx-auto py-8">
        <CampaignDetails
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.name}
          onBack={() => setSelectedCampaign(null)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <CampaignManager
        contacts={contacts}
        onCampaignsChange={handleCampaignsChange}
        onCampaignSelect={setSelectedCampaign}
      />
    </div>
  )
}
