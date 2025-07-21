import ReactPlayer from "react-player";
import {
    MediaController,
    MediaControlBar,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaVolumeRange,
    MediaPlaybackRateButton,
    MediaPlayButton,
    MediaSeekBackwardButton,
    MediaSeekForwardButton,
    MediaMuteButton,
    MediaFullscreenButton,
} from "media-chrome/react";
import type { FC } from "react";

interface MediaPlayerProps {
  user?: { role: string; name: string };
  url: string;
  onEnded?: () => void;
}

const MediaPlayer: FC<MediaPlayerProps> = ({ user, url, onEnded }) => {
  return (
    <MediaController
      style={{ width: "100%", height: "100%", aspectRatio: "16/9", position: "relative" }}
      className="w-full h-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      {user && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center text-white/10 text-5xl font-bold select-none"
          style={{
            transform: "rotate(-20deg)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          {user.name}
        </div>
      )}
      <ReactPlayer
        slot="media"
        src={url}
        playing
        controls={false}
        width="100%"
        height="100%"
        style={{ width: "100%", height: "100%", padding: 0, background: "black" }}
        config={{
          html: {
            forceVideo: true,
            attributes: {
              crossOrigin: "anonymous",
              controlsList: "nodownload",
              disablePictureInPicture: true,
              playsInline: true,
            },
          },
        }}
        onEnded={onEnded}
      />
      <MediaControlBar className="bg-black/70 z-30" style={{ width: "100%" }}>
        <MediaPlayButton />
        <MediaSeekBackwardButton seekOffset={10} />
        <MediaSeekForwardButton seekOffset={10} />
        <MediaTimeRange />
        <MediaTimeDisplay showDuration remaining />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaPlaybackRateButton />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
};

export default MediaPlayer;
