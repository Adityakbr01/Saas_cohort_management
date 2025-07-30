import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Backend_URL } from '@/config/constant';
import Hls from 'hls.js';
import { FastForward, Maximize2, Minimize2, PauseCircle, PlayCircle, Rewind, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function HLSPlayer({
  lessonId,
  videoUrl,
  cohortId,
  onMarkComplete,
  onBookmark,
  onProgressUpdate,
  onNext,
  onPrevious,
}: {
  lessonId: string;
  videoUrl: string;
  cohortId: string;
  onMarkComplete?: () => void;
  onBookmark?: (time: number) => void;
  onProgressUpdate?: (percent: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastWatched, setLastWatched] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const controlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log(lastWatched);

  // Secure HLS video loading and resume last watched time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const fetchLastWatched = async () => {
      if (!Backend_URL || !lessonId || !cohortId) {
        console.error('Missing required parameters:', { Backend_URL, lessonId, cohortId });
        toast.error('Configuration error: Unable to fetch progress');
        return 0;
      }

      try {
        const url = `${Backend_URL}/enrollment/progress/get?lessonId=${encodeURIComponent(lessonId)}&cohortId=${encodeURIComponent(cohortId)}`;
        console.debug('Fetching last watched time from:', url);
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to fetch progress'}`);
        }

        const data = await res.json();
        if (typeof data.lastWatchedTime !== 'number') {
          console.warn('Invalid lastWatchedTime format:', data.lastWatchedTime);
          return 0;
        }

        setLastWatched(data.lastWatchedTime);
        setCurrentTime(data.lastWatchedTime);
        return data.lastWatchedTime;
      } catch (err) {
        console.error('Progress fetch failed:', err);
        toast.error('Failed to load progress. Starting from beginning.');
        return 0;
      }
    };

    const setupVideo = async () => {
      const savedTime = await fetchLastWatched();

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.currentTime = savedTime;
          video.volume = isMuted ? 0 : volume / 100;
          video.play().catch(() => setIsPlaying(false));
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS error:', data);
          toast.error('Video playback error occurred');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = savedTime;
          video.volume = isMuted ? 0 : volume / 100;
          video.play().catch(() => setIsPlaying(false));
        });
      }

      video.addEventListener('loadedmetadata', () => {
        setVideoDuration(video.duration);
      });

      video.addEventListener('timeupdate', () => {
        setCurrentTime(video.currentTime);
      });
    };

    setupVideo();

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoUrl, lessonId, cohortId]);

  // Set playback rate programmatically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Secure progress saving with debounced API calls
  const saveProgress = useCallback(async (currentTime: number) => {
    if (!Backend_URL || !lessonId || !cohortId) {
      console.error('Missing required parameters:', { Backend_URL, lessonId, cohortId });
      toast.error('Configuration error: Unable to save progress');
      return;
    }

    try {
      const url = `${Backend_URL}/enrollment/progress/save`;
      console.debug('Saving progress to:', url, { lessonId, time: currentTime, cohortId });
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        },
        credentials: 'include',
        body: JSON.stringify({ lessonId, time: currentTime, cohortId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to save progress'}`);
      }

      console.debug('Progress saved successfully');
    } catch (err) {
      console.error('Progress save failed:', err);
      toast.error('Failed to save progress');
    }
  }, [lessonId, cohortId]);

  // Save progress on significant events (pause, seek, end)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSignificantEvent = () => {
      console.debug('Significant event triggered, saving progress:', video.currentTime);
      saveProgress(Math.floor(video.currentTime));
    };

    const handleVideoEnded = () => {
      console.debug('Video ended, saving progress and marking complete:', video.currentTime);
      saveProgress(Math.floor(video.currentTime));
      if (onMarkComplete && !isCompleted) {
        console.debug('Calling onMarkComplete');
        onMarkComplete();
        setIsCompleted(true);
      }
    };

    video.addEventListener('pause', handleSignificantEvent);
    video.addEventListener('seeked', handleSignificantEvent);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('pause', handleSignificantEvent);
      video.removeEventListener('seeked', handleSignificantEvent);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [saveProgress, onMarkComplete, isCompleted]);

  // Periodic progress saving
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      const video = videoRef.current;
      console.debug('Progress interval check:', { isPlaying, videoExists: !!video, videoDuration });
      if (video && isPlaying && videoDuration > 0) {
        const currentTime = Math.floor(video.currentTime);
        const percentWatched = (currentTime / videoDuration) * 100;
        console.debug('Progress update:', { currentTime, percentWatched });

        if (onProgressUpdate) onProgressUpdate(percentWatched);
        if (percentWatched >= 95 && onMarkComplete && !isCompleted) {
          console.debug('Marking complete at 95%');
          onMarkComplete();
          setIsCompleted(true);
        }

        // Debounce API call
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.debug('Scheduling saveProgress:', currentTime);
          saveProgress(currentTime);
        }, 1000);
      } else {
        console.debug('Progress save skipped:', { isPlaying, videoExists: !!video, videoDuration });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying, videoDuration, onProgressUpdate, onMarkComplete, saveProgress, isCompleted]);

  // Auto pause on tab switch
  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
        setShowControls(false);
        console.debug('Tab switched, saving progress:', video.currentTime);
        saveProgress(Math.floor(video.currentTime));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [saveProgress]);

  // Play/pause detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      console.debug('Video playing');
    };
    const onPause = () => {
      setIsPlaying(false);
      console.debug('Video paused, saving progress:', video.currentTime);
      saveProgress(Math.floor(video.currentTime));
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [saveProgress]);


  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
    } else {
      document.exitFullscreen().catch(err => console.error('Exit fullscreen error:', err));
    }
  }, [isFullscreen]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.volume = newMuted ? 0 : volume / 100;
      }
      return newMuted;
    });
  }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts if an input element is focused
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => setIsPlaying(false));
          } else {
            video.pause();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime += 10;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime -= 10;
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyB':
          if (onBookmark) {
            e.preventDefault();
            onBookmark(video.currentTime);
            toast.success(`Bookmarked at ${formatTime(video.currentTime)}`);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBookmark, toggleMute, toggleFullscreen]);

  // Enhanced control bar visibility
  useEffect(() => {
    const videoContainer = containerRef.current;
    if (!videoContainer) return;

    const showControlsFn = () => {
      setShowControls(true);
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
      controlTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    // Keep controls visible during interactions with sliders
    const keepControlsVisible = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.control-bar, [role="slider"]')) {
        setShowControls(true);
        if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
      }
    };

    videoContainer.addEventListener('mousemove', showControlsFn);
    videoContainer.addEventListener('mouseenter', showControlsFn);
    videoContainer.addEventListener('mouseleave', () => {
      if (isPlaying) setShowControls(false);
    });
    videoContainer.addEventListener('mousemove', keepControlsVisible);

    return () => {
      videoContainer.removeEventListener('mousemove', showControlsFn);
      videoContainer.removeEventListener('mouseenter', showControlsFn);
      videoContainer.removeEventListener('mouseleave', showControlsFn);
      videoContainer.removeEventListener('mousemove', keepControlsVisible);
      if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    };
  }, [isPlaying]);

  // Fullscreen handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);



  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue / 100;
    }
  }, []);



  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [videoDuration]);

  // Format time helper
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden cursor-pointer group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(isPlaying ? false : true)}
      >
        <video
          ref={videoRef}
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e: React.MouseEvent<HTMLVideoElement>) => e.preventDefault()}
          className="w-full h-full object-contain rounded-md z-0"
          style={{ zIndex: 0 }}
        />

        {/* Play/Pause Overlay */}
        <div className={`${isPlaying ? 'hidden' : 'flex'} absolute inset-0 bg-black/20 flex items-center justify-center z-10`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full w-16 h-16 md:w-20 md:h-20 shadow-2xl hover:scale-105 transition-all duration-200 bg-white/90 hover:bg-white"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    if (video.paused) {
                      video.play().catch(() => setIsPlaying(false));
                    } else {
                      video.pause();
                    }
                  }
                }}
              >
                {isPlaying ? (
                  <PauseCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-800" />
                ) : (
                  <PlayCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-800 ml-1" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? 'Pause' : 'Play'} (Space)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 control-bar ${showControls ? 'opacity-100' : 'opacity-0'
            } hover:opacity-100 z-10`}
        >
          {/* Seek Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime / videoDuration * 100 || 0]}
              max={100}
              step={0.1}
              className="w-full cursor-pointer"
              onValueChange={handleSeek}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 flex-1">
              {/* Play/Pause */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) {
                        if (video.paused) {
                          video.play().catch(() => setIsPlaying(false));
                        } else {
                          video.pause();
                        }
                      }
                    }}
                  >
                    {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Pause' : 'Play'} (Space)</p>
                </TooltipContent>
              </Tooltip>

              {/* Rewind */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime -= 10;
                    }}
                  >
                    <Rewind className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rewind 10s (←)</p>
                </TooltipContent>
              </Tooltip>

              {/* Fast Forward */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={() => {
                      if (videoRef.current) videoRef.current.currentTime += 10;
                    }}
                  >
                    <FastForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Forward 10s (→)</p>
                </TooltipContent>
              </Tooltip>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMuted || volume === 0 ? 'Unmute (M)' : `Volume: ${volume}% (M)`}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="w-20 hidden md:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>

              {/* Time Display */}
              <span className="text-sm font-medium whitespace-nowrap flex-1 text-center">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark */}
              {onBookmark && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={() => {
                        if (videoRef.current) {
                          onBookmark(videoRef.current.currentTime);
                          toast.success(`Bookmarked at ${formatTime(videoRef.current.currentTime)}`);
                        }
                      }}
                    >
                      📌
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bookmark (B)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Playback Speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 px-2">
                    <span className="text-sm font-medium">{playbackSpeed}x</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black text-white border-white/10">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={speed === playbackSpeed ? 'bg-accent' : 'hover:bg-white/20'}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Next/Previous */}
              {onPrevious && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={onPrevious}
                    >
                      ⬅️
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Previous</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {onNext && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                      onClick={onNext}
                    >
                      ➡️
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Next</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? 'Exit' : 'Enter'} Fullscreen (F)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}