/**
 * Works around Apollo's multipart reader, which cancels the response body after reading it without handling the
 * returned promise. When Apollo also aborts that request, the cancel rejects and logs an uncaught AbortError.
 */

/**
 * Wraps a multipart response so its body ends quietly when the request is aborted, instead of erroring.
 * Other responses are returned as they are.
 *
 * @example
 * const response = abortSafeResponse(await fetch(url, { signal }), signal);
 * // aborting `signal` ends the body stream without an uncaught AbortError
 */
export const abortSafeResponse = (response: Response, signal?: AbortSignal | null): Response => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.body || !contentType.startsWith("multipart/mixed")) {
    return response;
  }

  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    pull: async (controller) => {
      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        if (signal?.aborted) {
          controller.close();
        } else {
          controller.error(error);
        }
      }
    },
    cancel: (reason) => reader.cancel(reason).catch(() => undefined),
  });

  return new Response(body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
};
