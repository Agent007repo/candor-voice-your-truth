import { ReactNode } from "react"
import { AppHeader } from "./app-header"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}