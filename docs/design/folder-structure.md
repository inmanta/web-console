# Folder structure

The goal is to have the general guidelines about what should go where, for example
adding subfolders for a group of components should still be possible, if it helps understanding the structure

## Proposal

The current approach, with some modifications.

```
src/
  Core/
    Domain/ - Domain entities, Query/Command interfaces
    Ports/ - interfaces for communicating with the backend
  Data/ - Implementations for the interfaces in Ports, connecting them to Domain entities (how to fetch them) and the Store (how to store them)
    Infra/ - Handling of Fetch API
    Store/ - EasyPeasy/Redux store models
    Url/ - Code related to routing and urls
  Test/ - test data, mock implementations, testing utilities
  UI/
    Components/ - React Components used by multiple pages
    Pages/ - Main Container components for the different views in the root
      Components/ - Components related to this view only, optionally
    Root/ - Applayout
  
```
