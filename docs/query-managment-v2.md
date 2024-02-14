# Use React-Query as main Query Management tool, which idea to move away from our own implementation

## Context and Problem Statement

Currently, we manage all of the queries to the backend ourselves, which is burdened with a lot of code scattered all around the place.
This code is hard to read, require high effort to learn the flow, possible bugs or unwanted behavior is hard to track, finally adding new queries require a lot of boilerplate code.

How to simplify management and further development of the communication with the backend?
Which 3rd party library would be the best to delegate that task to?

## Considered Options

- React Query
- RTK Query
- SWR

## Decision Outcome

Chosen option: TBA

### Consequences

TBA

## Pros and Cons of the Options

### React Query

- [Homepage](https://tanstack.com/query/latest/)
- [Example](https://tanstack.com/query/latest/docs/framework/react/examples/basic)

#### Pros

1. Has the most features available
2. Robust error handling
3. Auto Garbage Collection
4. Stale Time Configuration
5. Handy DevTools
6. More advanced mutation manipulation/configuration

#### Cons

1. some features have a steeper learning curve
2. some scenarios could require separate state-management
3. more opinionated

### useSWR

- [Homepage](https://swr.vercel.app/)
- [Example](https://swr.vercel.app/examples/basic)

#### Pros

1. The most lightweight
2. Simplest library to use
3. Fine-grained control (less opinionated)

#### Cons

1. Manual caching
2. some scenarios could require separate state-management
3. less features/configuration out-of-the-box

### RTK Query

- [Homepage](https://redux-toolkit.js.org/rtk-query/overview)
- [Example](https://redux-toolkit.js.org/rtk-query/usage/examples#kitchen-sink)

#### Pros

1. Good, because integrates seamlessly with other Redux Toolkit features

#### Cons

1. Requires a more boilerplate than competitors
2. Bad, because increases bundle Size - [source](https://redux-toolkit.js.org/rtk-query/comparison#bundle-size)
3. Bad, because has steep learning curve for developers new to Redux

### Overview

Out of most popular libraries that handle communication we have 3 possible contenders:

- React Query
- RTK Quert
- SWR

RTK Query can be filtered-out early, it heavily base itself on the Redux, which we don't use in the application, and we wouldn't like to, as it's unnecessary from the use-case of our application.

The remaining two, are both lightweight, and simple, RQ more opinionated, more feature-rich(out-of-the-box), SWR gives more control in what we can do and in what way, but with price, of less features, and requires more time and effort into creating own implementation(manual caching, simpler error handling compared to react-query, no stale time configuration)

**Personally I advocate for React query, as more opinionated would mean easier, simpler and faster adoption into our codebase, with less code that has to be managed and maintained by us, which theoretically is the goal of moving from our own Query Management, the same goes for features, but that require conversation, whether SWR doesn't have all what we need.**

## More Information

[Feature-comparison between all mentioned libraries](https://tanstack.com/query/v4/docs/framework/react/comparison)
[Comparison between SWR and React Query](https://dev.to/sakethkowtha/react-query-vs-useswr-122b)
[Another comparison between SWR and React Query](https://www.dhiwise.com/post/data-on-demand-a-smackdown-of-swr-vs-react-query)
[Comparison between RTK Query and React Query](https://www.frontendmag.com/insights/react-query-vs-rtk-query/#Pros_of_RTK_Query)

# Use Plain JUnit5 for advanced test assertions

## Context and Problem Statement

Currently, we manage all of the queries to the backend ourselves, which is burdened with a lot of code scattered all around the place.
This code is hard to read, requires high effort to learn the flow, possible bugs or unwanted behavior is hard to track, and finally adding new queries requires a lot of boilerplate code.

How to simplify management and further development of the communication with the backend?
Which 3rd party library would be the best to delegate that task to?

## Considered Options

- React Query
- RTK Query
- SWR

## Decision Outcome

Chosen option: TBA

### Consequences

TBA

## Pros and Cons of the Options

### React Query

- [Homepage](https://tanstack.com/query/latest/)
- [Example](https://tanstack.com/query/latest/docs/framework/react/examples/basic)

#### Pros

1. Has the most features available
2. Robust error handling
3. Auto Garbage Collection
4. Stale Time Configuration
5. Handy DevTools
6. More advanced mutation manipulation/configuration

#### Cons

1. some features have a steeper learning curve
2. some scenarios could require separate state management
3. more opinionated

### useSWR

- [Homepage](https://swr.vercel.app/)
- [Example](https://swr.vercel.app/examples/basic)

#### Pros
