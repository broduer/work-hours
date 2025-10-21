import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTimeTracker } from '@/contexts/time-tracker-context'
import { Clock, Edit3, Pause, Play, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function formatHMS(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function RunningTracker() {
    const { running, paused, task, elapsedMs, pause, resume, stop, adjustElapsed, setElapsedExact } = useTimeTracker()

    const timeStr = useMemo(() => formatHMS(elapsedMs), [elapsedMs])

    const [open, setOpen] = useState(false)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [nonBillable, setNonBillable] = useState(false)

    useEffect(() => {
        if (open) {
            const totalSec = Math.floor(elapsedMs / 1000)
            const h = Math.floor(totalSec / 3600)
            const m = Math.floor((totalSec % 3600) / 60)
            const s = totalSec % 60
            setHours(h)
            setMinutes(m)
            setSeconds(s)
        }
    }, [open, elapsedMs])

    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

    const applyQuick = (deltaMinutes: number) => {
        adjustElapsed(deltaMinutes * 60 * 1000)
    }

    const onSave = () => {
        const ms = (clamp(hours, 0, 999) * 3600 + clamp(minutes, 0, 59) * 60 + clamp(seconds, 0, 59)) * 1000
        setElapsedExact(ms)
        setOpen(false)
    }

    if (!running || !task) return null

    return (
        <div className="mx-4 flex max-w-full flex-1 items-center justify-center">
            <div className="flex items-center gap-6 rounded-full px-4 p-0.5 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-neutral-200/50 transition-all duration-300 dark:bg-gray-900/80 dark:ring-neutral-800/50">
                <div className="flex min-w-0 flex-row">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`h-3 w-3 flex-shrink-0 rounded-full ${paused ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                            {!paused && (
                                <div className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping"></div>
                            )}
                            {paused && (
                                <div className="absolute -inset-1 rounded-full bg-amber-500/30 animate-pulse"></div>
                            )}
                        </div>
                        <div className="text-sm font-medium tracking-tight break-words text-gray-800 dark:text-gray-100">
                            <span className="font-semibold">{task.project_name}</span> • <span className="line-clamp-1">{task.title}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        className="h-7 w-7 rounded-full bg-gray-50 p-1 text-gray-700 shadow-sm transition-transform hover:scale-105 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs"
                        onClick={() => applyQuick(-5)}
                        title="Subtract 5 minutes"
                    >
                        -5m
                    </Button>
                    <Button
                        size="icon"
                        className="h-7 w-7 rounded-full bg-gray-50 p-1 text-gray-700 shadow-sm transition-transform hover:scale-105 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs"
                        onClick={() => applyQuick(5)}
                        title="Add 5 minutes"
                    >
                        +5m
                    </Button>
                    <Button
                        size="icon"
                        className="h-7 w-7 rounded-full bg-gray-50 p-1 text-gray-700 shadow-sm transition-transform hover:scale-105 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs"
                        onClick={() => setOpen(true)}
                        title="Edit time"
                    >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pr-2">
                        <Checkbox
                            id="non_billable_rt"
                            checked={nonBillable}
                            onCheckedChange={(c) => setNonBillable(Boolean(c))}
                            className="border-neutral-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 dark:border-neutral-600"
                        />
                        <Label htmlFor="non_billable_rt" className="cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-300 font-bold">
                            Non-billable
                        </Label>
                    </div>
                    {paused ? (
                        <Button
                            size="icon"
                            className="h-7 w-7 rounded-full bg-emerald-50 p-1 text-emerald-700 shadow-sm transition-transform hover:scale-105 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                            onClick={resume}
                            title="Resume"
                        >
                            <Play className="h-4 w-4" strokeWidth={2} />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            className="h-7 w-7 rounded-full bg-amber-50 p-1 text-amber-700 shadow-sm transition-transform hover:scale-105 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                            onClick={pause}
                            title="Pause"
                        >
                            <Pause className="h-4 w-4" strokeWidth={2} />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        className="h-7 w-7 rounded-full bg-red-50 p-1 text-red-700 shadow-sm transition-transform hover:scale-105 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        onClick={() => stop({ non_billable: nonBillable })}
                        title="Stop"
                    >
                        <Square className="h-4 w-4" strokeWidth={2} />
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" strokeWidth={2} />
                    <span className="tabular-nums">{timeStr}</span>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Running Timer</DialogTitle>
                        <DialogDescription>Set an exact time or use quick adjustments.</DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2 p-4">
                        <div className="flex w-1/3 flex-col items-start">
                            <label className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">Hours</label>
                            <Input
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                min={0}
                                max={999}
                                className="w-full"
                            />
                        </div>
                        <div className="flex w-1/3 flex-col items-start">
                            <label className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">Minutes</label>
                            <Input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Number(e.target.value))}
                                min={0}
                                max={59}
                                className="w-full"
                            />
                        </div>
                        <div className="flex w-1/3 flex-col items-start">
                            <label className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">Seconds</label>
                            <Input
                                type="number"
                                value={seconds}
                                onChange={(e) => setSeconds(Number(e.target.value))}
                                min={0}
                                max={59}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-x-0.5">
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(-15)}
                            className="transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900/30"
                        >
                            -15m
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(-5)}
                            className="transition-all hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 dark:hover:border-amber-900/30"
                        >
                            -5m
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(-1)}
                            className="transition-all hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 dark:hover:border-neutral-700"
                        >
                            -1m
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(1)}
                            className="transition-all hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 dark:hover:border-neutral-700"
                        >
                            +1m
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(5)}
                            className="transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/30"
                        >
                            +5m
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => applyQuick(15)}
                            className="transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-900/30"
                        >
                            +15m
                        </Button>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 text-sm text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                            onClick={onSave}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
