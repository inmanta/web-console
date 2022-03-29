[Index](./index.md)

# Folder structure

The goal is to have the general guidelines about what should go where, but still leave some freedom for developers.
(for example adding subfolders for a group of components should still be allowed, if it helps understanding the structure)

The agreement is to roughly follow the building blocks in the folder structure, but to also put the related files together into slices.
If a domain type or query is used by multiple slices, it should either be moved to the common folders, or alternatively the slices can also be merged.
So a slice is not necessarily a single page (it might be a smaller or larger unit as well).
A slice also doesn't necessarily has to have all of the { Core, Data, UI} folders.

```
src/
  Core/ - Common data structures and interfaces
    Query/ - Query definitions
    Command/ - Command definitions
    Contracts/ - All interfaces that represent a contract
    Domain/ - Entities
    Language/ - Language extensions & isolated implementations
  Data/ - common classes related to the Data Layer
    API/ - Classes for communicating with the REST API (based on Fetch API)
    Auth/ - Auth related classes
    Managers/ - Implementations for data contracts for the domain entities
    Store/ - Redux store slices for common entities
  Test/ - common test data, mock implementations, testing utilities
  UI/ (common) Components
    Components/ - React Components used by multiple pages
    Root/ - The components that are always visible, and independent of the current page (sidebar)
    Routing/ - Code related to routing and urls
  Slices/ (repeat the 3 layers for each slice)
    <SliceName>
        Core (slice specific)
            Query & Command
            any types or contracts
        Data (slice specific)
            Managers
            transformations
            implementations
            store slice definition
        UI (slice specific)
            Components
```
