[Index](./index.md)

# Environment data

## Introduction

The main areas where the frontend uses the environment data are:

- the data layer (communcation with the backend)
- the UI itself (showing the user which environment are they working in, and the status of it)
- the url, for shareability

## Analysis

The following components have queries related to environments

| Index  | Query | Component | Comment  |
| ------ | ----- | --------- | -------- |
| 1 | Environment list, no details, one time | `Initializer` | Consumed by `EnvironmentHandler` |
| 2 | Environment list, no details, one time | `EnvironmentSelector` |  |
| 3 | Environment get, no details, continuous | `EnvironmentControls` | Updates on `Halt/Resume` |
| 4 | Environment list, with details, one time | `HomePage` | Rerendered when a new environment is created  |
| 5 | Environment get, with details, one time | `EditEnvironment` tab | Updates when submitting |

Out of these 1 and 2 happen on every page reload (so not while navigating, only on a full page reload), and 3 happens continuously on every page that requires an environment.

To make sure that queries that don't need the details don't overwrite the results of those that do, separate slices have been introduced for this data.

Introducing these different slices for the separate components leads to a situation where this data is very much like local state - but stored in Redux, mostly for consistency and the updates (which are more complex, because more slices might have to be updated after an action).

## Possible improvements

1. Merge the environment list slices, and always request the details - it would mean a bit more traffic, but easier updates and bookkeeping of this data in general
2. Allow the `EnvironmentSelector` to start with `stale` data, which in practice is requested only a
few milliseconds earlier - this would introduce some complexity and might not worth the gain
3. Maybe rename the query or the slice for the continuous Environment get call, it's main goal is only to check the `halted` state
