[Index](./index.md)

# Folder structure

The goal is to have the general guidelines about what should go where, but still leave some freedom for developers.
(for example adding subfolders for a group of components should still be allowed, if it helps understanding the structure)

The agreement is to roughly follow the building blocks in the folder structure.

```
src/
  Core/
    Domain/ - Domain entities, Query/Command interfaces
    Contracts/ - All interfaces that represent a contract
    Language/ - Language extensions & isolated implementations
  Data/ - All classes related to the Data Layer
    Components/ - Implementations for data contracts for each component. (how to fetch and store the Domain Entities)
    API/ - Classes for communicating with the REST API (based on Fetch API)
    Auth/ - Auth related classes
    Store/ - Redux store slices
  Test/ - test data, mock implementations, testing utilities
  UI/
    Routing/ - Code related to routing and urls
    Components/ - React Components used by multiple pages
    Pages/ - Main Container components for the different views in the root
      Components/ - Components related to this view only, optionally
    Root/ - The components that are always visible, and independent of the current page (sidebar)
```
