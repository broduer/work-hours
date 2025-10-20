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
            <div className="min-h-screen flex flex-row justify-center overflow-hidden">
                {/* Left sidebar with user info */}
                <div className="relative flex flex-col justify-center bg-white p-0 md:col-span-1 dark:bg-gray-800 w-1/3">
                    {/* Decorative top corner accent */}
                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-600/10 rounded-br-3xl dark:bg-blue-600/20" aria-hidden="true"></div>

                    <div className="px-8 py-12 relative z-10">
                        <div className="space-y-2 mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Welcome back
                            </h1>
                            <div className="flex items-center space-x-3 mt-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-medium text-blue-600 dark:text-blue-400">
                                    {user.name}
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 pl-1">{user.email}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 relative">
                            <div className="absolute -top-3 left-4 px-2 bg-white dark:bg-gray-800">
                                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employer Information</h2>
                            </div>
                            <div className="mt-2">
                                {employer ? (
                                    <div className="space-y-1">
                                        <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">{employer.name}</p>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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

                        <div className="mt-8 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-600">
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
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/10 rounded-tl-3xl dark:bg-blue-600/20" aria-hidden="true"></div>
                </div>

                {/* Right side with PIN input */}
                <div className="relative flex items-center justify-center bg-slate-50 md:col-span-2 dark:bg-slate-900">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-bl-full dark:bg-blue-900/10" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-tr-full dark:bg-blue-900/10" aria-hidden="true"></div>

                    <div className="w-full max-w-md px-6 py-12 relative z-10">
                        <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800 dark:border dark:border-gray-700">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 dark:bg-blue-900/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Check In</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Enter your 4-digit PIN to start your workday</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-center gap-3">
                                        {pin.map((value, i) => (
                                            <div key={i} className="relative">
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
                                                    className={`h-16 w-16 rounded-xl border-2 bg-white text-center text-2xl tracking-widest text-gray-900 shadow-sm transition-all duration-200 outline-none
                                                        ${value ? 'border-blue-500 dark:border-blue-600' : 'border-gray-300 dark:border-gray-700'}
                                                        focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50
                                                        dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-800/30`}
                                                />
                                                {/* Subtle animation when filled */}
                                                {value && (
                                                    <div className="absolute inset-0 rounded-xl bg-blue-500/10 pointer-events-none dark:bg-blue-600/20"
                                                         style={{animation: 'pulse 2s infinite'}}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-lg text-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-2">
                                        <button
                                            type="button"
                                            onClick={resetPin}
                                            className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-center text-gray-700 transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none
                                                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="submit"
                                            className={`flex-[2] rounded-lg px-4 py-3 text-center text-white transition focus:ring-4 focus:outline-none relative overflow-hidden
                                                ${!isPinComplete || isSubmitting
                                                    ? 'bg-blue-600/70 cursor-not-allowed dark:bg-blue-700/70'
                                                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                                                } ${isSubmitting ? 'animate-pulse' : ''}`}
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

                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                                    <p>Need help? Contact your administrator</p>
                                </div>
                            </form>
                        </div>

                        <div className="text-center mt-6">
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
