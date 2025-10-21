import { MasterRightSidebarProps } from '@/@types/components'
import OnlineUsers from '@/components/online-users'
import QuickTrackModal from '@/components/quick-track-modal'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTimeTracker } from '@/contexts/time-tracker-context'
import { type NavItem, type SharedData } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { BarChart3, BrainCircuit, ClockIcon, PlusCircle, UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const quickLinks: NavItem[] = [
    {
        title: 'Log Time',
        href: route('time-log.index', { open: 'true' }),
        icon: ClockIcon,
    },
    {
        title: 'Add Member',
        href: route('team.index', { open: 'true' }),
        icon: UsersIcon,
    },
    {
        title: 'New Project',
        href: route('project.index', { open: 'true' }),
        icon: PlusCircle,
    },
    {
        title: 'All Logs',
        href: route('team.all-time-logs'),
        icon: BarChart3,
    },
]

export function MasterRightSidebar({ collapsed = true }: MasterRightSidebarProps) {
    const { isEmployee } = usePage<SharedData>().props

    const handleAskAiClick = () => {
        window.dispatchEvent(new Event('open-ai-chat'))
    }

    const [quickOpen, setQuickOpen] = useState(false)
    const { running } = useTimeTracker()

    const displayedQuickLinks = isEmployee ? quickLinks.filter((q) => q.title === 'Log Time') : quickLinks

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isT = (e.key || '').toLowerCase() === 't'
            const combo = (e.ctrlKey || e.metaKey) && e.shiftKey && isT
            if (!combo) return

            e.preventDefault()
            if (!running) {
                setQuickOpen(true)
            } else {
                toast.info('Tracker in session')
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [running])

    return (
        <div
            className={`sticky top-0 flex h-screen flex-col border-l border-neutral-200 bg-gradient-to-b from-blue-50 to-white shadow-md transition-all duration-300 ease-in-out dark:border-neutral-800 dark:from-gray-900 dark:to-gray-950 ${collapsed ? 'w-20' : 'w-52'}`}
        >
            <div
                className="absolute top-0 right-0 h-32 w-16 rounded-bl-[6rem] bg-blue-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-blue-600/10"
                aria-hidden="true"
            ></div>
            <div
                className="absolute bottom-0 left-0 h-32 w-16 rounded-tr-[6rem] bg-indigo-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-indigo-600/10"
                aria-hidden="true"
            ></div>
            <div
                className="absolute top-1/3 left-4 h-16 w-16 rounded-full bg-blue-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-blue-600/10"
                aria-hidden="true"
            ></div>

            <div className={`relative z-10 mt-4 flex flex-col overflow-y-auto ${collapsed ? '' : 'mr-4'}`}>
                <div className="mb-8 px-4">
                    <div className="mb-4 pb-1">
                        <h3
                            className={`text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${collapsed ? 'text-center' : ''}`}
                        >
                            {collapsed ? 'Quick' : 'Quick Actions'}
                        </h3>
                    </div>
                    <TooltipProvider delayDuration={300}>
                        <nav className="relative z-10 space-y-1.5">
                            {displayedQuickLinks.map((item) => {
                                const isActive =
                                    typeof window !== 'undefined' &&
                                    (window.location.pathname === item.href || window.location.pathname.startsWith(`${item.href.split('?')[0]}/`))

                                return (
                                    <div key={item.href} className="relative">
                                        <Link
                                            href={item.href}
                                            className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-neutral-800 dark:text-blue-300 dark:ring-neutral-700'
                                                    : 'text-neutral-700 hover:bg-neutral-50/90 hover:text-neutral-900 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100'
                                            }`}
                                        >
                                            {item.icon && (
                                                <item.icon
                                                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                        !collapsed ? 'mr-3' : ''
                                                    } ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-neutral-500 dark:text-neutral-400'}`}
                                                    aria-hidden="true"
                                                    strokeWidth={2}
                                                />
                                            )}
                                            {!collapsed && <span>{item.title}</span>}
                                            {isActive && (
                                                <div className="absolute inset-y-0 right-0 w-1 rounded-l-md bg-blue-600 dark:bg-blue-400"></div>
                                            )}
                                        </Link>
                                        {collapsed && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="pointer-events-none absolute inset-0 z-20 cursor-pointer"></div>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="left"
                                                    className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                                    sideOffset={5}
                                                >
                                                    {item.title}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                )
                            })}
                        </nav>
                    </TooltipProvider>
                </div>

                <div className="mb-8 px-4">
                    <div className="mb-4 pb-1">
                        <h3
                            className={`text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${collapsed ? 'text-center' : ''}`}
                        >
                            {collapsed ? 'Tools' : 'Tools'}
                        </h3>
                    </div>
                    <TooltipProvider delayDuration={300}>
                        <nav className="relative z-10 space-y-1.5">
                            {!isEmployee && (
                                <div className="relative">
                                    <button
                                        onClick={handleAskAiClick}
                                        className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50/90 hover:text-neutral-900 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100"
                                    >
                                        <BrainCircuit
                                            className="h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-200 group-hover:scale-110 dark:text-neutral-400"
                                            aria-hidden="true"
                                            strokeWidth={2}
                                        />
                                        {!collapsed && <span className="ml-3">Ask AI</span>}
                                    </button>
                                    {collapsed && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="pointer-events-none absolute inset-0 z-20 cursor-pointer"></div>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="left"
                                                className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                                sideOffset={5}
                                            >
                                                Ask AI
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        if (running) {
                                            toast.info('Tracker in session')
                                            return
                                        }
                                        setQuickOpen(true)
                                    }}
                                    disabled={running}
                                    className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50/90 hover:text-neutral-900 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none dark:text-neutral-300 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100"
                                >
                                    <ClockIcon
                                        className="h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform duration-200 group-hover:scale-110 dark:text-neutral-400"
                                        aria-hidden="true"
                                        strokeWidth={2}
                                    />
                                    {!collapsed && <span className="ml-3">Quick Track</span>}
                                </button>
                                {collapsed && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="pointer-events-none absolute inset-0 z-20 cursor-pointer"></div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="left"
                                            className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                            sideOffset={5}
                                        >
                                            Quick Track
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </nav>
                    </TooltipProvider>
                </div>

                <OnlineUsers collapsed={collapsed} />
            </div>
            <QuickTrackModal open={quickOpen} onOpenChange={setQuickOpen} />
        </div>
    )
}
