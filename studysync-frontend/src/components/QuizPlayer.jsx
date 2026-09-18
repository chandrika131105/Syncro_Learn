import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitQuiz } from '../services/api';

const QuizPlayer = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleOptionSelect = (optionIndex) => {
        if (result) return;
        setSelectedAnswers({
            ...selectedAnswers,
            [quiz.questions[currentQuestionIndex].id]: optionIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const data = await submitQuiz(quiz.id, selectedAnswers);
            setResult(data);
        } catch (error) {
            console.error("Quiz submission failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setResult(null);
    };

    if (result) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] border border-white/10 shadow-2xl text-center relative overflow-hidden"
            >
                {/* Background glow for result */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r ${result.passed ? 'from-green-500 to-emerald-400' : 'from-red-500 to-orange-400'}`} />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-2xl ${result.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                    <Award className="h-12 w-12" />
                </motion.div>

                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Quiz Performance</h2>
                <div className={`text-7xl font-black mb-6 tracking-tighter ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {result.percentage.toFixed(0)}%
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mb-10 border border-white/5 inline-block">
                    <p className="text-blue-100 font-medium text-lg leading-relaxed">
                        {result.passed
                            ? "Excellent work! You've mastered this module."
                            : "Keep practicing! You can retake the quiz anytime."}
                    </p>
                    <div className="mt-2 text-blue-300 text-sm font-bold uppercase tracking-widest">
                        {result.correctAnswers} / {result.totalQuestions} Correct Answers
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={resetQuiz}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                    >
                        <RotateCcw className="h-5 w-5" /> Retake Quiz
                    </button>
                    <button
                        onClick={onComplete}
                        className={`flex items-center justify-center gap-3 px-8 py-4 ${result.passed ? 'bg-blue-600' : 'bg-gray-700'} text-white rounded-2xl font-black hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-500/20`}
                    >
                        {result.passed ? "Next Lesson" : "Back to Course"} <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-3xl flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] border border-blue-400/20">
                        Step {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Progress</p>
                        <div className="text-xl font-black text-white leading-none">{Math.round(progress)}%</div>
                    </div>
                </div>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5 shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id || currentQuestionIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar"
                >
                    <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                        {currentQuestion.text}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedAnswers[currentQuestion.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`group relative w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 overflow-hidden ${isSelected
                                        ? 'border-blue-500 bg-blue-600/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
                                        : 'border-white/5 hover:border-white/25 hover:bg-white/10 active:scale-[0.98]'
                                        }`}
                                >
                                    <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-base font-black transition-all ${isSelected
                                        ? 'bg-blue-600 text-white rotate-6 scale-105 shadow-lg'
                                        : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                                        }`}>
                                        {optionLabels[idx]}
                                    </div>
                                    <span className={`flex-1 text-base font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {option}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-blue-600 p-1 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"
                                        >
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="hidden sm:block">
                    <p className="text-blue-400/40 text-[10px] font-bold uppercase tracking-widest leading-none">Pick the correct answer to continue</p>
                </div>
                <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQuestion.id] === undefined || submitting}
                    className={`group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-base font-black transition-all shadow-3xl active:scale-95 ${selectedAnswers[currentQuestion.id] === undefined
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-none hover:shadow-blue-500/50 hover:-translate-y-1'
                        }`}
                >
                    {submitting ? (
                        <>
                            <RotateCcw className="h-5 w-5 animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                            {isLastQuestion ? 'Complete Assessment' : 'Next Step'}
                            <ChevronRight className={`h-5 w-5 transition-transform ${selectedAnswers[currentQuestion.id] !== undefined && 'group-hover:translate-x-1'}`} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizPlayer;
