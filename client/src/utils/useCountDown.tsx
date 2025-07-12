import { useEffect, useState } from "react";

export function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    if (!endTime) return;

    let animationFrame: number;

    const updateCountdown = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = Math.max(end - now, 0);

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

    updateCountdown();
    return () => cancelAnimationFrame(animationFrame);
  }, [endTime]);

  return timeLeft;
}

export default useCountdown;