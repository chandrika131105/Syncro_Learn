import React, { useState } from 'react';
import {
    FileText, Download, ExternalLink, Maximize2,
    ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Search,
    Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const PDFViewer = ({ url, title }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-[4/5] md:aspect-auto md:h-[700px]'}`}>
            {/* Header Control Bar */}
            <div className="bg-gray-800/80 backdrop-blur-md border-b border-white/5 p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-red-500/10 rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-white text-xs font-black truncate max-w-[200px] md:max-w-md tracking-tight">
                            {title || "Course Material"}
                        </h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Digital PDF Document</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={url}
                        download
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </a>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <ArrowLeft className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-[10px] flex items-center gap-2 px-3"
                    >
                        <span>Open New Tab</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>

            {/* Document Preview Area */}
            <div className="relative w-full h-[calc(100%-60px)] bg-gray-900/50 flex items-center justify-center overflow-hidden">
                <iframe
                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title={title}
                />

                {/* Visual Glass Enhancement Overlay (only on edges to not block interaction) */}
                <div className="absolute inset-0 pointer-events-none border-[12px] border-gray-900/20 rounded-2xl"></div>
            </div>

            {/* Minimal Footer */}
            {!isFullscreen && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black text-white/50 flex items-center gap-3">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="tracking-widest uppercase">Safe Preview Mode</span>
                    <div className="h-3 w-px bg-white/20"></div>
                    <span className="text-blue-400">SyncroLearn Engine</span>
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
