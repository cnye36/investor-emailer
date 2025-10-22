"use client"

import { CompanyProfile } from "@/components/company-profile"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company profile and application settings
          </p>
        </div>

        <CompanyProfile onProfileSaved={() => {}} />
      </div>
    </main>
  )
}
