// The one place that creates msw servers, see restrictedImports in eslint.config.js.
import { setupServer, SetupServer } from "msw/node";

let listeningServers = 0;
const unmockedRequests: string[] = [];

/**
 * Creates an msw server for a test, like msw's `setupServer`, with these defaults:
 * - `listen()` makes a request without a handler fail instead of passing it through to the network.
 * - That request also fails the running test, through the `afterEach` of the test setup.
 * - While no test server listens, the test setup answers every request with a network error.
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
  const server = setupServer(...handlers);
  const listen = server.listen;
  const close = server.close;

  server.events.on("request:unhandled", ({ request }) => {
    recordUnmockedRequest(`${request.method} ${request.url}`);
  });

  server.listen = (options) => {
    listen({ onUnhandledFrame: "error", ...options });
    listeningServers++;
  };

  server.close = () => {
    close();
    listeningServers--;
  };

  return server;
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
