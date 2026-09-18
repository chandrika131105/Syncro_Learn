import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Settings,
    RotateCcw, RotateCw, SkipForward, SkipBack,
    FastForward, Info, Monitor, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoPlayer = ({ url, title, onProgress, startTime = 0 }) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const handlePlayPause = () => setPlaying(!playing);
    const handleToggleMute = () => setMuted(!muted);

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
            if (onProgress) onProgress(state);
        }
    };

    useEffect(() => {
        if (startTime > 0 && playerRef.current) {
            playerRef.current.seekTo(startTime);
        }
    }, [url, startTime]);

    const handleDuration = (duration) => setDuration(duration);

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => setSeeking(true);

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        playerRef.current.seekTo(parseFloat(e.target.value));
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
        setMuted(false);
    };

    const handlePlaybackRateChange = (rate) => setPlaybackRate(rate);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const skip = (amount) => {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() + amount);
    };

    return (
        <div
            ref={containerRef}
            className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group ring-1 ring-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            <div className="aspect-video w-full h-full relative">
                <ReactPlayer
                    ref={playerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    playbackRate={playbackRate}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    progressInterval={100}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload'
                            }
                        }
                    }}
                />

                {/* Big Play/Pause Overlay Transition */}
                <AnimatePresence>
                    {!playing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-10"
                            onClick={handlePlayPause}
                        >
                            <div className="h-24 w-24 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] transform hover:scale-110 transition-transform">
                                <Play className="h-12 w-12 fill-current ml-1" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Custom Controls Container */}
                <motion.div
                    animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 md:p-6 z-20 pointer-events-none"
                >
                    <div className="pointer-events-auto">
                        {/* Progress Bar Container */}
                        <div className="group/progress relative h-1.5 mb-6 cursor-pointer">
                            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                            <div
                                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                                style={{ width: `${played * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-xl scale-0 group-hover/progress:scale-100 transition-transform"></div>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onMouseDown={handleSeekMouseDown}
                                onChange={handleSeekChange}
                                onMouseUp={handleSeekMouseUp}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4 md:gap-6">
                                <button onClick={handlePlayPause} className="hover:text-blue-400 transition-colors transform active:scale-90">
                                    {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                                </button>

                                <div className="flex items-center gap-2 md:gap-4">
                                    <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors" title="Rewind 10s">
                                        <RotateCcw className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors" title="Forward 10s">
                                        <RotateCw className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 group/volume">
                                    <button onClick={handleToggleMute} className="hover:text-blue-400 transition-colors">
                                        {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </button>
                                    <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden flex items-center">
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step="any"
                                            value={muted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-white/30 rounded-full appearance-none accent-white cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="hidden sm:block text-[11px] font-black tracking-widest text-white/50 tabular-nums">
                                    <span className="text-white">{formatTime(played * duration)}</span>
                                    <span className="mx-2">/</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = title || 'video';
                                        link.target = "_blank";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="text-white/70 hover:text-blue-400 transition-colors"
                                    title="Download for Offline"
                                >
                                    <Download className="h-5 w-5" />
                                </button>

                                <div className="group/rate relative">
                                    <button className="text-[10px] font-black border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all uppercase tracking-tighter bg-white/5">
                                        {playbackRate}x <span className="hidden md:inline ml-1">Speed</span>
                                    </button>
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-2 flex flex-col gap-1 scale-0 group-hover/rate:scale-100 transition-all origin-bottom ring-1 ring-white/10 backdrop-blur-xl">
                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                            <button
                                                key={rate}
                                                onClick={() => handlePlaybackRateChange(rate)}
                                                className={`px-6 py-2.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${playbackRate === rate ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {rate}x Speed
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={toggleFullScreen} className="text-white/70 hover:text-white transition-colors transform hover:scale-110 active:scale-90">
                                    <Maximize className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VideoPlayer;
