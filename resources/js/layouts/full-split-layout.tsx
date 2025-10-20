import { type PropsWithChildren } from 'react'

export default function FullSplitLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <main className="min-h-screen">{children}</main>
        </div>
    )
}
