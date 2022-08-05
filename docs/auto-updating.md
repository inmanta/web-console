[Index](./index.md)

# Auto-updating

The auto-updating mechanism is based on queries, hooks and intervals.  
A component subscribes to a query and then receives data through a state hook.

## Example

The `useContinuous` custom hook registers a task for the provided query.  
It then returns the data that is in the store now for that query.  
It also returns a retry function which manually triggers the api call again.

```typescript
const [data, retry] = queryResolver.useContinuous({
  kind: "GetResources",
  id: "123",
  service_entity: "service",
  version: 4,
});
```

## Query

A query is an object describing the data source.
Example:

```typescript
interface ResourcesQuery {
  kind: "GetResources";
  id: string;
  service_entity: string;
  version: number;
}
```

The `ResourcesQuery` describes a `resources` data source with its unique identifying properties.

## Task

A task is a unique id coupled with an effect function and an update function.  
Registering a task will invoke the effect and update on each next tick.  
As long as there are tasks, the ticks will execute after 5 seconds.  
Once all the data is resolved. We schedule a next tick to be executed after 5s.  
Flow: (5s) -> execute -> wait for all to resolve -> schedule next tick -> (5s) -> execute -> ...  
The scheduler uses nested `setTimeout`s under the hood.

## Hooks

The data requirement originates from the initialisation of components.  
So hooks are used because they are kept in sync with the component lifecycle.  
When the component is destroyed, we can execute a cleanup callback.  
In this cleanup callback, we unregister the task.

Inside the task update handler, we update the state.  
Because the components use a state hook, they are notified and rerendered with the updated state.

## Updates & Performance

A lot of components will be registering tasks.  
And a lot of components will be listening to the state.  
It is important we don't trigger unneeded rerenders when updating the state.

Each second, multiple api calls could be updating the state, potentially resulting in a lot of rerenders.  
So each component should only listen to specific data changed.  
This is handled by the uniqueness of the query combined with the `useStoreState` hook.  
Each component defines a query, and is only rerendered when data for that query changes.

## Stale data

When a task is unregistered, the state in the store is not removed.  
This way when a user revisits a view, he is immediately represented with data.  
This data then gets updated again. So initially we are showing stale data.  
This might not be an ideal strategy. We will need to see if we run into issues.
