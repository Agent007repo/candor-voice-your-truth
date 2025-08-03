import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-8 border-b border-border/50", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}