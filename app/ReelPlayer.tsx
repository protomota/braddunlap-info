"use client";

import { useEffect, useRef, useState } from "react";

/* A film streamed (HLS) from Cloudflare R2 at media.protomota.com. Only the
   poster loads up front; the stream (and hls.js, where the browser can't play
   HLS itself) loads on the first click. Safari and iOS play HLS natively. If
   the stream can't play, it falls back to the same film as a plain MP4, or to
   a privacy-enhanced YouTube embed when the film has one. */
export default function ReelPlayer({
  src,
  mp4,
  youtubeId,
  title,
  poster,
}: {
  src: string;
  mp4?: string;
  youtubeId?: string;
  title: string;
  poster: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"poster" | "hls" | "mp4" | "youtube">("poster");

  useEffect(() => {
    if (mode !== "hls") return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    let cancelled = false;
    let destroy = () => {};
    const fallback = () => !cancelled && setMode(mp4 ? "mp4" : youtubeId ? "youtube" : "poster");
    const start = () => video.play().catch(() => {});
    video.addEventListener("error", fallback);
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      start();
    } else {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) return fallback();
          // pick the rendition by player size, so 4K only loads on big or retina screens
          const hls = new Hls({ capLevelToPlayerSize: true });
          destroy = () => hls.destroy();
          hls.on(Hls.Events.MANIFEST_PARSED, start);
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) fallback();
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        })
        .catch(fallback);
    }
    return () => {
      cancelled = true;
      video.removeEventListener("error", fallback);
      destroy();
    };
  }, [mode, src, mp4, youtubeId]);

  if (mode === "hls") {
    return <video ref={videoRef} poster={poster} controls playsInline aria-label={title} />;
  }
  if (mode === "mp4" && mp4) {
    return <video src={mp4} poster={poster} controls autoPlay playsInline aria-label={title} />;
  }
  if (mode === "youtube" && youtubeId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&vq=hd1080`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="reel-poster" onClick={() => setMode("hls")} aria-label={`Play ${title}`}>
      <img src={poster} alt="" width={1280} height={720} loading="lazy" decoding="async" />
      <span className="reel-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
    </button>
  );
}
