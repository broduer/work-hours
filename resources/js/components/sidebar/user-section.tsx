import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type User } from '@/types'
import { Link } from '@inertiajs/react'
import { LogOut } from 'lucide-react'

interface UserSectionProps {
    collapsed: boolean
    user: User
}

export function UserSection({ collapsed, user }: UserSectionProps) {
    return (
        <>
            <div className="mb-3 px-2">
                <div className={`flex items-center ${collapsed ? 'justify-center' : ''} relative z-10`}>
                    <div className="flex-shrink-0">
                        {user.profile_photo_url ? (
                            <img
                                src={user.profile_photo_url}
                                alt={user.name}
                                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm transition-transform hover:scale-105 dark:border-gray-800"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 shadow-sm ring-2 ring-white transition-transform hover:scale-105 dark:bg-blue-900 dark:text-blue-200 dark:ring-gray-800">
                                {user && user.name ? user.name.charAt(0) : ''}
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="ml-3">
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{user && user.name ? user.name : ''}</p>
                            <Link
                                href={route('profile.edit')}
                                className="relative z-10 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View profile
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto border-t border-gray-200 px-2 pt-3 dark:border-gray-700">
                <TooltipProvider delayDuration={300}>
                    <div className="relative">
                        <Link
                            href={route('logout')}
                            method="post"
                            className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                            <LogOut
                                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                    !collapsed ? 'mr-3' : ''
                                } text-red-500 dark:text-red-400`}
                                aria-hidden="true"
                                strokeWidth={2}
                            />
                            {!collapsed && <span>Logout</span>}
                        </Link>
                        {collapsed && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="pointer-events-none absolute inset-0 z-20 cursor-pointer"></div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="border-neutral-200 bg-white text-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                    sideOffset={5}
                                >
                                    Logout
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </TooltipProvider>
            </div>
        </>
    )
}
