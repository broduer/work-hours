import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import FullSplitLayout from '@/layouts/full-split-layout'
import type { User } from '@/types'
import { Head, router } from '@inertiajs/react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { KeyboardEvent, useEffect, useRef, useState, type FormEvent } from 'react'
import AppLogoIcon from '@/components/app-logo-icon'

interface TodayEntry {
    type: 'clockin' | 'breaks'
    start_time: string
    end_time?: string | null
    duration_seconds: number
}

interface CheckInProps {
    user: User
    employer: User | null
    checkedInAt?: string | null
    breakStartedAt?: string | null
    totalWorkedSecondsToday?: number
    totalBreakSecondsToday?: number
    entriesToday?: TodayEntry[]
}

export default function CheckIn({
    user,
    employer,
    checkedInAt,
    breakStartedAt,
    totalWorkedSecondsToday = 0,
    totalBreakSecondsToday = 0,
    entriesToday = [],
}: CheckInProps) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [startedAt, setStartedAt] = useState<Date | null>(checkedInAt ? new Date(checkedInAt) : null)
    const [elapsed, setElapsed] = useState<number>(0)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isOnBreak, setIsOnBreak] = useState<boolean>(!!breakStartedAt)
    const [breakAt, setBreakAt] = useState<Date | null>(breakStartedAt ? new Date(breakStartedAt) : null)
    const [elapsedBreak, setElapsedBreak] = useState<number>(0)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [detailsOpen, setDetailsOpen] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
    const today = new Date()
    const currentDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const getGreeting = () => {
        const hour = today.getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    const greeting = getGreeting()
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        if (!startedAt || isOnBreak) return
        const tick = () => {
            const seconds = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000))
            setElapsed(seconds)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [startedAt, isOnBreak])

    useEffect(() => {
        if (!breakAt) return
        const tick = () => {
            const seconds = Math.max(0, Math.floor((Date.now() - breakAt.getTime()) / 1000))
            setElapsedBreak(seconds)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [breakAt])

    const formatElapsed = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    }

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return
        setError('')

        const next = [...pin]
        next[index] = value
        setPin(next)
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowRight' && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const resetPin = () => {
        setPin(['', '', '', ''])
        setError('')
        inputRefs.current[0]?.focus()
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const code = pin.join('')

        if (code.length !== 4) {
            setError('Please enter all 4 digits')
            return
        }

        setIsSubmitting(true)

        router.post(
            route('checkin.store'),
            { pin: code },
            {
                onError: (errors: Record<string, string>) => {
                    const message = errors?.pin || 'Invalid PIN. Please try again.'
                    setError(message)
                    setIsSubmitting(false)
                    resetPin()
                },
                onSuccess: () => {
                    setStartedAt(new Date())
                },
                onFinish: () => {
                    setIsSubmitting(false)
                },
            },
        )
    }

    const isPinComplete = pin.every((digit) => digit !== '')
    const workedSecondsNow = totalWorkedSecondsToday
    const breakSecondsNow = totalBreakSecondsToday

    const formatHours = (totalSeconds: number) => {
        const hours = totalSeconds / 3600
        const display = hours > 0 && hours < 0.01 ? 0.01 : hours
        return `${display.toFixed(2)} h`
    }
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    return (
        <FullSplitLayout>
            <Head title="Employee Check-in" />
            <>
                <div className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 shadow-lg backdrop-blur-sm dark:from-blue-900/90 dark:to-indigo-900/90">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-white/90 p-1.5 dark:bg-gray-800/90">
                              <AppLogoIcon className={"h-4 w-4 text-blue-600 dark:text-blue-400"} />
                            </div>
                            <h1 className="text-lg font-semibold text-white">Work Hours</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden text-sm text-white/90 md:block">{currentDate}</div>
                            <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                                {formatTime(currentTime)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-screen items-center justify-center pt-16">
                    <div className="mx-auto my-8 grid w-full max-w-7xl grid-cols-1 overflow-hidden rounded-3xl shadow-2xl md:grid-cols-2">
                        <div className="relative flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 p-8 dark:from-gray-800 dark:to-gray-900">
                            <div
                                className="absolute top-0 left-0 h-40 w-40 rounded-br-[6rem] bg-blue-600/10 dark:bg-blue-600/20"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-500/5 dark:bg-blue-600/5"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute top-1/4 right-12 h-24 w-24 rounded-full bg-blue-500/10 dark:bg-blue-600/10"
                                aria-hidden="true"
                            ></div>

                            <div className="relative z-10">
                                <div className="mb-8 space-y-4">
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{greeting},</h1>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 dark:from-blue-600 dark:to-blue-800 dark:shadow-blue-800/10">
                                            <span className="text-xl font-bold text-white">
                                                {user.name.charAt(0)}
                                                {user.name.split(' ')[1]?.[0] || ''}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{user.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/70">
                                    <div className="absolute -top-3 left-4 rounded-md bg-white px-2 py-0.5 dark:bg-gray-800">
                                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employer Information</h2>
                                    </div>
                                    <div className="mt-2">
                                        {employer ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{employer.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2 border-t pt-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                    {employer.email}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-400"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <p>No employer information found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {startedAt && (
                                    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800/70">
                                        <div className="flex items-center justify-between bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                                            <h3 className="font-medium text-blue-700 dark:text-blue-300">Today's Work Status</h3>
                                            <button
                                                type="button"
                                                onClick={() => setDetailsOpen(true)}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600"
                                            >
                                                <span>Details</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                                                    <path d="m9 18 6-6-6-6"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="rounded-lg bg-blue-50/80 p-3 dark:bg-blue-900/20">
                                                    <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Work Time</div>
                                                    <div className="mt-1 font-mono text-xl font-semibold text-blue-800 dark:text-blue-200">
                                                        {formatHours(workedSecondsNow)}
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-amber-50/80 p-3 dark:bg-amber-900/20">
                                                    <div className="text-xs font-medium text-amber-700 dark:text-amber-300">Break Time</div>
                                                    <div className="mt-1 font-mono text-xl font-semibold text-amber-800 dark:text-amber-200">
                                                        {formatHours(breakSecondsNow)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div
                                className="absolute right-0 bottom-0 h-40 w-40 rounded-tl-[5rem] bg-blue-600/10 dark:bg-blue-600/20"
                                aria-hidden="true"
                            ></div>
                        </div>

                        <div className="absolute top-[10%] left-1/2 hidden h-[80%] w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent md:block dark:via-gray-700"></div>

                        <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 dark:from-slate-900 dark:to-gray-900">
                            <div
                                className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-blue-100/30 dark:bg-blue-900/10"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-blue-100/30 dark:bg-blue-900/10"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute top-1/3 left-8 h-16 w-16 rounded-full bg-blue-100/50 dark:bg-blue-900/20"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute right-10 bottom-1/4 h-20 w-20 rounded-full bg-blue-100/40 dark:bg-blue-900/15"
                                aria-hidden="true"
                            ></div>

                            <div className="relative z-10 w-full max-w-md">
                                {startedAt && (
                                    <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl dark:border dark:border-gray-700 dark:bg-gray-800">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center text-white dark:from-blue-700 dark:to-blue-800">
                                            <p className="text-sm font-medium text-blue-100">
                                                {isOnBreak ? 'Checked in (paused)' : 'Active Session'}
                                            </p>
                                            <p className="mt-1 font-mono text-4xl font-bold tracking-tight tabular-nums">{formatElapsed(elapsed)}</p>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-center">
                                                <div className="inline-flex rounded-lg bg-blue-50 p-1 dark:bg-blue-900/30">
                                                    <div className="rounded-md px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                                                        Started at: {startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isOnBreak && (
                                    <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl dark:border dark:border-gray-700 dark:bg-gray-800">
                                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-center text-white dark:from-amber-700 dark:to-amber-800">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <p className="text-sm font-medium">Break in Progress</p>
                                            </div>
                                            <p className="mt-1 font-mono text-4xl font-bold tracking-tight tabular-nums">
                                                {formatElapsed(elapsedBreak)}
                                            </p>
                                        </div>
                                        <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            Your work timer is currently paused
                                        </div>
                                    </div>
                                )}

                                {startedAt ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {!isOnBreak ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        route('checkin.break'),
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                setIsOnBreak(true)
                                                                setBreakAt(new Date())
                                                                setElapsedBreak(0)
                                                            },
                                                        },
                                                    )
                                                }
                                                className="group flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left shadow-sm transition hover:bg-amber-100 hover:shadow-md dark:border-amber-900/40 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 cursor-pointer"
                                            >
                                                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-2xl text-white shadow-md transition-transform group-hover:scale-110 dark:from-amber-600 dark:to-amber-700">
                                                    ☕
                                                </span>
                                                <div className="mt-4 text-center">
                                                    <div className="text-lg font-semibold text-amber-800 dark:text-amber-300">Take a break</div>
                                                    <div className="text-sm text-amber-700/80 dark:text-amber-400/80">Pause your work timer</div>
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        route('checkin.break.end'),
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => {
                                                                setIsOnBreak(false)
                                                                setBreakAt(null)
                                                                setElapsedBreak(0)
                                                            },
                                                        },
                                                    )
                                                }
                                                className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left shadow-sm transition hover:bg-emerald-100 hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 cursor-pointer"
                                            >
                                                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl text-white shadow-md transition-transform group-hover:scale-110 dark:from-emerald-600 dark:to-emerald-700">
                                                    ▶
                                                </span>
                                                <div className="mt-4 text-center">
                                                    <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Back to work</div>
                                                    <div className="text-sm text-emerald-700/80 dark:text-emerald-400/80">Resume your shift</div>
                                                </div>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setConfirmOpen(true)}
                                            className="group flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-left shadow-sm transition hover:bg-red-100 hover:shadow-md dark:border-red-900/40 dark:bg-red-900/20 dark:hover:bg-red-900/30 cursor-pointer"
                                        >
                                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-2xl text-white shadow-md transition-transform group-hover:scale-110 dark:from-red-600 dark:to-red-700">
                                                ⏻
                                            </span>
                                            <div className="mt-4 text-center">
                                                <div className="text-lg font-semibold text-red-800 dark:text-red-300">Check out</div>
                                                <div className="text-sm text-red-700/80 dark:text-red-400/80">Finish your workday</div>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative mb-3 overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 hover:shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-800">
                                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500"></div>

                                        <form id="pin-form" onSubmit={handleSubmit} className="space-y-8 p-8">
                                            <div className="text-center">
                                                <div className="relative mb-6 inline-flex h-24 w-24 items-center justify-center">
                                                    <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
                                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 dark:from-blue-600 dark:to-blue-800 dark:shadow-blue-800/20">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-10 w-10 text-white"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Time to Check In</h2>
                                                <p className="mx-auto max-w-xs text-gray-600 dark:text-gray-400">
                                                    Enter your 4-digit PIN to start tracking your workday
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex justify-center gap-3">
                                                    {pin.map((value, i) => (
                                                        <div key={i} className="group relative">
                                                            <input
                                                                ref={(el) => (inputRefs.current[i] = el)}
                                                                id={`pin-${i}`}
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={1}
                                                                value={value}
                                                                onChange={(e) => handleChange(i, e.target.value)}
                                                                onKeyDown={(e) => handleKeyDown(i, e)}
                                                                aria-label={`PIN digit ${i + 1}`}
                                                                disabled={!!startedAt || isSubmitting}
                                                                className={`h-16 w-16 rounded-xl border-2 bg-white text-center text-2xl tracking-widest text-gray-900 shadow-sm transition-all duration-300 outline-none ${value ? 'border-blue-500 dark:border-blue-600' : 'border-gray-300 dark:border-gray-700'} group-hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 disabled:opacity-50 md:h-20 md:w-20 md:text-3xl dark:bg-gray-800 dark:text-gray-100 dark:group-hover:border-blue-700 dark:focus:ring-blue-800/30`}
                                                            />
                                                            {value && (
                                                                <div
                                                                    className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/10 dark:bg-blue-600/20"
                                                                    style={{ animation: 'pulse 2s infinite' }}
                                                                ></div>
                                                            )}
                                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 transform">
                                                                <div
                                                                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${value || inputRefs.current[i] === document.activeElement ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {error && (
                                                    <div className="animate-fadeIn rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            {error}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={resetPin}
                                                        className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-center text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-gray-200 focus:outline-none active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70 cursor-pointer"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className={`group relative flex-[2] overflow-hidden rounded-xl px-4 py-3.5 text-center text-white shadow-lg transition-all duration-300 focus:ring-4 focus:outline-none ${
                                                            !isPinComplete || isSubmitting
                                                                ? 'cursor-not-allowed bg-blue-600/70 dark:bg-blue-700/70'
                                                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-800 cursor-pointer'
                                                        } ${isSubmitting ? 'animate-pulse' : ''} active:scale-97.5 hover:shadow-xl`}
                                                        disabled={!isPinComplete || isSubmitting || !!startedAt}
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <svg
                                                                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Checking in...
                                                            </span>
                                                        ) : (
                                                            'Check in'
                                                        )}

                                                        {isPinComplete && !isSubmitting && (
                                                            <span className="absolute inset-0 h-full w-full scale-0 rounded-lg bg-white/30 transition-transform duration-300 ease-out group-active:scale-100"></span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>

                                        <div className="border-t border-gray-100 bg-gray-50/80 px-8 py-4 text-center dark:border-gray-800 dark:bg-gray-800/50">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="font-medium">{currentDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Need help? Contact your administrator</p>
                                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                                        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent className="dark:border-gray-700 dark:bg-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold dark:text-gray-100">Check out?</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-300">
                                This will end your current check-in. Any active break will be closed as well. Do you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                onClick={() => {
                                    setConfirmOpen(false)
                                    router.post(
                                        route('checkin.checkout'),
                                        {},
                                        {
                                            onSuccess: () => {
                                                setStartedAt(null)
                                                setIsOnBreak(false)
                                                setBreakAt(null)
                                                setElapsedBreak(0)
                                            },
                                        },
                                    )
                                }}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <SheetContent side="right" className="overflow-y-auto bg-white shadow-xl pr-6 pb-8 pl-6 sm:max-w-md md:max-w-lg dark:bg-gray-900">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                    <path d="M12 20h9"/>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                </svg>
                                Today's Details
                            </SheetTitle>
                            <SheetDescription className="text-sm text-gray-500 dark:text-gray-400">
                                All clock-ins and breaks recorded today
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-4">
                            {entriesToday.length === 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                            <line x1="16" x2="16" y1="2" y2="6"/>
                                            <line x1="8" x2="8" y1="2" y2="6"/>
                                            <line x1="3" x2="21" y1="10" y2="10"/>
                                        </svg>
                                    </div>
                                    <p className="font-medium">No entries for today yet.</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your work sessions will appear here once you begin.</p>
                                </div>
                            )}

                            {entriesToday.length > 0 && (
                                <div className="mb-4 flex justify-between items-center">
                                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Activity Timeline</h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                        {new Date().toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {entriesToday.map((entry, idx) => {
                                    const label = entry.type === 'clockin' ? 'Work session' : 'Break';
                                    const start = entry.start_time?.slice(0, 5);
                                    const end = entry.end_time ? entry.end_time.slice(0, 5) : 'ongoing';
                                    const isOngoing = !entry.end_time;
                                    const iconColor = entry.type === 'clockin' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500 dark:text-amber-400';
                                    const bgColor = entry.type === 'clockin'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'
                                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30';

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative flex items-start rounded-lg border p-4 transition-all duration-200 ${bgColor} ${isOngoing ? 'shadow-md' : 'shadow-sm'}`}
                                        >
                                            <div className="mr-4 flex-shrink-0">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800 ${isOngoing ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-900' : ''}`}>
                                                    {entry.type === 'clockin' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColor}>
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <polyline points="12 6 12 12 16 14"/>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColor}>
                                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                                            <line x1="6" y1="1" x2="6" y2="4"/>
                                                            <line x1="10" y1="1" x2="10" y2="4"/>
                                                            <line x1="14" y1="1" x2="14" y2="4"/>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {label}
                                                        {isOngoing && <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Active</span>}
                                                    </h4>
                                                    <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-200">
                                                        {formatElapsed((() => {
                                                            const isOngoing = !entry.end_time;
                                                            if (isOngoing) {
                                                                if (entry.type === 'clockin' && startedAt && !isOnBreak) {
                                                                    return elapsed;
                                                                }
                                                                if (entry.type === 'breaks' && breakAt && isOnBreak) {
                                                                    return elapsedBreak;
                                                                }
                                                            }
                                                            return entry.duration_seconds;
                                                        })())}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-medium">{start}</span>
                                                    <span className="mx-1">—</span>
                                                    <span className={isOngoing ? "font-semibold text-blue-600 dark:text-blue-400" : ""}>
                                                        {end}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {entriesToday.length > 0 && (
                                <div className="mt-8 rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total Work</div>
                                            <div className="mt-1 font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{formatHours(workedSecondsNow)}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total Breaks</div>
                                            <div className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{formatHours(breakSecondsNow)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        </FullSplitLayout>
    )
}
