import { MasterLayoutProps, Project } from '@/@types/layouts'
import CookieConsent from '@/components/cookie-consent'
import FloatingAiChat from '@/components/floating-ai-chat'
import { MasterContent } from '@/components/master-content'
import { MasterRightSidebar } from '@/components/master-right-sidebar'
import { MasterSidebar } from '@/components/master-sidebar'
import RealTimeNotification from '@/components/real-time-notification'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { TimeTrackerProvider } from '@/contexts/time-tracker-context'
import { projects } from '@actions/DashboardController'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

export default function MasterLayout({ children, breadcrumbs = [] }: MasterLayoutProps) {
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebar_collapsed')
            return savedState === 'true'
        }

        return false
    })

    const [userProjects, setUserProjects] = useState<Project[]>([])
    const [dataLoaded, setDataLoaded] = useState(false)
    const [pageLoaded, setPageLoaded] = useState(false)

    const fetchData = async (): Promise<void> => {
        try {
            const projectsResponse = await projects.data({})
            setUserProjects(projectsResponse.projects)
            setDataLoaded(true)
        } catch (error: unknown) {
            console.error('Failed to fetch data:', error)
        }
    }

    useEffect(() => {
        fetchData().then()
    }, [])

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(collapsed))
    }, [])

    useEffect(() => {
        setPageLoaded(true)
        return () => setPageLoaded(false)
    }, [])

    return (
        <NotificationsProvider>
            <div className="relative flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100/40 dark:from-gray-900 dark:via-gray-850 dark:to-indigo-950/30 print:bg-white">
                {/* Decorative background elements */}
                <div
                    className="absolute top-0 left-0 h-96 w-96 rounded-br-[20rem] bg-blue-500/10 dark:bg-blue-600/10"
                    aria-hidden="true"
                ></div>
                <div
                    className="absolute bottom-0 right-0 h-96 w-96 rounded-tl-[20rem] bg-indigo-500/10 dark:bg-indigo-600/10"
                    aria-hidden="true"
                ></div>
                <div
                    className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-blue-600/10"
                    aria-hidden="true"
                ></div>
                <div
                    className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-indigo-400/5 dark:bg-indigo-500/5"
                    aria-hidden="true"
                ></div>

                <div className="print:hidden relative z-10">
                    <MasterSidebar collapsed={collapsed} />
                </div>

                <TimeTrackerProvider>
                    <div className={`flex-1 transition-all duration-500 relative z-10 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <MasterContent breadcrumbs={breadcrumbs} collapsed={collapsed} setCollapsed={setCollapsed}>
                            {children}
                        </MasterContent>
                    </div>

                    <div className="print:hidden relative z-10">
                        <MasterRightSidebar collapsed={collapsed} />
                    </div>
                </TimeTrackerProvider>

                {dataLoaded && (
                    <>
                        <div className="print:hidden">
                            <FloatingAiChat projects={userProjects} />
                        </div>
                    </>
                )}

                <div className="print:hidden">
                    <Toaster
                        position="top-right"
                        closeButton={true}
                        toastOptions={{
                            className: 'shadow-lg rounded-xl border border-gray-200 dark:border-gray-700',
                            duration: 10000,
                        }}
                    />

                    <CookieConsent />
                    <RealTimeNotification />
                </div>
            </div>
        </NotificationsProvider>
    )
}
