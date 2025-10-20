import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import { Github } from 'lucide-react'
import JiraIcon from '../icons/jira-icon'

interface IntegrationNavigationProps {
    collapsed: boolean
    isGitHubIntegrated: boolean | null | undefined | unknown
    isJiraIntegrated: boolean | null | undefined | unknown
}

const integrationNavItems: NavItem[] = [
    {
        title: 'GitHub',
        href: '/github/repositories',
        icon: Github,
    },
    {
        title: 'Jira',
        href: '/jira/projects',
        icon: JiraIcon,
    },
]

export function IntegrationNavigation({ collapsed, isGitHubIntegrated, isJiraIntegrated }: IntegrationNavigationProps) {
    const showIntegrationNav = isGitHubIntegrated || isJiraIntegrated

    if (!showIntegrationNav) {
        return null
    }

    return (
        <div className="mb-8">
            <div className="mb-4 border-b border-neutral-200 pb-1 dark:border-neutral-700">
                <h3
                    className={`text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${collapsed ? 'text-center' : 'px-2'}`}
                >
                    {collapsed ? 'Int.' : 'Integration'}
                </h3>
            </div>
            <TooltipProvider delayDuration={300}>
                <nav className="relative z-10 space-y-1.5">
                    {integrationNavItems
                        .filter((item) => (item.title === 'GitHub' && isGitHubIntegrated) || (item.title === 'Jira' && isJiraIntegrated))
                        .map((item) => {
                            const isActive =
                                typeof window !== 'undefined' &&
                                (window.location.pathname === item.href || window.location.pathname.startsWith(`${item.href}/`))
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
                                        {isActive && <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-blue-600 dark:bg-blue-400"></div>}
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
    )
}
