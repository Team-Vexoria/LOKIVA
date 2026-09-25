import React, { useRef, useEffect } from 'react';

interface ScrollTriggeredVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function ScrollTriggeredVideo({ src, poster, className = '' }: ScrollTriggeredVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start strictly in paused state
    video.pause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          // Play smoothly once user scrolls down to this element
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay policies require muted playback
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          // Pause when user scrolls back up
          video.pause();
        }
      },
      {
        threshold: [0, 0.35, 0.7],
      }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF7F2] ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

export default ScrollTriggeredVideo;
