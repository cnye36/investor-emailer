"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, ExternalLink, Trash2 } from "lucide-react"
import { AddContactDialog } from "./add-contact-dialog"

interface Investor {
  id: string
  name: string
  email: string
  company: string
  website?: string
  linkedin_url?: string
  focus_areas: string[]
  investment_range?: string
}

export function ContactsView() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddInvestor = (investor: Investor) => {
    setInvestors([...investors, { ...investor, id: Math.random().toString() }])
    setShowAddDialog(false)
  }

  const handleDeleteInvestor = (id: string) => {
    setInvestors(investors.filter((inv) => inv.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search investors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Investor
        </Button>
      </div>

      {/* Investors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInvestors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No investors added yet. Start by adding your first contact.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvestors.map((investor) => (
            <Card key={investor.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{investor.name}</CardTitle>
                <CardDescription>{investor.company}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{investor.email}</p>
                </div>
                {investor.investment_range && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Investment Range</p>
                    <p className="text-sm text-muted-foreground">{investor.investment_range}</p>
                  </div>
                )}
                {investor.focus_areas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {investor.focus_areas.map((area) => (
                        <span
                          key={area}
                          className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="flex gap-2 border-t border-border p-4">
                {investor.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={investor.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {investor.linkedin_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={investor.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteInvestor(investor.id)}
                  className="ml-auto text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <AddContactDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddInvestor} />
    </div>
  )
}
