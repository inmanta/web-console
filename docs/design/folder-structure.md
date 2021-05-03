# Folder structure

The goal is to have the general guidelines about what should go where, for example
adding subfolders for a group of components should still be possible, if it helps understanding the structure

## Proposal

The current approach, with some modifications.

```
src/
  Core/
    Domain/ - Domain entities, Query/Command interfaces
    Ports/? - interfaces for communicating with the backend
  Test/ - test data, mock implementations, testing utilities
  UI/
    Components/ - React Components used by multiple pages
      Common? - Components that have no relation to the domain entities? e.g. TreeTable, PaginationWidget
    Data/ - Implementations for the interfaces in Ports, connecting them to Domain entities (how to fetch them) and the Store (how to store them)
    Store/ - EasyPeasy/Redux store models
    Pages/ - Main Container components for the different views in the root
      Components/ - Components related to this view only
      Tabs? - Separate from Components because they are container components and to reduce nesting
```

Open questions:

- Should the Data and Store folders move out of UI? (Maybe to Infra)
- Where to put more complex test cases? (That test a whole page with DataProviders)
- Storybook stories?
- Presenters

