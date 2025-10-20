import FullSplitLayout from '@/layouts/full-split-layout'
import { Head, router } from '@inertiajs/react'
import { useState, type FormEvent } from 'react'

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

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return
        const next = [...pin]
        next[index] = value
        setPin(next)
        const nextIndex = value && index < 3 ? index + 1 : null
        if (nextIndex !== null) {
            const el = document.getElementById(`pin-${nextIndex}`) as HTMLInputElement | null
            el?.focus()
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const code = pin.join('')
        router.post(route('checkin.store'), { pin: code })
    }

    return (
        <FullSplitLayout>
            <Head title="Employee Check-in" />
            <div className="grid min-h-screen grid-cols-1 md:grid-cols-3">
                <div className="flex flex-col justify-center gap-6 bg-white p-8 md:col-span-1 dark:bg-gray-800">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Hello, {user.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Employer</h2>
                        {employer ? (
                            <div>
                                <p className="text-gray-800 dark:text-gray-200">{employer.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{employer.email}</p>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No employer information found.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center bg-slate-50 p-8 md:col-span-2 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <h2 className="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">Enter 4-digit PIN</h2>
                        <div className="mb-6 flex justify-center gap-4">
                            {pin.map((value, i) => (
                                <input
                                    key={i}
                                    id={`pin-${i}`}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    className="h-14 w-14 rounded-lg border border-gray-300 bg-white text-center text-2xl tracking-widest text-gray-900 ring-2 ring-transparent transition outline-none focus:border-blue-500 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50"
                            disabled={pin.some((d) => d === '')}
                        >
                            Check in
                        </button>
                    </form>
                </div>
            </div>
        </FullSplitLayout>
    )
}
