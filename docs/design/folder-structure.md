[Index](./index.md)

# Folder structure

The goal is to have the general guidelines about what should go where, but still leave some freedom for developers.
(for example adding subfolders for a group of components should still be allowed, if it helps understanding the structure)

The agreement is to roughly follow the building blocks in the folder structure.

```
src/
  Core/
    Domain/ - Domain entities, Query/Command interfaces
    Ports/ - interfaces for communicating with the backend
  Data/ - Implementations for the interfaces in Ports, connecting them to Domain entities (how to fetch them) and the Store (how to store them)
    Infra/ - Handling of Fetch API
    Routing/ - Code related to routing and urls
    Store/ - EasyPeasy/Redux store models
  Test/ - test data, mock implementations, testing utilities
  UI/
    Components/ - React Components used by multiple pages
    Pages/ - Main Container components for the different views in the root
      Components/ - Components related to this view only, optionally
    Root/ - The components that are always visible, and independent of the current page (sidebar)
```
