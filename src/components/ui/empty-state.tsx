import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center space-y-4", className)}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}