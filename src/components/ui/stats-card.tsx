import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-candor-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-success" : "text-destructive"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}