import FullSplitLayout from '@/layouts/full-split-layout'
import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useRef, type FormEvent, KeyboardEvent } from 'react'

interface UserInfo {
    id: number
    name: string
    email: string
}

interface CheckInProps {
    user: UserInfo
    employer: UserInfo | null
}

export default function CheckIn({ user, employer }: CheckInProps) {
    const [pin, setPin] = useState(['', '', '', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return
        setError('')

        const next = [...pin]
        next[index] = value
        setPin(next)

        // Auto advance to next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }

        // Handle left/right arrows for navigation
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

        router.post(route('checkin.store'), { pin: code }, {
            onError: () => {
                setError('Invalid PIN. Please try again.')
                setIsSubmitting(false)
                resetPin()
            },
            onFinish: () => {
                setIsSubmitting(false)
            }
        })
    }

    const isPinComplete = pin.every(digit => digit !== '')

    return (
        <FullSplitLayout>
            <Head title="Employee Check-in" />
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-3">
                {/* Left sidebar with user info */}
                <div className="flex flex-col justify-center gap-6 bg-white p-8 md:col-span-1 dark:bg-gray-800">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Welcome back
                        </h1>
                        <h2 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                            {user.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
                        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">Employer</h2>
                        {employer ? (
                            <div className="space-y-1">
                                <p className="text-gray-800 dark:text-gray-200 font-medium">{employer.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{employer.email}</p>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No employer information found.</p>
                        )}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        <p>Enter your 4-digit PIN to check in.</p>
                    </div>
                </div>

                {/* Right side with PIN input */}
                <div className="flex items-center justify-center bg-slate-50 p-8 md:col-span-2 dark:bg-slate-900">
                    <div className="w-full max-w-md">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Check In</h2>
                                <p className="text-gray-600 dark:text-gray-400">Enter your 4-digit PIN to start your workday</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-4">
                                    {pin.map((value, i) => (
                                        <input
                                            key={i}
                                            ref={el => inputRefs.current[i] = el}
                                            id={`pin-${i}`}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={value}
                                            onChange={(e) => handleChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            aria-label={`PIN digit ${i + 1}`}
                                            className="h-16 w-16 rounded-lg border border-gray-300 bg-white text-center text-2xl tracking-widest text-gray-900 shadow-sm transition-all duration-200 outline-none
                                                focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50
                                                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-800/30"
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="text-center text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={resetPin}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-gray-700 transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none
                                            dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] rounded-lg bg-blue-600 px-4 py-3 text-center text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 dark:focus:ring-blue-800"
                                        disabled={!isPinComplete || isSubmitting}
                                    >
                                        {isSubmitting ? 'Checking in...' : 'Check in'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </FullSplitLayout>
    )
}
