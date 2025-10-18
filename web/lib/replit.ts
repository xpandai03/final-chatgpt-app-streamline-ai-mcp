// api/lib/replit.ts
export type ProcessVideoInput = { url: string; email?: string };

export async function processVideo(
  input: ProcessVideoInput,
  opts?: { signal?: AbortSignal }
) {
  const base = process.env.REPLIT_BASE!;
  const res = await fetch(`${base}/api/process-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // If you add auth later:
      // "Authorization": `Bearer ${process.env.REPLIT_API_KEY}`,
    },
    body: JSON.stringify(input),
    signal: opts?.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Replit /process-video failed (${res.status}): ${text || "No body"}`
    );
  }
  return (await res.json()) as { taskId: string; status: string; detailsUrl?: string };
}