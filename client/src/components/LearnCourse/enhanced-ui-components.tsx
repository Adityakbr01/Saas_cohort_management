"use client"

import { useState } from "react"
import {
  Bell,
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Settings2,
  Download,
  Share2,
  Heart,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EnhancedVideoPlayerProps {
  title: string
  duration: string
  currentTime?: string
  isPlaying?: boolean
  onPlayPause?: () => void
  onSeek?: (time: number) => void
  onVolumeChange?: (volume: number) => void
  onSpeedChange?: (speed: number) => void
  className?: string
}

export function EnhancedVideoPlayer({
  title,
  duration,
  currentTime = "0:00",
  isPlaying = false,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  className,
}: EnhancedVideoPlayerProps) {
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    setIsMuted(newVolume[0] === 0)
    onVolumeChange?.(newVolume[0])
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onVolumeChange?.(isMuted ? volume[0] : 0)
  }

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed)
    onSpeedChange?.(speed)
  }

  return (
    <TooltipProvider>
      <Card className={cn("overflow-hidden shadow-lg group", className)}>
        <CardContent className="p-0">
          <div
            className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video Placeholder */}
            <img src="/placeholder.svg?height=400&width=800" alt={title} className="w-full h-full object-cover" />

            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full w-16 h-16 md:w-20 md:h-20 shadow-2xl hover:scale-105 transition-all duration-200 bg-white/90 hover:bg-white"
                    onClick={onPlayPause}
                  >
                    {isPlaying ? (
                      <PauseCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-800" />
                    ) : (
                      <PlayCircle className="h-8 w-8 md:h-10 md:w-10 text-gray-800 ml-1" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "Pause" : "Play"} (Space)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enhanced Controls */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[25]}
                  max={100}
                  step={1}
                  className="w-full cursor-pointer"
                  onValueChange={(value) => onSeek?.(value[0])}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 p-2"
                        onClick={onPlayPause}
                      >
                        {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlaying ? "Pause" : "Play"} (Space)</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Rewind */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
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
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
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
                          {isMuted || volume[0] === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMuted ? "Unmute" : "Mute"} (M)</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="w-20 hidden md:block">
                      <Slider
                        value={isMuted ? [0] : volume}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {currentTime} / {duration}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 px-2">
                        <span className="text-sm font-medium">{playbackSpeed}x</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={speed === playbackSpeed ? "bg-accent" : ""}
                        >
                          {speed}x
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Settings */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Fullscreen */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 p-2"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFullscreen ? "Exit" : "Enter"} Fullscreen (F)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            {false && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

interface EnhancedSearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onFilter?: () => void
  onSort?: () => void
  className?: string
}

export function EnhancedSearchBar({
  placeholder = "Search lessons, resources, and content...",
  onSearch,
  onFilter,
  onSort,
  className,
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch?.(value)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-colors"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onFilter} className="bg-background/50 backdrop-blur-sm">
              <Filter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filter content</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onSort} className="bg-background/50 backdrop-blur-sm">
              <SortAsc className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

interface NotificationBellProps {
  count?: number
  onClick?: () => void
}

export function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="relative hover:bg-muted/50 transition-colors" onClick={onClick}>
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {count > 99 ? "99+" : count}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{count > 0 ? `${count} new notifications` : "No new notifications"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface LessonActionsProps {
  isCompleted?: boolean
  isBookmarked?: boolean
  isLiked?: boolean
  onComplete?: () => void
  onBookmark?: () => void
  onLike?: () => void
  onShare?: () => void
  onDownload?: () => void
  className?: string
}

export function LessonActions({
  isCompleted = false,
  isBookmarked = false,
  isLiked = false,
  onComplete,
  onBookmark,
  onLike,
  onShare,
  onDownload,
  className,
}: LessonActionsProps) {
  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onComplete}
              className={cn(
                "flex-1 md:flex-none transition-all duration-200",
                isCompleted ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" : "bg-primary hover:bg-primary/90",
              )}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCompleted ? "Mark as incomplete" : "Mark as complete"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={onBookmark}
              className={cn(
                "flex-1 md:flex-none bg-transparent transition-all duration-200",
                isBookmarked && "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
              )}
            >
              <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} />
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isBookmarked ? "Remove bookmark" : "Bookmark lesson"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={onLike}
              className={cn(
                "flex-1 md:flex-none bg-transparent transition-all duration-200",
                isLiked && "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
              )}
            >
              <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
              Like
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isLiked ? "Unlike" : "Like"} this lesson</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onDownload} className="flex-1 md:flex-none bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download lesson materials</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden bg-transparent">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="h-4 w-4 mr-2" />
              Discuss
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onShare} className="hidden md:flex bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this lesson</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
