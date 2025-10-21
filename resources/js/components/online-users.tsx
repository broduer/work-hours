import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type SharedData, type User } from '@/types'
import { usePage } from '@inertiajs/react'
import { useEchoPresence } from '@laravel/echo-react'
import { useEffect, useMemo, useState } from 'react'

export interface OnlineUsersProps {
    collapsed?: boolean
}
export type PresenceUser = Pick<User, 'id' | 'name' | 'email' | 'avatar'>

export default function OnlineUsers({ collapsed = true }: OnlineUsersProps) {
    const { auth, teamContext } = usePage<SharedData>().props as SharedData & {
        teamContext?: { leaderIds: number[]; memberIds: number[] } | null
    }

    const [online, setOnline] = useState<PresenceUser[]>([])
    const { channel, leave } = useEchoPresence<PresenceUser>('online')
    useEffect(() => {
        const ch = channel()
        ch.here((users: PresenceUser[]) => {
            setOnline(users.filter((u) => u.id !== auth.user.id))
        })
        ch.joining((user: PresenceUser) => {
            if (user.id === auth.user.id) return
            setOnline((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]))
        })
        ch.leaving((user: PresenceUser) => {
            if (user.id === auth.user.id) return
            setOnline((prev) => prev.filter((u) => u.id !== user.id))
        })

        return () => {
            leave()
        }
    }, [channel, leave, auth.user.id])
    const filteredOnline = useMemo(() => {
        const tc = teamContext ?? null
        if (!tc) return [] as PresenceUser[]
        const ids = new Set<number>()
        if (Array.isArray(tc.memberIds)) {
            for (const id of tc.memberIds) ids.add(id)
        }
        if (Array.isArray(tc.leaderIds)) {
            for (const id of tc.leaderIds) ids.add(id)
        }
        if (ids.size === 0) return [] as PresenceUser[]
        return online.filter((u) => ids.has(u.id))
    }, [online, teamContext])

    return (
        <div className="mb-6 px-4">
            <div className="mb-4 border-b border-neutral-200 pb-1 dark:border-neutral-700">
                <h3
                    className={`text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${collapsed ? 'text-center' : ''}`}
                >
                    {collapsed ? 'Online' : `Online (${filteredOnline.length})`}
                </h3>
            </div>
            <TooltipProvider delayDuration={300}>
                {collapsed ? (
                    <div className="flex flex-col items-center gap-3">
                        {filteredOnline.map((u) => (
                            <Tooltip key={u.id}>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <span
                                            className="block h-3.5 w-3.5 rounded-full bg-green-500 shadow-sm ring-2 ring-white transition-transform hover:scale-110 dark:ring-neutral-900"
                                            aria-label="Online"
                                        />
                                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-300"></span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                    sideOffset={5}
                                >
                                    {u.name}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        {filteredOnline.length === 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className="block h-3.5 w-3.5 rounded-full bg-neutral-300 ring-2 ring-white dark:bg-neutral-700 dark:ring-neutral-900"
                                        aria-label="No one online"
                                    />
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                    sideOffset={5}
                                >
                                    No one online
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {filteredOnline.map((u) => (
                            <li key={u.id} className="flex items-center">
                                <div className="relative">
                                    <span className="block h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
                                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-300"></span>
                                </div>
                                <span className="ml-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.name}</span>
                            </li>
                        ))}
                        {filteredOnline.length === 0 && (
                            <li className="flex items-center">
                                <span className="block h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
                                <span className="ml-2.5 text-sm text-neutral-500 italic dark:text-neutral-400">No one online</span>
                            </li>
                        )}
                    </ul>
                )}
            </TooltipProvider>
        </div>
    )
}
