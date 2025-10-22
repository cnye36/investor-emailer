"use client"

import { useState, useEffect } from "react"
import { Building, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanyProfile {
  name: string
  description: string
  fundingStage: string
  tone: string
  userName: string
  userPosition: string
}

interface CompanyProfileProps {
  onProfileSaved: (profile: CompanyProfile) => void
}

export function CompanyProfile({ onProfileSaved }: CompanyProfileProps) {
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    description: "",
    fundingStage: "Series A",
    tone: "professional",
    userName: "",
    userPosition: ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Load saved profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/company-profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile({
              name: data.profile.name,
              description: data.profile.description,
              fundingStage: data.profile.funding_stage,
              tone: data.profile.tone,
              userName: data.profile.user_name || "",
              userPosition: data.profile.user_position || ""
            })
            onProfileSaved({
              name: data.profile.name,
              description: data.profile.description,
              fundingStage: data.profile.funding_stage,
              tone: data.profile.tone,
              userName: data.profile.user_name || "",
              userPosition: data.profile.user_position || ""
            })
          }
        }
      } catch (error) {
        console.error('Error loading company profile:', error)
      }
    }
    fetchProfile()
  }, [onProfileSaved])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setSaveMessage("Company profile saved successfully!")
        onProfileSaved(profile)
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setSaveMessage(`Error: ${errorData.error}`)
        console.error('Error saving company profile:', errorData.error)
        // Clear error message after 5 seconds
        setTimeout(() => setSaveMessage(""), 5000)
      }
    } catch (error) {
      setSaveMessage("Error saving company profile. Please try again.")
      console.error('Error saving company profile:', error)
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(""), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Company Profile</h3>
      </div>
      
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-name">Your Name</Label>
              <Input
                id="user-name"
                value={profile.userName}
                onChange={(e) => setProfile(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="user-position">Your Position</Label>
              <Input
                id="user-position"
                value={profile.userPosition}
                onChange={(e) => setProfile(prev => ({ ...prev, userPosition: e.target.value }))}
                placeholder="e.g., CEO, Founder, CTO"
              />
            </div>
          </div>

        <div>
          <Label htmlFor="company-description">Company Description</Label>
          <Textarea
            id="company-description"
            value={profile.description}
            onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your company, what you do, and your value proposition"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="funding-stage">Funding Stage</Label>
            <Select
              value={profile.fundingStage}
              onValueChange={(value) => setProfile(prev => ({ ...prev, fundingStage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
                <SelectItem value="Series C">Series C</SelectItem>
                <SelectItem value="Series D+">Series D+</SelectItem>
                <SelectItem value="IPO">IPO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tone">Email Tone</Label>
            <Select
              value={profile.tone}
              onValueChange={(value) => setProfile(prev => ({ ...prev, tone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleSave} disabled={isSaving || !profile.name || !profile.description || !profile.userName || !profile.userPosition}>
            {isSaving ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
          
          {saveMessage && (
            <div className={`text-sm p-3 rounded-md ${
              saveMessage.includes("Error") || saveMessage.includes("error")
                ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
