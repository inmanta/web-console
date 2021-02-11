export interface SubscriptionController {
  subscribeTo(id: string, handler: () => void): boolean;
  unsubscribeFrom(id: string): void;
}
