# Auto-updating

The auto-updating mechanism is based on queries, hooks and intervals.  
A component subscribes to a query and then receives data through a state hook.

Example:

```typescript
// Register the subscription
dataProvider.useSubscription({ kind: "Resources", qualifier });

// Get the data that is in store now for this query
const data = dataProvider.useData({ kind: "Resources", qualifier });
```

## Query

A query is an object describing the data source.
Example:

```typescript
interface ResourcesQuery {
  kind: "Resources";
  qualifier: {
    id: string;
    environment: string;
    service_entity: string;
    version: number;
  };
}
```

The `ResourcesQuery` describes a `resources` data source with its unique identifying properties.

## Subscription

A subscription is a unique id coupled with a callback function.  
When registering a subscription the callback function is invoked once immediately.  
It is then invoked each time after the configured delay (`5000ms`).  
The subscriptions use `setInterval` under the hood.

## Hooks

The data requirement originates from the initialisation of components.  
So hooks are used because they are kept in sync with the component lifecycle.  
When the component is destroyed, we can execute a cleanup callback.  
In this cleanup callback, we cancel the subscription.

Inside the subscription handler, we update the state.  
Because the components use a state hook, they are notified and rerendered with the updated state.

## Updates & Performance

A lot of components will be registering subscriptions.  
And a lot of components will be listening to the state.  
It is important we don't trigger unneeded rerenders when updating the state.

Each second, multiple api calls could be updating the state, potentially resulting in a lot of rerenders.  
So each component should only listen to specific data changed.  
This is handled by the uniqueness of the query combinbed with the `useStoreState` hook.  
Each component defines a query, and is only rerendered when data for that query changes.

## Stale data

When a subscription is cancelled, the state in the store is not removed.  
This way when a user revisits a view, he is immediately represented with data.  
This data then gets updated again. So initially we are showing stale data.  
This might not be an ideal strategy. We will need to see if we run into issues.
