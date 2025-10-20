import { MasterSidebarProps, NavItemGroup } from '@/@types/components'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useNotifications } from '@/contexts/notifications-context'
import { type SharedData } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import {
    Building,
    CheckSquare,
    ClipboardList,
    FileText,
    LayoutGrid,
    LucideCreditCard,
    LucideProjector,
    LucideServerCog,
    Settings,
    TimerIcon,
} from 'lucide-react'
import AppLogo from './app-logo'
import AppLogoIcon from './app-logo-icon'
import { FooterNavigation } from './sidebar/footer-navigation'
import { IntegrationNavigation } from './sidebar/integration-navigation'
import { SidebarGroup } from './sidebar/sidebar-group'
import { UserSection } from './sidebar/user-section'

const navGroups: NavItemGroup[] = [
    {
        title: 'Work',
        icon: Building,
        items: [
            {
                title: 'Team',
                href: '/team',
                icon: LucideServerCog,
            },
            {
                title: 'Clients',
                href: '/client',
                icon: Building,
            },
            {
                title: 'Projects',
                href: '/project',
                icon: LucideProjector,
            },
            {
                title: 'Tasks',
                href: '/task',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Time & Billing',
        icon: TimerIcon,
        items: [
            {
                title: 'Time Log',
                href: '/time-log',
                icon: TimerIcon,
            },
            {
                title: 'Tags',
                href: '/tags',
                icon: FileText,
            },
            {
                title: 'Invoices',
                href: '/invoice',
                icon: LucideCreditCard,
            },
        ],
    },
    {
        title: 'Administration',
        icon: Settings,
        items: [
            {
                title: 'Approvals',
                href: '/time-log/approvals',
                icon: CheckSquare,
            },
            {
                title: 'Integration',
                href: '/integration',
                icon: Settings,
            },
        ],
    },
]

export function MasterSidebar({ collapsed }: MasterSidebarProps) {
    const { isGitHubIntegrated, isJiraIntegrated, auth, isEmployee } = usePage<SharedData>().props
    const { pendingTaskCount, approvalCount } = useNotifications()
    const employeeItems = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { title: 'Projects', href: '/project', icon: LucideProjector },
        { title: 'Tasks', href: '/task', icon: ClipboardList },
        { title: 'Time Logs', href: '/time-log', icon: TimerIcon },
    ]

    return (
        <div
            className={`sticky top-0 flex h-screen flex-col border-r border-neutral-200 bg-gradient-to-b from-blue-50 to-white shadow-md transition-all duration-300 ease-in-out dark:border-neutral-800 dark:from-gray-900 dark:to-gray-950 ${
                collapsed ? 'w-20' : 'w-62'
            }`}
        >
            <div
                className="absolute top-0 left-0 h-32 w-20 rounded-br-[6rem] bg-blue-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-blue-600/10"
                aria-hidden="true"
            ></div>
            <div
                className="absolute right-0 bottom-0 h-32 w-32 rounded-tl-[6rem] bg-indigo-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-indigo-600/10"
                aria-hidden="true"
            ></div>
            <div
                className="absolute top-1/3 right-4 h-16 w-16 rounded-full bg-blue-500/5 backdrop-blur-sm transition-opacity duration-700 ease-in-out dark:bg-blue-600/10"
                aria-hidden="true"
            ></div>

            <div
                className={`relative z-10 border-b border-neutral-200 py-4 transition-all duration-300 ease-in-out dark:border-neutral-700 ${
                    collapsed ? 'flex flex-col items-center' : 'px-4'
                }`}
            >
                <div className={`flex w-full items-center ${collapsed ? 'flex-col justify-center' : ''}`}>
                    <a
                        href="/dashboard"
                        className={`${collapsed ? 'mb-2 flex items-center justify-center p-1 transition-transform hover:scale-105' : 'flex items-center transition-transform hover:scale-105'}`}
                    >
                        {collapsed ? <AppLogoIcon className="h-12 w-24 text-neutral-700 dark:text-neutral-300" /> : <AppLogo />}
                    </a>
                </div>
            </div>

            <div className={`relative z-10 flex flex-1 flex-col overflow-y-auto pt-4 ${collapsed ? 'px-2' : 'px-4'}`}>
                {!isEmployee && (
                    <div className="mb-4">
                        <TooltipProvider delayDuration={300}>
                            <div className="relative">
                                <Link
                                    href="/dashboard"
                                    className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        typeof window !== 'undefined' &&
                                        (window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/'))
                                            ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-neutral-800 dark:text-blue-300 dark:ring-neutral-700'
                                            : 'text-neutral-700 hover:bg-neutral-50/90 hover:text-neutral-900 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100'
                                    }`}
                                >
                                    <div className="relative">
                                        <LayoutGrid
                                            className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                typeof window !== 'undefined' &&
                                                (window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/'))
                                                    ? 'text-blue-600 dark:text-blue-300'
                                                    : 'text-neutral-500 dark:text-neutral-400'
                                            } ${!collapsed ? 'mr-3' : ''}`}
                                            aria-hidden="true"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    {!collapsed && <span>Dashboard</span>}
                                    {typeof window !== 'undefined' &&
                                        (window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/')) && (
                                            <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400"></div>
                                        )}
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
                                            Dashboard
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </TooltipProvider>
                    </div>
                )}

                <div className="mb-8">
                    {!isEmployee ? (
                        <>
                            <div className="mb-4 pb-1">
                                <h3
                                    className={`text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${
                                        collapsed ? 'text-center' : 'px-2'
                                    }`}
                                >
                                    {collapsed ? 'Menu' : 'Platform'}
                                </h3>
                            </div>
                            <div className="space-y-1.5">
                                {navGroups.map((group) => (
                                    <SidebarGroup
                                        key={group.title}
                                        title={group.title}
                                        icon={group.icon}
                                        items={group.items}
                                        collapsed={collapsed}
                                        approvalCount={approvalCount}
                                        pendingTaskCount={pendingTaskCount}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1.5">
                            {employeeItems.map((item) => {
                                const isActive =
                                    typeof window !== 'undefined' &&
                                    (window.location.pathname === item.href || window.location.pathname.startsWith(`${item.href}/`))

                                const Icon = item.icon
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
                                            <Icon
                                                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                    !collapsed ? 'mr-3' : ''
                                                } ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-neutral-500 dark:text-neutral-400'}`}
                                                aria-hidden="true"
                                                strokeWidth={2}
                                            />
                                            {!collapsed && <span>{item.title}</span>}
                                            {isActive && (
                                                <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400"></div>
                                            )}
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {!isEmployee && (
                    <IntegrationNavigation collapsed={collapsed} isGitHubIntegrated={isGitHubIntegrated} isJiraIntegrated={isJiraIntegrated} />
                )}
            </div>

            <div className={`relative z-10 border-t border-neutral-200 pt-3 pb-4 dark:border-neutral-700 ${collapsed ? 'px-2' : 'px-4'}`}>
                <FooterNavigation collapsed={collapsed} />
                <UserSection collapsed={collapsed} user={auth.user} />
            </div>
        </div>
    )
}
