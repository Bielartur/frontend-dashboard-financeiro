import { getAccessToken, BASE_URL } from "./apiRequests";

interface StreamingOptions {
  onProgress?: (status: string, message: string) => void;
  method?: "GET" | "POST";
  body?: any;
}

export async function streamingRequest(
  endpoint: string,
  options: StreamingOptions = {}
): Promise<void> {
  const { onProgress, method = "POST", body } = options;

  const baseUrl = BASE_URL;
  const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: HeadersInit = {
    "Authorization": `Bearer ${getAccessToken()}`
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    // Try to read error message if possible
    let errorMsg = "Erro na requisição";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last chunk if it's incomplete
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            // Expecting { status: string, message: string }
            if (onProgress && data.status) {
              onProgress(data.status, data.message);
            }
          } catch (e) {
            console.error("Error parsing stream line:", line, e);
          }
        }
      }
    }
  } catch (err) {
    console.error("Stream reading error:", err);
    throw err;
  }
}
