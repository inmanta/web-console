import { ApolloLink, Observable } from "@apollo/client";
import { interval } from "rxjs";
import type { RefetchEventManager } from "@apollo/client";

/**
 * Polling for Apollo's RefetchEventManager that waits for the network to go quiet. A poll only fires once
 * no GraphQL request is in flight and the last one finished at least the poll interval ago, so a slow query
 * gets a pause between two requests and a fresh load (first render, next page) is not refetched right away.
 */

/** How often the poll checks whether it is time to refetch. */
const CHECK_INTERVAL_MS = 500;

/**
 * Creates the pieces of the `poll` refetch event: a link that tracks the GraphQL requests in flight,
 * the source and handler for the RefetchEventManager, and a way to pause the poll.
 *
 * @example
 * const poll = createPoll(5000);
 * new ApolloClient({
 *   link: ApolloLink.from([poll.link, httpLink]),
 *   refetchEventManager: new RefetchEventManager({ sources: { poll: poll.source }, handlers: { poll: poll.handler } }),
 * });
 * // a request that takes 4.7s is refetched 5s after it finished
 */
export const createPoll = (intervalMs: number) => {
  let inFlight = 0;
  let lastSettledAt = Date.now();
  let pausedUntil = 0;

  const link = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let isSettled = false;
        const settle = () => {
          if (!isSettled) {
            isSettled = true;
            inFlight -= 1;
            lastSettledAt = Date.now();
          }
        };

        inFlight += 1;
        const subscription = forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: (error) => {
            settle();
            observer.error(error);
          },
          complete: () => {
            settle();
            observer.complete();
          },
        });

        return () => {
          settle();
          subscription.unsubscribe();
        };
      })
  );

  const source = () => interval(CHECK_INTERVAL_MS);

  const handler: RefetchEventManager.EventHandler<"poll"> = ({ client, matchesRefetchOn }) => {
    if (inFlight > 0 || Date.now() - lastSettledAt < intervalMs || Date.now() < pausedUntil) {
      return;
    }

    return client.refetchQueries({ include: "active", onQueryUpdated: matchesRefetchOn });
  };

  /** Skips every poll for the given time, e.g. to keep a local change on screen. */
  const pause = (durationMs: number) => {
    pausedUntil = Date.now() + durationMs;
  };

  return { link, source, handler, pause };
};
