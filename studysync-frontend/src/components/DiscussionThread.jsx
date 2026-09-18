import React, { useState } from 'react';
import { postDiscussion, replyToDiscussion, upvoteDiscussion } from '../services/api';
import { MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentItem = ({ comment, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [votes, setVotes] = useState(comment.upvotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);

    const handleVote = async () => {
        if (hasVoted) return;
        try {
            await upvoteDiscussion(comment.id);
            setVotes(v => v + 1);
            setHasVoted(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            const newReply = await replyToDiscussion(comment.id, { content: replyContent });
            setReplies([...replies, newReply]);
            setReplyContent('');
            setIsReplying(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                    {comment.user.firstName?.[0] || 'U'}
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <span className="font-bold text-sm text-gray-900">{comment.user.firstName} {comment.user.lastName}</span>
                                {comment.user.role === 'TUTOR' && (
                                    <span className="ml-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">TUTOR</span>
                                )}
                                <span className="ml-2 text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{comment.content}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button onClick={handleVote} className={`flex items-center gap-1 hover:text-blue-600 ${hasVoted ? 'text-blue-600 font-bold' : ''}`}>
                                <ThumbsUp className="h-3.5 w-3.5" />
                                <span>{votes} Helpful</span>
                            </button>
                            <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 hover:text-blue-600">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Reply</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isReplying && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleReply}
                                className="mt-2 flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
                                    <Send className="h-4 w-4" />
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DiscussionThread = ({ moduleId, discussions, onPost }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const comment = await postDiscussion({
                content: newComment,
                moduleId: moduleId
            });
            onPost(comment);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post discussion", error);
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Discussion & Q&A
                <span className="text-sm font-normal text-gray-500 ml-2">({discussions.length} threads)</span>
            </h3>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                <div className="flex-1 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="w-full h-24 bg-gray-50 rounded-2xl p-4 border border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    />
                    <button type="submit" className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2">
                        Post Question
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-6">
                {discussions.map(discussion => (
                    <CommentItem key={discussion.id} comment={discussion} />
                ))}

                {discussions.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No questions yet.</p>
                        <p className="text-gray-400 text-sm">Be the first to ask something!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscussionThread;
