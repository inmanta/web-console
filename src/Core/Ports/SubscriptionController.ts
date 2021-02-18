/**
 * The SubscriptionController handles subscriptions.
 *
 * A subscription needs a unique ID so it can be cancelled
 * when it is no longer needed. When a subscription starts,
 * the handler is invoked once immediately. Then it is invoked
 * everytime the delay has passed.
 */
export interface SubscriptionController {
  subscribeTo(id: string, handler: () => void): boolean;
  unsubscribeFrom(id: string): void;
}
