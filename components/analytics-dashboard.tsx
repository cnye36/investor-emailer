"use client"

import { useState, useEffect } from "react"
import { Mail, MessageSquare, Users, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EmailRecord {
  id: string
  to: string
  contactName: string
  subject: string
  body: string
  sentAt: string
  status: "sent" | "failed"
}

export function AnalyticsDashboard() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEmailHistory()
  }, [])

  const loadEmailHistory = async () => {
    try {
      const response = await fetch("/api/email-history")
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error("Failed to load email history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalSent = emails.length
  const successfulSent = emails.filter((e) => e.status === "sent").length
  const failedSent = emails.filter((e) => e.status === "failed").length
  const successRate = totalSent > 0 ? Math.round((successfulSent / totalSent) * 100) : 0

  const getWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date()
    const weekData = days.map((day, index) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - index))
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayEmails = emails.filter((e) => {
        const emailDate = new Date(e.sentAt)
        return emailDate >= dayStart && emailDate <= dayEnd
      })

      return {
        date: day,
        sent: dayEmails.length,
        successful: dayEmails.filter((e) => e.status === "sent").length,
        failed: dayEmails.filter((e) => e.status === "failed").length,
      }
    })
    return weekData
  }

  const weeklyData = getWeeklyData()

  const stats = [
    { label: "Total Emails Sent", value: totalSent.toString(), icon: Mail, color: "text-blue-600" },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-green-600" },
    { label: "Failed", value: failedSent.toString(), icon: MessageSquare, color: "text-red-600" },
    {
      label: "Unique Contacts",
      value: new Set(emails.map((e) => e.to)).size.toString(),
      icon: Users,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your email outreach performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      {!isLoading && totalSent > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                <Bar dataKey="successful" fill="#10b981" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Success Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} name="Successful" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {isLoading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </Card>
      )}

      {!isLoading && totalSent === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No email data yet. Start sending emails to see analytics.</p>
        </Card>
      )}
    </div>
  )
}
