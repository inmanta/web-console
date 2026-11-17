// The one place that creates msw servers, see restrictedImports in eslint.config.js.
import { setupServer, SetupServer } from "msw/node";

let listeningServers = 0;
let fallbackListening = false;
const unmockedRequests: string[] = [];

/**
 * Creates an msw server for a test, like msw's `setupServer`, with these defaults:
 * - `listen()` makes a request without a handler fail instead of passing it through to the network.
 * - That request also fails the running test, through the `afterEach` of the test setup.
 * - While no test server listens, a request fails too, see `fallbackServer` and the test setup.
 *
 * @param handlers - the handlers the server starts with, which survive `resetHandlers()`
 * @returns the msw server
 *
 * @example
 * const server = setupTestServer(http.get("/api/v2/project", () => HttpResponse.json({ data: [] })));
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 */
export const setupTestServer = (...handlers: Parameters<typeof setupServer>): SetupServer => {
  const server = createServer("", handlers);
  const listen = server.listen;
  const close = server.close;

  server.listen = (options) => {
    stopFallbackServer();
    listen({ onUnhandledFrame: "error", ...options });
    listeningServers++;
  };

  server.close = () => {
    close();
    listeningServers--;

    if (listeningServers === 0) {
      fallbackServer.listen({ onUnhandledFrame: "error" });
      fallbackListening = true;
    }
  };

  return server;
};

/**
 * Creates an msw server that records the requests it has no handler for.
 */
const createServer = (label: string, handlers: Parameters<typeof setupServer>): SetupServer => {
  const server = setupServer(...handlers);

  server.events.on("request:unhandled", ({ request }) => {
    recordUnmockedRequest(`${request.method} ${request.url}${label}`);
  });

  return server;
};

/**
 * Listens while no test server does, from the moment the last one closes. It fails a request that
 * was sent just before, which would otherwise reach the network after its test server closed.
 */
const fallbackServer = createServer(" (no test server listening)", []);

/**
 * Stops the fallback server when a test file is done, so it doesn't answer the requests of the next
 * test file that runs in the same process.
 */
export const stopFallbackServer = (): void => {
  if (fallbackListening) {
    fallbackServer.close();
    fallbackListening = false;
  }
};

/**
 * Whether a test server listens, so it answers the requests.
 */
export const isTestServerListening = (): boolean => listeningServers > 0;

/**
 * Remembers a request that no test server answered, like "GET http://localhost:3000/api/v2/project".
 */
export const recordUnmockedRequest = (request: string): void => {
  unmockedRequests.push(request);
};

/**
 * Returns the requests that no test server answered since the last call, and forgets them.
 */
export const takeUnmockedRequests = (): string[] => unmockedRequests.splice(0);
