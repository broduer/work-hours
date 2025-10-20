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

    // Get current date and greeting
    const today = new Date()
    const currentDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const getGreeting = () => {
        const hour = today.getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    const greeting = getGreeting()

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
        } else if (value && index === 3) {
            // Submit automatically when all digits are filled
            const allFilled = next.every(digit => digit !== '')
            if (allFilled) {
                setTimeout(() => {
                    const form = document.getElementById('pin-form') as HTMLFormElement | null
                    form?.requestSubmit()
                }, 300)
            }
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
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-3 overflow-hidden">
                {/* Left sidebar with user info */}
                <div className="relative flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 p-0 md:col-span-1 dark:from-gray-800 dark:to-gray-900">
                    {/* Decorative top corner accent */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-br-[5rem] dark:bg-blue-600/20" aria-hidden="true"></div>

                    <div className="px-8 py-12 relative z-10">
                        <div className="space-y-4 mb-12">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                {currentDate}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {greeting},
                            </h1>
                            <div className="flex items-center space-x-3 mt-1">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md dark:from-blue-600 dark:to-blue-800">
                                    <span className="text-lg font-bold text-white">{user.name.charAt(0)}</span>
                                </div>
                                <h2 className="text-2xl font-medium text-blue-600 dark:text-blue-400">
                                    {user.name}
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 pl-1">{user.email}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800/70 relative backdrop-blur-sm">
                            <div className="absolute -top-3 left-4 px-2 bg-white dark:bg-gray-800">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employer Information</h2>
                            </div>
                            <div className="mt-2">
                                {employer ? (
                                    <div className="space-y-3">
                                        <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">{employer.name}</p>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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

                        <div className="mt-8 bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-600 shadow-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
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

                    {/* Decorative bottom corner accent */}
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/10 rounded-tl-[5rem] dark:bg-blue-600/20" aria-hidden="true"></div>
                </div>

                {/* Right side with PIN input */}
                <div className="relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 md:col-span-2 dark:from-slate-900 dark:to-gray-900">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-bl-full dark:bg-blue-900/10" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/30 rounded-tr-full dark:bg-blue-900/10" aria-hidden="true"></div>
                    <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-blue-100/50 rounded-full dark:bg-blue-900/20" aria-hidden="true"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-blue-100/50 rounded-full dark:bg-blue-900/20" aria-hidden="true"></div>

                    <div className="w-full max-w-md px-6 py-12 relative z-10">
                        <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-gray-800 dark:border dark:border-gray-700 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                            <form id="pin-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-md dark:from-blue-600 dark:to-blue-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Time to Check In</h2>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                                        Enter your 4-digit PIN to start tracking your workday
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-center gap-3">
                                        {pin.map((value, i) => (
                                            <div key={i} className="relative group">
                                                <input
                                                    ref={el => inputRefs.current[i] = el}
                                                    id={`pin-${i}`}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    maxLength={1}
                                                    value={value}
                                                    onChange={(e) => handleChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                                    aria-label={`PIN digit ${i + 1}`}
                                                    className={`h-16 w-16 rounded-xl border-2 bg-white text-center text-2xl tracking-widest text-gray-900 shadow-sm transition-all duration-300 outline-none
                                                        ${value ? 'border-blue-500 dark:border-blue-600' : 'border-gray-300 dark:border-gray-700'}
                                                        focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50
                                                        dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-800/30
                                                        md:h-20 md:w-20 md:text-3xl group-hover:border-blue-400 dark:group-hover:border-blue-700`}
                                                />
                                                {/* Subtle animation when filled */}
                                                {value && (
                                                    <div className="absolute inset-0 rounded-xl bg-blue-500/10 pointer-events-none dark:bg-blue-600/20"
                                                         style={{animation: 'pulse 2s infinite'}}></div>
                                                )}
                                                {/* Better visual indicator for position */}
                                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${value || inputRefs.current[i] === document.activeElement ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-lg text-sm border border-red-100 dark:border-red-800/30 animate-fadeIn">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetPin}
                                            className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 text-center text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none
                                                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70
                                                hover:shadow-md active:scale-95"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="submit"
                                            className={`flex-[2] rounded-xl px-4 py-3.5 text-center text-white transition-all duration-300 focus:ring-4 focus:outline-none relative overflow-hidden shadow-lg
                                                ${!isPinComplete || isSubmitting
                                                    ? 'bg-blue-600/70 cursor-not-allowed dark:bg-blue-700/70'
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-800'
                                                } ${isSubmitting ? 'animate-pulse' : ''}
                                                active:scale-97.5 hover:shadow-xl`}
                                            disabled={!isPinComplete || isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Checking in...
                                                </span>
                                            ) : 'Check in'}

                                            {/* Add ripple effect to button when active */}
                                            {isPinComplete && !isSubmitting && (
                                                <span className="absolute inset-0 h-full w-full bg-white/30 scale-0 rounded-lg transition-transform duration-300 ease-out group-active:scale-100"></span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 space-y-1">
                                    <p>Need help? Contact your administrator</p>
                                    <p>Last successful check-in: October 19, 2025 at 8:45 AM</p>
                                </div>
                            </form>
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                &copy; {new Date().getFullYear()} Work Hours. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FullSplitLayout>
    )
}
