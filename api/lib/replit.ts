/**
 * Replit Backend Integration
 * Connects to the Streamline AI YouTube-to-Shorts converter
 * Running at: https://tube-shorten-jeakins.replit.app
 */

// Base URL for Replit backend - can be overridden via env var
const REPLIT_BASE =
  process.env.REPLIT_BASE || "https://tube-shorten-jeakins.replit.app";

/**
 * Response from POST /api/process-video
 */
export interface ProcessVideoResponse {
  taskId: string;
  status: "processing";
}

/**
 * Response from GET /api/videos/:id
 */
export interface ClipStatusResponse {
  task: {
    id: string;
    sourceVideoUrl: string;
    email: string | null;
    status: "processing" | "ready" | "error";
    autoExportStatus: "pending" | "processing" | "ready" | "error";
  };
  projects: Array<{
    id: string;
    title: string;
    viralityScore: number;
    thumbnailUrl: string;
  }>;
  exports: Array<{
    id: string;
    projectId: string;
    status: "processing" | "ready" | "error";
    srcUrl: string | null;
  }>;
}

/**
 * Submits a YouTube video for AI-powered clipping
 * @param url - YouTube or video URL
 * @param email - Optional email for completion notification
 * @returns Task ID and processing status
 */
export async function processVideo({
  url,
  email,
}: {
  url: string;
  email?: string;
}): Promise<ProcessVideoResponse> {
  const endpoint = `${REPLIT_BASE}/api/process-video`;

  console.log(`[Replit] Submitting video to ${endpoint}`, { url, email });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, email }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Replit] Failed to process video:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `Failed to submit video: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log(`[Replit] Video submitted successfully:`, data);

  return data as ProcessVideoResponse;
}

/**
 * Checks the status of a clipping task
 * @param taskId - Task ID from processVideo()
 * @returns Full task state including projects and exports
 */
export async function checkClipStatus(
  taskId: string,
): Promise<ClipStatusResponse> {
  const endpoint = `${REPLIT_BASE}/api/videos/${taskId}`;

  console.log(`[Replit] Checking status for task ${taskId}`);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Replit] Failed to check status:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `Failed to check clip status: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log(`[Replit] Status check result:`, {
    taskId,
    status: data.task?.status,
    autoExportStatus: data.task?.autoExportStatus,
    projectCount: data.projects?.length || 0,
    exportCount: data.exports?.length || 0,
  });

  return data as ClipStatusResponse;
}

/**
 * Exports a specific short/project
 * @param taskId - Task ID from processVideo()
 * @param projectId - ID of the short to export
 * @returns Export job details
 */
export async function exportShort(
  taskId: string,
  projectId: string,
): Promise<{ exportId: string; status: string }> {
  const endpoint = `${REPLIT_BASE}/api/videos/${taskId}/export`;

  console.log(`[Replit] Exporting project ${projectId} for task ${taskId}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Replit] Failed to export short:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `Failed to export short: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log(`[Replit] Export initiated:`, data);

  return data;
}
