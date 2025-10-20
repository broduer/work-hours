import DailyTrendSection from '@/components/dashboard/DailyTrendSection'
import HoursDistribution from '@/components/dashboard/HoursDistribution'
import RecentTimeLogs from '@/components/dashboard/RecentTimeLogs'
import StatsCards from '@/components/dashboard/StatsCards'
import WelcomeSection from '@/components/dashboard/WelcomeSection'
import Loader from '@/components/ui/loader'
import MasterLayout from '@/layouts/master-layout'
import { roundToTwoDecimals } from '@/lib/utils'
import { type BreadcrumbItem } from '@/types'
import { stats } from '@actions/DashboardController'
import { Head } from '@inertiajs/react'
import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TeamStats {
    count: number
    totalHours: number
    unpaidHours: number
    unpaidAmount: number
    unpaidAmountsByCurrency: Record<string, number>
    paidAmount: number
    paidAmountsByCurrency: Record<string, number>
    currency: string
    weeklyAverage: number
    clientCount: number
    dailyTrend: Array<{ date: string; userHours: number; teamHours: number }>
    unbillableHours?: number
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
]

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [teamStats, setTeamStats] = useState<TeamStats>({
        count: 0,
        totalHours: 0,
        unpaidHours: 0,
        unpaidAmount: 0,
        unpaidAmountsByCurrency: {},
        paidAmount: 0,
        paidAmountsByCurrency: {},
        currency: 'USD',
        weeklyAverage: 0,
        clientCount: 0,
        dailyTrend: [],
    })

    const getStats = async (): Promise<void> => {
        try {
            setLoading(true)
            const response = await stats.data({})
            setTeamStats(response)
        } catch (error: unknown) {
            console.error('Failed to fetch team stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getStats().then()
    }, [])

    const hoursData = [
        { name: 'Unpaid', value: roundToTwoDecimals(teamStats.unpaidHours) },
        { name: 'Paid', value: roundToTwoDecimals(teamStats.totalHours - teamStats.unpaidHours) },
    ]

    return (
        <MasterLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative mx-auto flex flex-col gap-6">
                <div className="dark:to-gray-750 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-md dark:from-gray-800">
                    <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-500/5 dark:bg-blue-600/5" aria-hidden="true"></div>
                    <div className="absolute top-1/4 right-12 h-24 w-24 rounded-full bg-blue-500/10 dark:bg-blue-600/10" aria-hidden="true"></div>
                    <div className="relative z-10">
                        <WelcomeSection />
                    </div>
                </div>

                {loading ? (
                    <div className="relative rounded-xl bg-white p-8 shadow-md transition-all dark:bg-gray-800">
                        <Loader message="Loading dashboard data..." className="h-40" />
                    </div>
                ) : (
                    <>
                        <StatsCards teamStats={teamStats} />

                        <DailyTrendSection />

                        <section className="">
                            <div className="mb-3">
                                <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center">
                                        <Clock className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <HoursDistribution hoursData={hoursData} />
                                <RecentTimeLogs />
                            </div>
                        </section>
                    </>
                )}
            </div>
        </MasterLayout>
    )
}
