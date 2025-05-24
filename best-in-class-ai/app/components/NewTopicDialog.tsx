import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type NewTopicDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; file: File | null }) => void;
    onTopicsUpdate?: (topics: { id: number; name: string; description: string | null; study_hours: number; session_count: number; day_streak: number; overall_progress: number; }[]) => void;
};

export function NewTopicDialog({ isOpen, onClose, onSubmit, onTopicsUpdate }: NewTopicDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (description) formData.append('description', description);
            if (file) formData.append('file', file);

            const response = await fetch('http://localhost:8000/api/create-topic', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create topic');
            }

            await onSubmit({ name, description, file });
            // Refresh topics after successful creation
            const topicsResponse = await fetch('http://localhost:8000/api/topics');
            if (topicsResponse.ok) {
                const updatedTopics = await topicsResponse.json();
                if (onTopicsUpdate) onTopicsUpdate(updatedTopics);
            }
            setIsSuccess(true); // Show success message
            setTimeout(() => {
                onClose(); // Close dialog after a delay
            }, 2000);
        } catch (error) {
            console.error('Error creating new topic:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        // Clear state on cancel
        setName('');
        setDescription('');
        setFile(null);
        setIsSuccess(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={handleCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                    >
                        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 flex flex-col items-center justify-center">
                            <div className="flex justify-between items-center mb-4 w-full">
                                <h2 className="text-xl font-bold text-amber-900">Create New Topic</h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-amber-600 hover:text-amber-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {isSuccess ? (
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-green-600">Topic created successfully!</h3>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-1">
                                            Topic Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-amber-900"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-amber-900 mb-1">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-amber-900"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-amber-900 mb-1">
                                            Study Materials
                                        </label>
                                        <div className="border-2 border-dashed border-amber-300 rounded-lg p-4 text-center bg-amber-50">
                                            <input
                                                type="file"
                                                className="hidden"
                                                id="file-upload"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer text-amber-600 hover:text-amber-700"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="font-medium">
                                                        {file ? file.name : 'Upload Study Materials'}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-amber-600 hover:text-amber-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? 'Creating...' : 'Create Topic'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
} 