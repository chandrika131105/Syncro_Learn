import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { uploadFile } from '../services/api';
import { PlusCircle, Trash2, Video, FileText, Loader2, ArrowLeft, Layers, DollarSign, Type, CheckCircle, Save, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateCourse = () => {
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: ''
    });
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createdCourseId, setCreatedCourseId] = useState(null); // Track ID to prevent duplicates
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCourseChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (index, e) => {
        const newModules = [...modules];
        newModules[index][e.target.name] = e.target.value;
        setModules(newModules);
    };

    const addModule = () => {
        setModules([...modules, {
            title: '',
            content: '',
            videoUrl: '',
            notesUrl: '',
            isSaved: false,
            quiz: {
                title: '',
                questions: []
            }
        }]);
    };

    const removeModule = (index) => {
        const newModules = modules.filter((_, i) => i !== index);
        setModules(newModules);
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
            // Adjust correct index if needed
            if (newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex >= oIndex) {
                newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex = Math.max(0, newModules[moduleIndex].quiz.questions[qIndex].correctOptionIndex - 1);
            }
            setModules(newModules);
        }
    };

    const handleFileUpload = async (index, field, file) => {
        if (!file) return;
        setLoading(true); // Global loading or could be local
        try {
            const data = await uploadFile(file);
            const newModules = [...modules];
            newModules[index][field] = data.fileUrl; // Backend returns { fileName, fileUrl }
            setModules(newModules);
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload file.');
        } finally {
            setLoading(false);
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
                    // Simple CSV parsing: text,opt1,opt2,opt3,opt4,correctIndex
                    const lines = content.split('\n');
                    for (let line of lines) {
                        if (!line.trim()) continue;
                        const parts = line.split(',').map(p => p.trim());
                        if (parts.length >= 4) { // At least text, 2 options, correctIndex
                            const text = parts[0];
                            const correctOptionIndex = parseInt(parts[parts.length - 1]);
                            const options = parts.slice(1, parts.length - 1);

                            if (!isNaN(correctOptionIndex)) {
                                questions.push({ text, options, correctOptionIndex });
                            }
                        }
                    }
                }

                // Basic validation of question structure
                const validQuestions = questions.filter(q =>
                    q.text && Array.isArray(q.options) && q.options.length >= 2 &&
                    typeof q.correctOptionIndex === 'number'
                );

                if (validQuestions.length === 0) {
                    throw new Error('No valid questions found in file.');
                }

                const newModules = [...modules];
                newModules[moduleIndex].quiz.questions = [...newModules[moduleIndex].quiz.questions, ...validQuestions];
                if (!newModules[moduleIndex].quiz.title) {
                    newModules[moduleIndex].quiz.title = "Imported Quiz";
                }
                setModules(newModules);
                setError('');
            } catch (err) {
                console.error('File parsing failed', err);
                setError('Failed to parse file. Please ensure it follows the required format.');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e, isPublished) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let courseId = createdCourseId;

            // 1. Create or Update Course
            if (!courseId) {
                // Create new course
                const courseResponse = await api.post('/courses', {
                    ...courseData,
                    price: parseFloat(courseData.price),
                    isPublished: isPublished
                });
                courseId = courseResponse.data.id;
                setCreatedCourseId(courseId); // Save for retries
            } else {
                // Update existing course (if user changed details while retrying)
                await api.put(`/courses/${courseId}`, {
                    ...courseData,
                    price: parseFloat(courseData.price),
                    isPublished: isPublished
                });
            }

            // 2. Add Modules (Skip already saved ones)
            // We use a copy of modules to update their 'isSaved' status locally
            // Note: In a real app we'd map backend IDs back to these modules.
            // Here we just use a flag to prevent re-posting satisfied modules.
            const updatedModules = [...modules];

            for (let i = 0; i < updatedModules.length; i++) {
                if (!updatedModules[i].isSaved) {
                    await api.post(`/courses/${courseId}/modules`, updatedModules[i]);
                    updatedModules[i].isSaved = true;
                    // Update state incrementally so if it fails later, these stay saved
                    setModules([...updatedModules]);
                }
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            let errorMessage = 'Failed to save course.';
            if (err.response) {
                if (err.response.data && err.response.data.errors) {
                    // Handle Spring Boot validation errors
                    errorMessage = Object.values(err.response.data.errors).join(', ');
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.status === 403) {
                    errorMessage = 'Access Denied: You must be logged in as a Tutor to create courses.';
                } else {
                    errorMessage = `Server Error (${err.response.status}). Please try again.`;
                }
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                        <p className="text-gray-500 mt-1">Share your knowledge with the world</p>
                    </div>
                </motion.div>

                <form className="space-y-8">
                    {/* Course Details Section */}
                    {/* ... (Existing Course Details UI) ... */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Course Information</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                                    <div className="relative group">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="e.g., Advanced React Patterns"
                                            value={courseData.title}
                                            onChange={handleCourseChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
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
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setLoading(true);
                                                                try {
                                                                    const data = await uploadFile(file);
                                                                    setCourseData(prev => ({ ...prev, thumbnail: data.fileUrl }));
                                                                } catch (err) {
                                                                    console.error('Thumbnail upload failed', err);
                                                                    setError('Failed to upload thumbnail.');
                                                                } finally {
                                                                    setLoading(false);
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
                                        placeholder="What will students learn in this course?"
                                        value={courseData.description}
                                        onChange={handleCourseChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                    <div className="relative group w-full md:w-1/3">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                        <input
                                            type="number"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-none"
                                            placeholder="0.00"
                                            value={courseData.price}
                                            onChange={handleCourseChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Modules Section */}
                    {/* ... (Existing Modules UI) ... */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
                            <button
                                type="button"
                                onClick={addModule}
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                Add Module
                            </button>
                        </div>

                        <AnimatePresence>
                            {modules.map((module, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Module {index + 1}</h3>
                                            <button
                                                type="button"
                                                onClick={() => removeModule(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    name="title"
                                                    required
                                                    className="w-full text-lg font-semibold border-b border-gray-200 focus:border-blue-500 outline-none py-2 placeholder-gray-300 transition-colors"
                                                    placeholder="Module Title"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <textarea
                                                    name="content"
                                                    rows={3}
                                                    className="w-full bg-gray-50 rounded-lg p-3 border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-all text-sm"
                                                    placeholder="Module content or summary..."
                                                    value={module.content}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Video className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="videoUrl"
                                                    className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                    placeholder="Video URL or Upload"
                                                    value={module.videoUrl}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                />
                                                <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors" title="Upload Video">
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <input
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
                                                    type="text"
                                                    name="notesUrl"
                                                    className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                    placeholder="Notes URL or Upload"
                                                    value={module.notesUrl}
                                                    onChange={(e) => handleModuleChange(index, e)}
                                                />
                                                <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors" title="Upload Document">
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <input
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
                                                        <CheckCircle className="h-4 w-4 text-green-500" /> Module Quiz (Optional)
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

                                                {module.quiz.questions.length > 0 && (
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
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeQuestion(index, qIdx)}
                                                                    className="absolute top-2 right-2 opacity-0 group-hover/q:opacity-100 text-red-300 hover:text-red-500 transition-all"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                                <div className="space-y-4">
                                                                    <div className="flex gap-2">
                                                                        <span className="text-xs font-black text-gray-300">Q{qIdx + 1}</span>
                                                                        <input
                                                                            type="text"
                                                                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-gray-300"
                                                                            placeholder="Your question here..."
                                                                            value={q.text}
                                                                            onChange={(e) => handleQuestionChange(index, qIdx, 'text', e.target.value)}
                                                                        />
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

                        {modules.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No modules added yet.</p>
                                <button onClick={addModule} className="text-blue-600 font-medium hover:underline mt-2">
                                    Add your first module
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-5 w-5" />
                            <span>Save as Draft</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Publish Course</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
