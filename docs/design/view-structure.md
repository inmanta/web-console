[Index](./index.md)

# View Structure

![View Structure](./img/view-structure.png)

Top level components are always visible. They do not depend on a specific route / page.

```
Root -> PageWrapper -> Router
```

Next is the `Router`. The Router decides based on the url which page to show.
The `Breadcrumbs` components also uses the url to show the required breadcrumbs.

```
Router -> Inventory
```

Next are page components. They are dependent on a specific route and render a specific page. (ex. Inventory)
The page component functions as a `DataProvider`. It's responsible for triggering the data layer.
Data is then passed down to child components that can visualize this data.

```
Inventory -> Table -> Row -> Button
```

# Inventory (example)

![Inventory Overlay](./img/view-structure-overlay.png)
