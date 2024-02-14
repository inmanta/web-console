# Use React-Query as main Query Management tool, which idea to move away from our own implementation

## Context and Problem Statement

Currently, we manage all of the queries to the backend ourselves, which is burdened with a lot of code scattered all around the place.
The code is hard to read, requires high effort to learn the flow, possible bugs or unwanted behavior is hard to track, finally adding new queries requires a lot of boilerplate code.

How to simplify management and further development of the communication with the backend?
Which 3rd party library would be the best to delegate that task to?

## Considered Options

- React Query
- RTK Query
- SWR

## Decision Outcome

TBA

### Positive Consequences <!-- optional -->

TBA

### Negative Consequences <!-- optional -->

TBA

## Pros and Cons of the Options

### React Query

- [Homepage](https://tanstack.com/query/latest/)
- [Example](https://tanstack.com/query/latest/docs/framework/react/examples/basic)

- Good, because has the most features available
- Good, because has obust error handling
- Good, because has uto Garbage Collection
- Good, because has stale Time Configuration
- Good, because has useful DevTools
- Good, because has ore advanced mutation manipulation/configuration
- Bad, because some features have a steeper learning curve
- Bad, because some scenarios could require separate state-management
- Bad, because it is more opinionated

### useSWR

- [Homepage](https://swr.vercel.app/)
- [Example](https://swr.vercel.app/examples/basic)

- Good, because is the most lightweight
- Good, because is Simplest library to use
- Good, because offers Fine-grained control (less opinionated)
- Bad, because require manual caching
- Bad, because some scenarios could require separate state-management
- Bad, because has less features/configuration out-of-the-box

### RTK Query

- [Homepage](https://redux-toolkit.js.org/rtk-query/overview)
- [Example](https://redux-toolkit.js.org/rtk-query/usage/examples#kitchen-sink)

- Good, because integrates seamlessly with other Redux Toolkit features
- Bad, because Requires a more boilerplate than competitors
- Bad, because increases bundle Size - [source](https://redux-toolkit.js.org/rtk-query/comparison#bundle-size)
- Bad, because has steep learning curve for developers new to Redux

## Overview

Out of most popular libraries that handle communication we have 3 possible contenders:

- React Query
- RTK Query
- SWR

RTK Query can be filtered out early, it heavily bases itself on the Redux, which we don't use in the application, and we wouldn't like to, as it's unnecessary from the use-case of our application.

The remaining two, are both lightweight, and simple, RQ more opinionated, more feature-rich(out-of-the-box), SWR gives more control in what we can do and in what way, with fewer features, which results with more time and effort spent to create our own implementation(manual caching, simpler error handling compared to react-query, no stale time configuration)

**Personally I advocate for React query, as more opinionated would mean easier, simpler and faster adoption into our codebase, with less code that has to be managed and maintained by us, which theoretically is the goal of moving from our own Query Management, the same goes for features, but that requires conversation, whether SWR doesn't have all that we need.**

## Links

[Feature-comparison between all mentioned libraries](https://tanstack.com/query/v4/docs/framework/react/comparison)
[Comparison between SWR and React Query](https://dev.to/sakethkowtha/react-query-vs-useswr-122b)
[Another comparison between SWR and React Query](https://www.dhiwise.com/post/data-on-demand-a-smackdown-of-swr-vs-react-query)
[Comparison between RTK Query and React Query](https://www.frontendmag.com/insights/react-query-vs-rtk-query/#Pros_of_RTK_Query)
