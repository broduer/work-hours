import { Button } from '@/components/ui/button'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { router } from '@inertiajs/react'
import DOMPurify from 'dompurify'
import { Calendar, Clock, ExternalLink, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Task } from '@/pages/task/types'

interface Attachment {
    name: string
    url: string
    size: number
}

type MentionCandidate = { id: number | string; name: string; handle: string }

export type TaskDetailsOffCanvasProps = {
    open: boolean
    onClose: () => void
    taskId: number | null
}

type CommentItem = {
    id: number
    body: string
    user?: { id?: number; name?: string }
    created_at?: string
}

export default function TaskDetailsOffCanvas({ open, onClose, taskId }: TaskDetailsOffCanvasProps) {
    const [task, setTask] = useState<Task | null>(null)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [mentionableUsers, setMentionableUsers] = useState<MentionCandidate[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [comments, setComments] = useState<CommentItem[]>([])
    const [dataBody, setDataBody] = useState<string>('')
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingBody, setEditingBody] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null)

    const stripHtml = (s: string): string =>
        s
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim()

    const fetchData = async () => {
        if (!taskId) return
        setLoading(true)
        setError(null)
        try {
            let endpoint = ''
            try {
                endpoint = route('task.detail-data', taskId) as unknown as string
            } catch {
                endpoint = `/action/app-http-controllers-taskcontroller/detail-data/${taskId}`
            }
            const res = await fetch(endpoint)
            if (!res.ok) throw new Error('Failed to load task details')
            const payload = await res.json()
            setTask(payload.task)
            setAttachments(payload.attachments || [])
            setMentionableUsers(payload.mentionableUsers || [])
            setComments(Array.isArray(payload.task?.comments) ? payload.task.comments : [])
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && taskId) {
            fetchData()
        } else {
            setTask(null)
            setAttachments([])
            setComments([])
            setError(null)
        }
    }, [open, taskId])
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!taskId || !dataBody.trim()) return

        try {
            const trimmedBody = stripHtml(dataBody)
            if (!trimmedBody) return

            const endpoint = `/action/app-http-controllers-taskcontroller/comment/${taskId}`
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ body: dataBody }),
            })

            if (!res.ok) throw new Error('Failed to add comment')

            const newComment = await res.json()
            setComments((prev) => [...prev, newComment])
            setDataBody('')
        } catch (e) {
            console.error('Failed to submit comment:', e)
        }
    }

    const handleEditComment = async (commentId: number) => {
        if (!editingBody.trim()) return

        try {
            const endpoint = `/action/app-http-controllers-taskcontroller/comment/${commentId}`
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ body: editingBody }),
            })

            if (!res.ok) throw new Error('Failed to update comment')

            const updatedComment = await res.json()
            setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)))
            setEditingCommentId(null)
            setEditingBody('')
        } catch (e) {
            console.error('Failed to update comment:', e)
        }
    }

    const handleDeleteComment = async (commentId: number) => {
        try {
            const endpoint = `/action/app-http-controllers-taskcontroller/comment/${commentId}`
            const res = await fetch(endpoint, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete comment')

            setComments((prev) => prev.filter((c) => c.id !== commentId))
            setCommentToDelete(null)
            setDeleteDialogOpen(false)
        } catch (e) {
            console.error('Failed to delete comment:', e)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            case 'in progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            case 'medium':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="right" className="w-full overflow-y-auto bg-white p-0 sm:max-w-md md:max-w-lg lg:max-w-xl dark:bg-gray-900">
                {loading ? (
                    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 px-6 py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading task details...</p>
                    </div>
                ) : error ? (
                    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 px-6 py-8">
                        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                            <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-center text-gray-900 dark:text-gray-100">Error loading task details</p>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">{error}</p>
                        <Button variant="outline" onClick={fetchData}>
                            Try Again
                        </Button>
                    </div>
                ) : task ? (
                    <div className="flex h-full flex-col">
                        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                            <div className="flex items-center justify-between px-6 pt-6 pb-4">
                                <SheetHeader className="mb-0">
                                    <SheetTitle className="pr-8 text-xl font-bold text-gray-900 dark:text-white">Task Details</SheetTitle>
                                </SheetHeader>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </div>

                            <div className="border-b border-gray-100 bg-gray-50 px-6 py-2 dark:border-gray-800 dark:bg-gray-800/50">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(task.status || '')}`}
                                        >
                                            {task.status || 'No Status'}
                                        </span>
                                        {task.priority && (
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}
                                            >
                                                {task.priority} Priority
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1 text-xs"
                                        onClick={() => {
                                            if (task?.id) {
                                                try {
                                                    const url = route('task.edit', task.id)
                                                    router.visit(url)
                                                } catch {
                                                    console.log('Route not found')
                                                }
                                            }
                                        }}
                                    >
                                        <Pencil className="h-3 w-3" /> Edit
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto px-6 py-4">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl leading-tight font-bold text-gray-900 dark:text-white">{task.title || 'Untitled Task'}</h2>
                                    {task.created_at && (
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Created {formatDate(task.created_at)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Due Date</div>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {task.due_date ? formatDate(task.due_date) : 'No due date set'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Assigned To</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            {task.assignees && task.assignees.length > 0 ? (
                                                <>
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {task.assignees[0]?.name?.[0] || '?'}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{task.assignees[0]?.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {task.description && (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <h3 className="mb-2 font-medium text-gray-900 dark:text-white">Description</h3>
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }}
                                        />
                                    </div>
                                )}

                                {attachments.length > 0 && (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Attachments</h3>
                                        <ul className="space-y-2">
                                            {attachments.map((attachment, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
                                                    >
                                                        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <p className="truncate font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {(attachment.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Comments</h3>

                                    {comments.length > 0 ? (
                                        <ul className="mb-4 space-y-4">
                                            {comments.map((comment) => (
                                                <li
                                                    key={comment.id}
                                                    className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                                                >
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {comment.user?.name?.[0] || '?'}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {comment.user?.name || 'Unknown User'}
                                                            </span>
                                                            {comment.created_at && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatDate(comment.created_at)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                onClick={() => {
                                                                    setEditingCommentId(comment.id)
                                                                    setEditingBody(comment.body)
                                                                }}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-full p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                                onClick={() => {
                                                                    setCommentToDelete(comment.id)
                                                                    setDeleteDialogOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {editingCommentId === comment.id ? (
                                                        <div className="space-y-3">
                                                            <RichTextEditor value={editingBody} onChange={setEditingBody} />
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setEditingCommentId(null)
                                                                        setEditingBody('')
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleEditComment(comment.id)}
                                                                    disabled={!editingBody.trim()}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }}
                                                        />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                                        <RichTextEditor
                                            placeholder="Add a comment..."
                                            onChange={setDataBody}
                                            value={dataBody}
                                            mentions={mentionableUsers}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={!stripHtml(dataBody)}>
                                                Add Comment
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </SheetContent>

            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Delete Comment</h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteDialogOpen(false)
                                    setCommentToDelete(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Sheet>
    )
}
