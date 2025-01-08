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

interface Props {
  children: React.ReactNode
}

export default function ControlLayout({ children }: Props) {
  const user = useUserStore((state) => state)

  const handleLogout = () => {
    console.log('Logout clicked') // Add your logout logic here
  }

  const handleOpenWebpage = () => {
    window.api.window.openWebpage('https://example.com')
  }

  const handleCloseWindow = () => {
    window.api.window.close()
  }

  // console.log(user)

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
