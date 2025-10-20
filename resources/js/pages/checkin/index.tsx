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
import { KeyboardEvent, useEffect, useRef, useState, type FormEvent } from 'react'

interface CheckInProps {
    user: User
    employer: User | null
    checkedInAt?: string | null
    breakStartedAt?: string | null
    totalWorkedSecondsToday?: number
    totalBreakSecondsToday?: number
}

export default function CheckIn({
    user,
    employer,
    checkedInAt,
    breakStartedAt,
    totalWorkedSecondsToday = 0,
    totalBreakSecondsToday = 0,
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
    // Use server-provided totals directly to avoid double counting running timers
    const workedSecondsNow = totalWorkedSecondsToday
    const breakSecondsNow = totalBreakSecondsToday

    const formatHours = (totalSeconds: number) => {
        const hours = totalSeconds / 3600
        const display = hours > 0 && hours < 0.01 ? 0.01 : hours
        return `${display.toFixed(2)} h`
    }

    return (
        <FullSplitLayout>
            <Head title="Employee Check-in" />
            <>
                <div className="absolute top-0 right-0 left-0 z-20 mt-6 flex justify-center">
                    <div className="rounded-full border border-gray-200 bg-white px-4 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{currentDate}</span>
                    </div>
                </div>

                <div className="flex min-h-screen items-center justify-center">
                    <div className="mx-auto my-12 grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">
                        <div className="relative flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 p-8 dark:from-gray-800 dark:to-gray-900">
                            <div
                                className="absolute top-0 left-0 h-32 w-32 rounded-br-[5rem] bg-blue-600/10 dark:bg-blue-600/20"
                                aria-hidden="true"
                            ></div>

                            <div className="relative z-10">
                                <div className="mb-12 space-y-4">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{greeting},</h1>
                                    <div className="mt-1 flex items-center space-x-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md dark:from-blue-600 dark:to-blue-800">
                                            <span className="text-lg font-bold text-white">{user.name.charAt(0)}</span>
                                        </div>
                                        <h2 className="text-2xl font-medium text-blue-600 dark:text-blue-400">{user.name}</h2>
                                    </div>
                                    <p className="pl-1 text-gray-600 dark:text-gray-300">{user.email}</p>
                                </div>

                                <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70">
                                    <div className="absolute -top-3 left-4 bg-white px-2 dark:bg-gray-800">
                                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employer Information</h2>
                                    </div>
                                    <div className="mt-2">
                                        {employer ? (
                                            <div className="space-y-3">
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{employer.name}</p>
                                                <div className="flex items-center border-t pt-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="mr-1 h-4 w-4"
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
                                            <p className="text-gray-600 dark:text-gray-300">No employer information found.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 shadow-sm dark:border-blue-600 dark:bg-blue-900/20">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                                Enter your 4-digit PIN to check in for work. Your PIN is private and should not be shared with others.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="absolute right-0 bottom-0 h-40 w-40 rounded-tl-[5rem] bg-blue-600/10 dark:bg-blue-600/20"
                                aria-hidden="true"
                            ></div>
                        </div>

                        <div className="absolute top-[10%] left-1/2 hidden h-[80%] w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent md:block dark:via-gray-700"></div>

                        <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-8 dark:from-slate-900 dark:to-gray-900">
                            <div
                                className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-blue-100/30 dark:bg-blue-900/10"
                                aria-hidden="true"
                            ></div>
                            <div
                                className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-full bg-blue-100/30 dark:bg-blue-900/10"
                                aria-hidden="true"
                            ></div>

                            <div className="relative z-10 w-full max-w-md">
                                {startedAt && (
                                    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-center shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            {isOnBreak ? 'Checked in (paused)' : 'Checked in'}
                                        </p>
                                        <p className="mt-1 font-mono text-3xl text-blue-700 tabular-nums dark:text-blue-200">
                                            {formatElapsed(elapsed)}
                                        </p>
                                    </div>
                                )}

                                {isOnBreak && (
                                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">On break</p>
                                        <p className="mt-1 font-mono text-3xl text-amber-700 tabular-nums dark:text-amber-200">
                                            {formatElapsed(elapsedBreak)}
                                        </p>
                                    </div>
                                )}

                                {startedAt && (
                                    <div className="mb-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                                                <span className="font-medium">Worked today</span>
                                            </div>
                                            <div className="font-mono text-gray-900 tabular-nums dark:text-gray-100">
                                                {formatHours(workedSecondsNow)}
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                                                <span className="font-medium">Breaks today</span>
                                            </div>
                                            <div className="font-mono text-gray-900 tabular-nums dark:text-gray-100">
                                                {formatHours(breakSecondsNow)}
                                            </div>
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
                                                className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left shadow transition hover:shadow-md dark:border-amber-900/40 dark:bg-amber-900/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                                                        ☕
                                                    </span>
                                                    <div>
                                                        <div className="text-lg font-semibold text-amber-800 dark:text-amber-300">Take a break</div>
                                                        <div className="text-sm text-amber-700/80 dark:text-amber-400/80">
                                                            Start a break. You can check out later.
                                                        </div>
                                                    </div>
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
                                                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left shadow transition hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-900/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                        ▶
                                                    </span>
                                                    <div>
                                                        <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                                                            Back to work
                                                        </div>
                                                        <div className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Resume your shift. Break will be recorded.
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setConfirmOpen(true)}
                                            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-left shadow transition hover:shadow-md dark:border-red-900/40 dark:bg-red-900/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                                                    ⏻
                                                </span>
                                                <div>
                                                    <div className="text-lg font-semibold text-red-800 dark:text-red-300">Check out</div>
                                                    <div className="text-sm text-red-700/80 dark:text-red-400/80">
                                                        Finish your shift and stop the timer.
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-3 rounded-2xl bg-white p-8 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-800">
                                        <form id="pin-form" onSubmit={handleSubmit} className="space-y-8">
                                            <div className="text-center">
                                                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md dark:from-blue-600 dark:to-blue-800">
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
                                                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">Time to Check In</h2>
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
                                                        className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-center text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-gray-200 focus:outline-none active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className={`relative flex-[2] overflow-hidden rounded-xl px-4 py-3.5 text-center text-white shadow-lg transition-all duration-300 focus:ring-4 focus:outline-none ${
                                                            !isPinComplete || isSubmitting
                                                                ? 'cursor-not-allowed bg-blue-600/70 dark:bg-blue-700/70'
                                                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-800'
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

                                            <div className="space-y-1 pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                                <p>Need help? Contact your administrator</p>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="absolute bottom-6 w-full text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Check out?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will end your current check-in. Any active break will be closed as well. Do you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
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
            </>
        </FullSplitLayout>
    )
}
