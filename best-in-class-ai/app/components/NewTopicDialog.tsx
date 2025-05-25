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
    const [fileId, setFileId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setUploadError('Only PDF files are allowed');
                return;
            }
            setFile(selectedFile);
            setIsUploading(true);
            setUploadError(null);
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const response = await fetch('http://localhost:8000/api/upload-study-material', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to upload file');
                }
                const result = await response.json();
                if (!result.file_id) {
                    throw new Error('No file ID received from server');
                }
                setFileId(result.file_id);
                console.log('Uploaded file ID:', result.file_id);
            } catch (error) {
                console.error('Error uploading file:', error);
                setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
                setFile(null);
                setFileId(null);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (description) formData.append('description', description);
            if (fileId) formData.append('file_id', fileId);

            const response = await fetch('http://localhost:8000/api/create-topic', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create topic');
            }

            const result = await response.json();
            console.log('Created topic with file handle:', result.file_handle);

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
        setFileId(null);
        setUploadError(null);
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
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-amber-600
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-medium
                                                    file:bg-amber-600 file:text-white
                                                    hover:file:bg-amber-700
                                                    cursor-pointer"
                                            />
                                            {file && (
                                                <p className="mt-2 text-sm text-amber-700">
                                                    Selected file: {file.name}
                                                </p>
                                            )}
                                            {isUploading && (
                                                <p className="mt-2 text-sm text-amber-600">
                                                    Uploading...
                                                </p>
                                            )}
                                            {uploadError && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {uploadError}
                                                </p>
                                            )}
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