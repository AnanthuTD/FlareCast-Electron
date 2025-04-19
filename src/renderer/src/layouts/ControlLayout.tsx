import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { X } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useUserStore } from '@renderer/stores/userStore'
import { logout } from '@renderer/api/api'
import { toast } from 'sonner'

interface Props {
  children: React.ReactNode
}

export default function ControlLayout({ children }: Props) {
  const user = useUserStore((state) => state)

  const handleLogout = () => {
    logout()
    toast.info('Logged out')
  }

  const handleOpenWebpage = () => {
    window.api.window.openWebpage(import.meta.env.VITE_WEBSITE_LIBRARY_URL)
  }

  const handleCloseWindow = () => {
    window.api.window.close()
  }

  return (
    <div>
      <div className="flex items-center justify-between p-2 text-white shadow-md draggable">
        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="non-draggable">
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.image} alt="User Avatar" />
              <AvatarFallback>{user.firstName[0]}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenWebpage}>Open in Webpage</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Close Button */}
        <Button
          size="icon"
          className="ml-auto non-draggable"
          onClick={handleCloseWindow}
          variant={'destructive'}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <section>{children}</section>
    </div>
  )
}
