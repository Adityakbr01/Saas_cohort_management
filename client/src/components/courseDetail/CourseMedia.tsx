import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";
import { useState } from "react";
import Player from "../MediaPlayer";

type Course = {
  title: string;
  thumbnail: string;
  demoVideo: string;
};

function CourseMedia({
  course,
  bookmarked,
  toggleBookmark,
}: {
  course: Course;
  bookmarked: boolean;
  toggleBookmark: () => void;
}) {
  const [showPlayer, setShowPlayer] = useState(false);
  let { demoVideo } = course;

  demoVideo = demoVideo.replace(/\.mp4$/, ".m3u8");

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group w-full">
      {showPlayer ? (
        <Player url={demoVideo} />
      ) : (
        <>
          <img
            src={course.thumbnail}
            srcSet={`${course.thumbnail}?w=320 320w, ${course.thumbnail}?w=640 640w, ${course.thumbnail}?w=1280 1280w`}
            sizes="(max-width: 640px) 320px, (max-width: 1280px) 640px, 1280px"
            alt={`${course.title} course thumbnail`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              size="lg"
              className="bg-white/90 text-black hover:bg-white hover:scale-105 transition-transform focus:ring-2 focus:ring-primary"
              aria-label="Watch course demo video"
              tabIndex={0}
              onClick={() => setShowPlayer(true)}
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>

            {/* Bookmark Button */}
            <motion.button
              onClick={toggleBookmark}
              whileTap={{ scale: 0.8, rotate: -15 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white/100 p-2 rounded-full shadow-md transition-all"
              aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <AnimatePresence mode="wait">
                {bookmarked ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 900, damping: 60 }}
                  >
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bookmark"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ type: "spring", stiffness: 900, damping: 75 }}
                  >
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

export default CourseMedia;
