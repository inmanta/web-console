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

## EnvironmentModifier

EnvironmentModifier in the web-console is used to access up-to-date data of currently selected Environment across application and it can be accesed through `DependencyContext` either by existing functions in the Modifier or through extending them for the needed use-case. 

Data accessed through EnvironmentModifier is stored in the global store  and accessed through environment id that set by `setEnvironment()` function. Despite the name updating and modifing environament data is outside of the capabilities of said Modifier.

Currently functions available through Modifier beside one mentioned above are:

    -useIsHalted()

    -useIsServerCompileEnabled()

    -useIsProtectedEnvironment()

    -useIsExpertModeEnabled()
.

Those functions returns values of certain settings for selected environment that are used to fullfil lice-cycles for Views and Components across application, for example `useIsExpertModeEnabled()` returns value of `enable_lsm_expert_mode` setting which then is used to handle visibility of functinalites restricted by given expert mode.

Logic that serves settings values to the application currently is implemented only for boolean attributes, so non-booleans values can be accessed in the current state of EnvironmentModifier and if needed functionalities have to be extended and should be done inside of the Modifier body.
