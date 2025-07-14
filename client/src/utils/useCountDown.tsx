import { useEffect, useState } from "react";

export function useCountdown(
  endTime: string | null,
  onComplete?: () => void,
  refetch?: () => void
) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    if (!endTime) return;

    let animationFrame: number;

    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");

        // ✅ Trigger optional callbacks
        if (onComplete) onComplete();
        if (refetch) refetch();

        // ✅ Reload page automatically
        window.location.reload();

        return; // 🛑 Stop further updates
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      animationFrame = requestAnimationFrame(updateCountdown);
    };

    animationFrame = requestAnimationFrame(updateCountdown);
    return () => cancelAnimationFrame(animationFrame);
  }, [endTime, onComplete, refetch]);

  return timeLeft;
}

export default useCountdown;
