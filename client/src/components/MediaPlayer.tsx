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




//"@ts-expect-error
export default function Player({ user, url }: { user?: { role: string, name: string }; url: string }) {

    return (
        <MediaController
            style={{
                width: "100%",
                aspectRatio: "16/9",
            }}
        >

           {user && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center text-white/10 text-5xl font-bold select-none"
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
                playing={true}
                controls={false}
                style={
                    {
                        width: "100%",
                        height: "100%",
                        padding: "0",
                        "--controls": "none",
                    } as React.CSSProperties
                }
                //"@ts-expect-error
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
            ></ReactPlayer>
            <MediaControlBar className="bg-black/70 z-30">
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
}
