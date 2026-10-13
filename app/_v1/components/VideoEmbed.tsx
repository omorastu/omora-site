/**
 * Usage once you've got a video recorded:
 *   <VideoEmbed url="https://www.youtube.com/embed/XXXXXXXXX" />   (YouTube — use the /embed/ link, not the watch link)
 *   <VideoEmbed url="https://player.vimeo.com/video/XXXXXXXXX" />  (Vimeo)
 *   <VideoEmbed url="/founders-intro.mp4" native />                (self-hosted file, dropped in /public)
 *
 * Leave url empty (default) and it shows a clear placeholder instead of a
 * broken embed — safe to ship before the video exists.
 */
export function VideoEmbed({
  url = "",
  native = false,
}: {
  url?: string;
  native?: boolean;
}) {
  if (!url) {
    return (
      <div className="aspect-video rounded-lg border border-dashed border-line bg-raised/40 flex flex-col items-center justify-center text-center px-6">
        <div className="w-14 h-14 rounded-full border-2 border-brass-dim flex items-center justify-center mb-4">
          <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-brass ml-1" />
        </div>
        <p className="text-ink text-sm font-medium">Video coming soon</p>
        <p className="text-muted text-xs mt-1 max-w-xs">
          A short intro from the two of us — who we are and what we build.
          Drop the video URL into{" "}
          <code className="font-mono">{"<VideoEmbed url=\"...\" />"}</code>{" "}
          once it's recorded.
        </p>
      </div>
    );
  }

  if (native) {
    return (
      <video
        controls
        className="w-full aspect-video rounded-lg border border-line bg-raised"
        src={url}
      />
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden border border-line">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Omora — founders introduction"
      />
    </div>
  );
}
