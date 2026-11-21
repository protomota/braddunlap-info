"use client";

import { useState } from "react";

/* A video that plays from YouTube. Only our own poster loads up front; the
   privacy-enhanced YouTube player loads on the first click. */
export default function ReelPlayer({
  youtubeId,
  title,
  poster,
}: {
  youtubeId: string;
  title: string;
  poster: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="reel-poster" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
      <img src={poster} alt="" width={1280} height={720} loading="lazy" decoding="async" />
      <span className="reel-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
    </button>
  );
}
