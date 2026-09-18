import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getCourseById,
    updateCourse,
    addModule,
    updateModule,
    deleteModule,
    uploadFile
} from '../services/api';
import { PlusCircle, Trash2, Video, FileText, Loader2, ArrowLeft, Layers, DollarSign, Type, Save, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: '',
        thumbnail: '',
        isPublished: false // Track publication status
    });
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await getCourseById(id);
                setCourseData({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    thumbnail: data.thumbnail || '',
                    category: data.category || '',
                    level: data.level || '',
                    isPublished: data.isPublished || false
                });
                // Ensure modules array is initialized properly with empty strings if fields are missing
                const loadedModules = data.modules ? data.modules.map(m => ({
                    id: m.id,
                    title: m.title || '',
                    content: m.content || '',
                    videoUrl: m.videoUrl || '',
                    notesUrl: m.notesUrl || '',
                    quiz: m.quiz || { title: '', questions: [] }
                })) : [];
                setModules(loadedModules);
            } catch (err) {
                console.error("Failed to load course", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    const handleCourseChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (index, e) => {
        const newModules = [...modules];
        newModules[index][e.target.name] = e.target.value;
        setModules(newModules);
    };

    const handleAddModule = () => {
        setModules([...modules, {
            title: '',
            content: '',
            videoUrl: '',
            notesUrl: '',
            quiz: {
                title: '',
                questions: []
            }
        }]);
    };

    const handleRemoveModule = async (index) => {
        const moduleToRemove = modules[index];

        if (moduleToRemove.id) {
            if (window.confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
                try {
                    await deleteModule(id, moduleToRemove.id);
                    const newModules = modules.filter((_, i) => i !== index);
                    setModules(newModules);
                } catch (err) {
                    console.error("Failed to delete module", err);
                    alert("Failed to delete module.");
                }
            }
        } else {
            // Not saved yet, just remove from state
            const newModules = modules.filter((_, i) => i !== index);
            setModules(newModules);
        }
    };

    const addQuestion = (moduleIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].quiz.questions.push({
            text: '',
            options: ['', ''],
            correctOptionIndex: 0
        });
        setModules(newModules);
    };

    const removeQuestion = (moduleIndex, qIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].quiz.questions.splice(qIndex, 1);
        setModules(newModules);
    };

    const handleQuestionChange = (moduleIndex, qIndex, field, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].quiz.questions[qIndex][field] = value;
        setModules(newModules);
    };

    const handleOptionChange = (moduleIndex, qIndex, oIndex, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].quiz.questions[qIndex].options[oIndex] = value;
        setModules(newModules);
    };

    const addOption = (moduleIndex, qIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].quiz.questions[qIndex].options.push('');
        setModules(newModules);
    };

    const removeOption = (moduleIndex, qIndex, oIndex) => {
        const newModules = [...modules];
        if (newModules[moduleIndex].quiz.questions[qIndex].options.length > 2) {
            newModules[moduleIndex].quiz.questions[qIndex].options.splice(oIndex, 1);
            if (newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex >= oIndex) {
                newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex = Math.max(0, newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex - 1);
            }
            setModules(newModules);
        }
    };

    const handleFileUpload = async (index, field, file) => {
        if (!file) return;
        // Ideally show loading state per module/field
        try {
            const data = await uploadFile(file);
            const newModules = [...modules];
            newModules[index][field] = data.fileUrl; // or data.fileName depending on how you construct URLs
            setModules(newModules);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload file.');
        }
    };

    // Modified to accept publication status
    const handleSubmit = async (e, shouldPublish) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // 1. Update Course Details
            await updateCourse(id, {
                ...courseData,
                price: parseFloat(courseData.price),
                isPublished: shouldPublish !== undefined ? shouldPublish : courseData.isPublished
            });

            // If we are changing publication status, update local state immediately
            if (shouldPublish !== undefined) {
                setCourseData(prev => ({ ...prev, isPublished: shouldPublish }));
            }

            // 2. Update/Add Modules
            for (const module of modules) {
                if (module.id) {
                    await updateModule(id, module.id, module);
                } else {
                    await addModule(id, module);
                }
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            let errorMessage = 'Failed to update course.';
            if (err.response) {
                if (err.response.data && err.response.data.errors) {
                    errorMessage = Object.values(err.response.data.errors).join(', ');
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.status === 403) {
                    errorMessage = 'Access Denied: You do not have permission to edit this course.';
                } else {
                    errorMessage = `Server Error (${err.response.status}).`;
                }
            }
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleBulkUpload = async (moduleIndex, file) => {
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType !== 'json' && fileType !== 'csv') {
            setError('Strictly only .json and .csv files are allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let questions = [];
                const content = e.target.result;

                if (fileType === 'json') {
                    questions = JSON.parse(content);
                } else {
                    const lines = content.split('\n');
                    for (let line of lines) {
                        if (!line.trim()) continue;
                        const parts = line.split(',').map(p => p.trim());
                        if (parts.length >= 4) {
                            const text = parts[0];
                            const correctOptionIndex = parseInt(parts[parts.length - 1]);
                            const options = parts.slice(1, parts.length - 1);

                            if (!isNaN(correctOptionIndex)) {
                                questions.push({ text, options, correctOptionIndex });
                            }
                        }
                    }
                }

                const validQuestions = questions.filter(q =>
                    q.text && Array.isArray(q.options) && q.options.length >= 2 &&
                    typeof q.correctOptionIndex === 'number'
                );

                if (validQuestions.length === 0) {
                    throw new Error('No valid questions found in file.');
                }

                const newModules = [...modules];
                if (!newModules[moduleIndex].quiz) {
                    newModules[moduleIndex].quiz = { title: 'Imported Quiz', questions: [] };
                }
                newModules[moduleIndex].quiz.questions = [...newModules[moduleIndex].quiz.questions, ...validQuestions];
                setModules(newModules);
                setError('');
            } catch (err) {
                console.error('File parsing failed', err);
                setError('Failed to parse file. Please follow the required format.');
            }
        };
        reader.readAsText(file);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                        <p className="text-gray-500 mt-1">Update your course content</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${courseData.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {courseData.isPublished ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </motion.div>

                <form className="space-y-8">
                    {/* Course Details Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Course Information</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                                    <div className="relative group">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            id="course-title"
                                            type="text"
                                            name="title"
                                            required
                                            placeholder="e.g. Advanced React Patterns"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            value={courseData.title}
                                            onChange={handleCourseChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="course-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            id="course-category"
                                            name="category"
                                            className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            value={courseData.category || ''}
                                            onChange={handleCourseChange}
                                            required
                                        >
                                            <option value="" disabled>Select Category</option>
                                            <option value="Development">Development</option>
                                            <option value="Business">Business</option>
                                            <option value="Finance">Finance</option>
                                            <option value="IT & Software">IT & Software</option>
                                            <option value="Office Productivity">Office Productivity</option>
                                            <option value="Personal Development">Personal Development</option>
                                            <option value="Design">Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Lifestyle">Lifestyle</option>
                                            <option value="Photography">Photography</option>
                                            <option value="Health & Fitness">Health & Fitness</option>
                                            <option value="Music">Music</option>
                                            <option value="Teaching & Academics">Teaching & Academics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                                        <select
                                            name="level"
                                            className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            value={courseData.level || ''}
                                            onChange={handleCourseChange}
                                            required
                                        >
                                            <option value="" disabled>Select Level</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="All Levels">All Levels</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                                    <div className="flex items-center gap-4">
                                        {courseData.thumbnail && (
                                            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                                                <img src={courseData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCourseData({ ...courseData, thumbnail: '' })}
                                                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Remove image"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    name="thumbnail"
                                                    className="block w-full pl-3 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm placeholder-gray-400"
                                                    placeholder="Enter image URL or upload file..."
                                                    value={courseData.thumbnail || ''}
                                                    onChange={handleCourseChange}
                                                />
                                                <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500" title="Upload Image">
                                                    <Upload className="h-4 w-4" />
                                                    <input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                // Ideally local loading state
                                                                try {
                                                                    const data = await uploadFile(file);
                                                                    setCourseData(prev => ({ ...prev, thumbnail: data.fileUrl }));
                                                                } catch (err) {
                                                                    console.error('Thumbnail upload failed', err);
                                                                    alert('Failed to upload thumbnail.');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-400">Recommended size: 1280x720 (16:9)</p>
                                        </div>
                                    </div>
                                </div>


                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                        value={courseData.description}
                                        onChange={handleCourseChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="course-price" className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                    <div className="relative group w-full md:w-1/3">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                        <input
                                            id="course-price"
                                            type="number"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                                            value={courseData.price}
                                            onChange={handleCourseChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modules Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
                            <button
                                type="button"
                                onClick={handleAddModule}
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                Add Module
                            </button>
                        </div>

                        <AnimatePresence>
                            {modules.map((module, index) => (
                                <motion.div
                                    key={module.id || `new-${index}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                {module.id ? `Module (ID: ${module.id})` : `New Module ${index + 1}`}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveModule(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Delete Module"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <input
                                                    id={`module-title-${index}`}
                                                    type="text"
                                                    name="title"
                                                    required
                                                    className="w-full text-lg font-semibold border-b border-gray-200 focus:border-blue-500 outline-none py-2 placeholder-gray-300 transition-colors"
                                                    placeholder="Module Title"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                    aria-label="Module Title"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <textarea
                                                    id={`module-content-${index}`}
                                                    name="content"
                                                    rows={3}
                                                    className="w-full bg-gray-50 rounded-lg p-3 border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-all text-sm"
                                                    placeholder="Module content..."
                                                    value={module.content}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                    aria-label="Module Content"
                                                />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Video className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    id={`module-video-${index}`}
                                                    type="text"
                                                    name="videoUrl"
                                                    className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                    placeholder="Video URL or Upload"
                                                    value={module.videoUrl}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                    aria-label="Video URL"
                                                />
                                                <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors" title="Upload Video">
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <input
                                                        id={`video-upload-${index}`}
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(index, 'videoUrl', e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    id={`module-notes-${index}`}
                                                    type="text"
                                                    name="notesUrl"
                                                    className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                    placeholder="Notes URL or Upload"
                                                    value={module.notesUrl}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                    aria-label="Notes URL"
                                                />
                                                <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors" title="Upload Document">
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <input
                                                        id={`notes-upload-${index}`}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(index, 'notesUrl', e.target.files[0])}
                                                    />
                                                </label>
                                            </div>

                                            {/* Quiz Editor */}
                                            <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                        <Save className="h-4 w-4 text-green-500" /> Module Quiz (Optional)
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        <label className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded cursor-pointer">
                                                            ↑ Bulk Upload (JSON/CSV)
                                                            <input
                                                                type="file"
                                                                accept=".json,.csv"
                                                                className="hidden"
                                                                onChange={(e) => handleBulkUpload(index, e.target.files[0])}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addQuestion(index)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                                                        >
                                                            + Add Question
                                                        </button>
                                                    </div>
                                                </div>

                                                {module.quiz && module.quiz.questions && module.quiz.questions.length > 0 && (
                                                    <div className="space-y-6">
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm font-medium border-b border-gray-100 focus:border-green-500 outline-none pb-1 placeholder-gray-300 transition-colors mb-4"
                                                            placeholder="Quiz Title (e.g., Final Assessment)"
                                                            value={module.quiz.title}
                                                            onChange={(e) => {
                                                                const newModules = [...modules];
                                                                newModules[index].quiz.title = e.target.value;
                                                                setModules(newModules);
                                                            }}
                                                        />

                                                        {module.quiz.questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 relative group/q">
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <span className="text-xs font-black text-gray-300">Q{qIdx + 1}</span>
                                                                            <input
                                                                                type="text"
                                                                                className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-gray-300"
                                                                                placeholder="Your question here..."
                                                                                value={q.text}
                                                                                onChange={(e) => handleQuestionChange(index, qIdx, 'text', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeQuestion(index, qIdx)}
                                                                            className="text-red-300 hover:text-red-500 transition-all ml-2"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="grid gap-2 pl-6">
                                                                        {q.options.map((opt, oIdx) => (
                                                                            <div key={oIdx} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    checked={q.correctOptionIndex === oIdx}
                                                                                    onChange={() => handleQuestionChange(index, qIdx, 'correctOptionIndex', oIdx)}
                                                                                    className="h-3 w-3 text-green-600"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    className="flex-1 bg-white border border-gray-100 rounded px-2 py-1 text-xs outline-none focus:border-blue-200"
                                                                                    placeholder={`Option ${oIdx + 1}`}
                                                                                    value={opt}
                                                                                    onChange={(e) => handleOptionChange(index, qIdx, oIdx, e.target.value)}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeOption(index, qIdx, oIdx)}
                                                                                    className="text-gray-300 hover:text-red-400"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addOption(index, qIdx)}
                                                                            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 w-fit"
                                                                        >
                                                                            + Add Option
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
                        {/* Option 1: Save as Draft / Keep Hidden */}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={saving}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!courseData.isPublished
                                ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Save className="h-5 w-5" />
                            <span>{!courseData.isPublished ? 'Save Draft' : 'Unpublish (Save as Draft)'}</span>
                        </button>

                        {/* Option 2: Publish / Save & Publish */}
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={saving}
                            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${courseData.isPublished
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5'
                                : 'bg-white text-gray-500 border border-gray-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                                }`}
                            // If user is just saving without changing status, we can detect that differently, 
                            // but for simplicity, we force the user to choose their intent here.
                            // Actually, let's make the "Publish" button primary if it's currently a draft.
                            style={!courseData.isPublished ? {
                                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                                color: 'white'
                            } : {}}
                        >
                            {saving ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>{courseData.isPublished ? 'Save Changes' : 'Publish Course'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourse;
