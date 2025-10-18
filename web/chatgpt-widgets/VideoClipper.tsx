import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWidgetProps } from "./utils/hooks";

interface ClipJobResult {
  taskId: string;
  status: string;
  email?: string;
  url?: string;
  submittedAt?: string;
  readyCount?: number;
}

const VideoClipperWidget = () => {
  const jobResult: ClipJobResult = useWidgetProps();

  console.log("VideoClipper widget received:", jobResult);

  if (!jobResult || !jobResult.taskId) {
    return (
      <Card className="w-full text-gray-900">
        <CardContent className="p-6">
          <p className="text-gray-500">No clip job data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate time elapsed
  const getTimeElapsed = () => {
    if (!jobResult.submittedAt) return "Just now";
    const submitted = new Date(jobResult.submittedAt);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  // Determine if video is ready or still processing
  const isProcessing = jobResult.status === "processing";
  const isReady = jobResult.status === "ready";

  // Dynamic content based on status
  const statusText = isReady ? "All shorts ready for download" : "Converting video...";
  const pipelineStatus = isReady ? "All Shorts Ready For Download" : "Converting Video...";
  const progressBarColor = isReady ? "from-green-500 to-green-600" : "from-orange-400 to-orange-500";
  const progressBarWidth = isReady ? "100%" : "30%";
  const shortsCount = isReady ? (jobResult.readyCount ?? "5") : "0";

  return (
    <Card className="w-full bg-gray-900 text-white max-w-2xl mx-auto border-gray-700">
      <CardHeader className="pb-3">
        {/* Title with Status Badge */}
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">
            Auto-Convert & Export
          </CardTitle>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="text-sm">⏱️</span>
            Pending
          </span>
        </div>

        {/* Video URL */}
        {jobResult.url && (
          <div className="mt-2">
            <a
              href={jobResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-blue-400 hover:underline break-all"
            >
              {jobResult.url}
            </a>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Progress Section */}
        <div>
          <p className="text-sm font-medium text-white mb-2">
            {statusText}
          </p>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressBarColor} rounded-full transition-all duration-500`}
              style={{ width: progressBarWidth }}
            ></div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {/* Pipeline Status */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Pipeline Status
            </p>
            <p className="text-sm font-semibold text-white">
              {pipelineStatus}
            </p>
          </div>

          {/* Submitted */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Submitted
            </p>
            <p className="text-sm font-semibold text-white">
              {getTimeElapsed()}
            </p>
          </div>

          {/* Task ID */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Task ID
            </p>
            <p className="text-sm font-mono font-semibold text-white truncate">
              {jobResult.taskId.substring(0, 12)}...
            </p>
          </div>

          {/* Shorts Generated */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Shorts Generated
            </p>
            <p className="text-sm font-semibold text-white">
              {shortsCount}
            </p>
          </div>
        </div>

        {/* Email Confirmation Badge */}
        {jobResult.email && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📧</span>
              <span className="font-semibold text-green-300">Email Notification Set</span>
            </div>
            <p className="text-sm text-gray-300">
              We'll send your clips to:{" "}
              <span className="font-mono font-semibold text-green-400">{jobResult.email}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              The email will include links to view and download all your clips
            </p>
          </div>
        )}

        {/* Status Link */}
        <div className="pt-3 border-t border-gray-700">
          <a
            href={`https://tube-shorten-jeakins.replit.app/details/${jobResult.taskId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>View detailed status page</span>
            <span>→</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoClipperWidget;
