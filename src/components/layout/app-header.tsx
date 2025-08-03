import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { User, LogOut, Settings, BarChart3, FileText, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppHeader() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="font-bold text-xl">Candor</span>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/report')}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Report Issue</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/track')}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Track Issue</span>
          </Button>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="#" alt="User avatar" />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {user?.user_metadata?.display_name ? 
                    getInitials(user.user_metadata.display_name) : 
                    'U'
                  }
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.display_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}