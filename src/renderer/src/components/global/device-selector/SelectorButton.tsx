import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@renderer/components/ui/hover-card'
import { CircleCheck } from 'lucide-react'
import { useState } from 'react'

type Option = {
  label: string
  icon: React.ReactNode
  deviceId: string
  thumbnail?: string
}

export type SelectorButtonProps = {
  options: Option[]
  label: string
  icon: React.ReactNode
  onSelect: (deviceId: string) => void
}

function SelectorButton({ label, options, icon, onSelect }: SelectorButtonProps) {
  const [selected, setSelected] = useState<Option>(options[0])

  const handleSelect = (deviceId: string) => {
    setSelected(options.find((option) => option.deviceId === deviceId)!)
    onSelect(deviceId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm font-medium w-full border shadow rounded-sm hover:bg-slate-300">
        {icon} {selected ? selected.label : label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border border-gray-300 shadow-lg rounded-md w-64 gap-4">
        <DropdownMenuGroup>
          {options.map((option) => (
            <HoverCard key={option.deviceId} closeDelay={0} openDelay={0}>
              <HoverCardTrigger>
                <DropdownMenuItem
                  key={option.deviceId}
                  onClick={() => handleSelect(option.deviceId)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md w-full"
                >
                  <span className="flex justify-between w-full">
                    <span className="text-gray-700 flex items-center gap-2 w-full">
                      {option.icon}
                      {option.label}
                    </span>
                    {selected && selected.deviceId === option?.deviceId && (
                      <CircleCheck color="#625DF5" />
                    )}
                  </span>
                </DropdownMenuItem>
              </HoverCardTrigger>
              <HoverCardContent className="w-fit" align="end">
                <img src={option.thumbnail} alt="thumbnail" />
              </HoverCardContent>
            </HoverCard>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SelectorButton
