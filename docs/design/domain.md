[Index](./index.md)

# Domain

## Entities

Entities relate to all different data requirements within the application.  
These are all different entities within our design:

- Projects
- Environments
- Services
- Service
- Instances
- Resources
- Events
- Logs
- Config
- Diagnostics
- ...

Each entity has a Redux state slice where it is stored.

Each entity has either a Query, a Command or both.

- A `Query` needs a `QueryManager` which needs a `StateHelper` and a `Fetcher`
- A `Command` needs a `CommandManager` which needs a `StateHelper` and a `Poster`

All of these classes are entity specific.

## StateHelper

The `StateHelper` is responsible for getting and setting state.  
It doesn't own any data because we keep the data in a redux store instance.  
It's an adapter around the redux store for 1 specific entity.

## QueryManager

The `QueryManager` is reponsible for handling the query and its related data.  
It uses the `StateHelper` and `Fetcher` to update data.

## CommandManager

The `CommandManager` is reponsible for handling the command and its related data.  
It uses the `StateHelper` and `Poster` to save and update data.

## Fetcher

The `Fetcher` is responsible for getting data from the API.

## Poster

The `Poster` is responsible for posting data to the API.
