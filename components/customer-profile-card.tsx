"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react"
import type { CustomerProfile } from "@/lib/api-client"

interface CustomerProfileCardProps {
  profile: CustomerProfile | null
  customerName: string
  customerEmail: string
}

export function CustomerProfileCard({ profile, customerName, customerEmail }: CustomerProfileCardProps) {
  if (!profile) {
    return (
      <Card className="border-0">
        <CardContent className="p-4 text-center text-muted-foreground">No profile data available</CardContent>
      </Card>
    )
  }

  const getLoanStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending_approval":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "disbursed":
        return <DollarSign className="w-4 h-4 text-blue-500" />
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-800 border-green-300"
      case "suspended":
        return "bg-red-50 text-red-800 border-red-300"
      case "inactive":
        return "bg-gray-50 text-gray-800 border-gray-300"
      default:
        return "bg-blue-50 text-blue-800 border-blue-300"
    }
  }

  const getLoanStatusColor = (status: string | null) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-50 text-yellow-800 border-yellow-300"
      case "approved":
        return "bg-green-50 text-green-800 border-green-300"
      case "disbursed":
        return "bg-blue-50 text-blue-800 border-blue-300"
      case "rejected":
        return "bg-red-50 text-red-800 border-red-300"
      default:
        return "bg-gray-50 text-gray-800 border-gray-300"
    }
  }

  return (
    <Card className="border-0">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-lg">{customerName}</CardTitle>
          <p className="text-sm text-muted-foreground">{customerEmail}</p>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 space-y-4">
        {/* Account Section */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Account Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Account Status</p>
              <Badge variant="outline" className={`${getAccountStatusColor(profile.account_status)}`}>
                {profile.account_status.charAt(0).toUpperCase() + profile.account_status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Account Age</p>
              <p className="font-medium text-sm">
                {profile.account_age_days ? `${profile.account_age_days} days` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Loan Section */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Loan Information</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Loan Status</p>
              <div className="flex items-center gap-2">
                {getLoanStatusIcon(profile.loan_status)}
                <Badge variant="outline" className={`${getLoanStatusColor(profile.loan_status)}`}>
                  {profile.loan_status
                    ? profile.loan_status
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")
                    : "N/A"}
                </Badge>
              </div>
            </div>
            {profile.loan_amount && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-sm">${profile.loan_amount.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Engagement Section */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Engagement</h4>
          <p className="text-xs text-muted-foreground">
            Total Messages: <span className="font-semibold text-foreground">{profile.total_messages}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
