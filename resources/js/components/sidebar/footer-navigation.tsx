import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type NavItem } from '@/types'
import { Folder } from 'lucide-react'

interface FooterNavigationProps {
    collapsed: boolean
}

const footerNavItems: NavItem[] = [
    {
        title: 'Feedback & Issues',
        href: 'https://github.com/msamgan/work-hours/issues',
        icon: Folder,
    },
]

export function FooterNavigation({ collapsed }: FooterNavigationProps) {
    return (
        <div className="mb-4">
            <h3
                className={`mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${collapsed ? 'text-center' : 'px-2'}`}
            >
                Links
            </h3>
            <TooltipProvider delayDuration={300}>
                <nav className="relative z-10 space-y-1.5">
                    {footerNavItems.map((item) => (
                        <div key={item.href} className="relative">
                            <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50/90 hover:text-neutral-900 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-800/90 dark:hover:text-neutral-100"
                            >
                                {item.icon && (
                                    <item.icon
                                        className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                            !collapsed ? 'mr-3' : ''
                                        } text-neutral-500 dark:text-neutral-400`}
                                        aria-hidden="true"
                                        strokeWidth={2}
                                    />
                                )}
                                {!collapsed && <span>{item.title}</span>}
                            </a>
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
                    ))}
                </nav>
            </TooltipProvider>
        </div>
    )
}
