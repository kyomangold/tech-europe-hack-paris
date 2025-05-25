import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";
import * as React from "react";

export default function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // scroll to bottom when new transcription is added
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [combinedTranscriptions]);

  return (
    <div className="h-[37.5vh] w-full overflow-hidden">
      {/* Content */}
      <div
        ref={containerRef}
        className="h-full flex flex-col gap-2 px-2 overflow-y-auto"
      >
        {combinedTranscriptions.map((segment) => (
          <div
            id={segment.id}
            key={segment.id}
            className={`p-2 rounded-lg ${segment.role === "assistant"
              ? "bg-amber-100 text-amber-900 self-start"
              : "bg-amber-600 text-white self-end"
              }`}
          >
            {segment.text}
          </div>
        ))}
      </div>
    </div>
  );
}
