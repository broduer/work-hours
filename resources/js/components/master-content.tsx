import { MasterContentProps } from '@/@types/components'
import AppearanceToggleDropdown from '@/components/appearance-dropdown'
import { HourlyRateStatusBar } from '@/components/hourly-rate-status-bar'
import RunningTracker from '@/components/running-tracker'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/contexts/notifications-context'
import type { SharedData } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { Bell, ChevronRight, Home, Settings } from 'lucide-react'

export function MasterContent({ children, breadcrumbs = [] }: MasterContentProps) {
    const { unreadCount, isAdmin } = useNotifications()
    const { isEmployee, hasCheckinEnabled } = usePage<SharedData>().props

    return (
        <div className="relative flex flex-1 flex-col">
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-gradient-to-r from-white/95 to-blue-50/95 shadow-md backdrop-blur-md dark:border-gray-700 dark:from-gray-800/95 dark:to-gray-750/95 print:hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3.5">
                    <div className="flex items-center">
                        <div className="relative flex items-center">
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg p-2 text-gray-700 transition-all hover:bg-blue-100/70 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 cursor-pointer"
                            >
                                <Home className="h-5 w-5" />
                            </Link>
                        </div>
                        {breadcrumbs.length > 0 && (
                            <div className="ml-2 flex items-center overflow-x-auto">
                                <ChevronRight className="mx-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={breadcrumb.href || index} className="flex items-center whitespace-nowrap">
                                        {breadcrumb.href ? (
                                            <Link
                                                href={breadcrumb.href}
                                                className="text-sm font-medium text-gray-700 transition-all hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                            >
                                                {breadcrumb.title}
                                            </Link>
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{breadcrumb.title}</span>
                                        )}
                                        {index < breadcrumbs.length - 1 && <ChevronRight className="mx-1 h-4 w-4 text-gray-400 dark:text-gray-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <RunningTracker />
                    </div>

                    <div className="flex items-center gap-4">
                        <AppearanceToggleDropdown className="rounded-lg text-gray-700 dark:text-gray-200" />

                        <Link
                            href="/calendar"
                            className="relative flex items-center rounded-lg p-2 text-gray-700 transition-all hover:bg-blue-100/70 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 cursor-pointer"
                            aria-label="View calendar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                            >
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </Link>

                        {isEmployee && hasCheckinEnabled && (
                            <Link
                                href={route('checkin.index')}
                                className="relative flex items-center rounded-lg p-2 text-gray-700 transition-all hover:bg-blue-100/70 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                aria-label="Employee check-in"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <path d="M7 10h.01"></path>
                                    <path d="M12 10h.01"></path>
                                    <path d="M17 10h.01"></path>
                                    <path d="M7 15h.01"></path>
                                    <path d="M12 15h.01"></path>
                                    <path d="M17 15h.01"></path>
                                </svg>
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/administration"
                                className="relative flex items-center rounded-lg p-2 text-gray-700 transition-all hover:bg-blue-100/70 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                aria-label="Admin Dashboard"
                            >
                                <Settings className="h-5 w-5" />
                            </Link>
                        )}

                        <Link
                            href="/notifications"
                            className="relative flex items-center rounded-lg p-2 text-gray-700 transition-all hover:bg-blue-100/70 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                            aria-label="View notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full border-0 px-1.5 text-xs font-semibold shadow-md"
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="print:hidden">{!isEmployee && <HourlyRateStatusBar />}</div>

                <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-16 print:max-w-none print:px-0 print:pt-0 print:pb-0">{children}</div>
            </main>
        </div>
    )
}
