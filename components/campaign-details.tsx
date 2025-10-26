"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CampaignSchedule } from "./types"

interface CampaignDetailsProps {
  campaignId: string
  campaignName: string
  onBack: () => void
}

export function CampaignDetails({ campaignId, campaignName, onBack }: CampaignDetailsProps) {
  const [schedules, setSchedules] = useState<CampaignSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaign-schedules?campaignId=${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      } else {
        setError("Failed to fetch campaign schedules")
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setError("Failed to fetch campaign schedules")
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmailTypeLabel = (emailType: string) => {
    switch (emailType) {
      case 'initial': return 'Initial Email'
      case 'follow_up_1': return 'Follow-up 1'
      case 'follow_up_2': return 'Follow-up 2'
      case 'follow_up_3': return 'Follow-up 3'
      case 'follow_up_4': return 'Follow-up 4'
      case 'follow_up_5': return 'Follow-up 5'
      default: return emailType
    }
  }

  const pendingSchedules = schedules.filter(s => s.status === 'pending')
  const sentSchedules = schedules.filter(s => s.status === 'sent')
  const failedSchedules = schedules.filter(s => s.status === 'failed')

  const contacts = Array.from(new Set(schedules.map(s => s.contactId)))
  const contactStats = contacts.map(contactId => {
    const contactSchedules = schedules.filter(s => s.contactId === contactId)
    const contact = contactSchedules[0]?.contact
    const sentCount = contactSchedules.filter(s => s.status === 'sent').length
    const pendingCount = contactSchedules.filter(s => s.status === 'pending').length
    const failedCount = contactSchedules.filter(s => s.status === 'failed').length

    return {
      contactId,
      contact,
      sentCount,
      pendingCount,
      failedCount,
      totalCount: contactSchedules.length
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchSchedules} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{campaignName}</h2>
          <p className="text-gray-600">Campaign Details & Progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold">{sentSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{failedSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">By Contact</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          {contactStats.map(({ contactId, contact, sentCount, pendingCount, failedCount }) => (
            <Card key={contactId}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {contact?.name || 'Unknown Contact'}
                </CardTitle>
                <CardDescription>
                  {contact?.email} • {contact?.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{sentCount} sent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{pendingCount} pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{failedCount} failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {schedules
            .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
            .map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(schedule.status)}
                    <div>
                      <p className="font-medium">
                        {getEmailTypeLabel(schedule.emailType)} - {schedule.contact?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {schedule.contact?.email} • {schedule.contact?.company}
                      </p>
                      <p className="text-sm text-gray-500">
                        Scheduled: {new Date(schedule.scheduledFor).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
                {schedule.emailSubject && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium">Subject: {schedule.emailSubject}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
