[Index](./index.md)

# Notes

## ARIA role `cell` vs `gridcell`

When querying the **DOM** during testing with **jsdom**, it is sometimes not obvious what `role` is assigned to an element.  
Usually we use Chrome Devtools to lookup an element and find its `role`.  
For the `td` element, the `role` assigned to it by Chrome was `gridcell`.  
But in **jsdom** the `role` assigned to the element was `cell`.
This might save some time and frustrations in the future.

## Bypass CORS issues

When for some reason you get CORS during local development, you can bypass this with a proxy.  
`local-cors-proxy` is a simple tool that let's you do just that. (<https://www.npmjs.com/package/local-cors-proxy>)

```bash
lcp --proxyUrl [API_BASE_URL]
```

This is however only a temporary solution. You should fix the cors problem... I mean core problem.

## Pruning unused code

TypeScript by itself can detect unused code. But once you export it, TypeScript no longer cares about it.  
The tool `ts-prune` looks for unused exports. Some of these exports can be removed.  
Some can not be removed.

You can list the unused exports by running:

```bash
yarn ts-prune
```

## Select vs Dropdown (Patternfly)

These components sort of do the same thing. But Select is more powerfull.  
To do a selection in a dropdown, you need to use `event.target.innerText`.  
This is not a good idea because `innerText` is not implemented in `jsdom`.  
So code using `innerText` will not work in a test.

Never use Dropdown for selection.  
Use it for actions that after the click move away from the component.  
Use Select for selecting stuff.  
See <https://www.patternfly.org/v4/components/select/design-guidelines>.

## Async timers in Jest

- <https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function>
- <https://github.com/facebook/jest/issues/2157>

## JSDOM & screen width

Jest uses JSDOM. JSDOM defines the window innerWidth and innerHeight to be 1024 x 768 by default.
So during a test, the application is basically rendered in memory in a window with dimensions 1024 x 768.
When writing a test for a component that behaves diffently based on screen width, remember the default dimensions.
You can change the dimensions by setting the window properties and triggering a resize event.

```ts
// Change the viewport to 500px.
window = Object.assign(window, { innerWidth: 500 });

// Trigger the window resize event.
window.dispatchEvent(new Event("resize"));
```

## Minimum browser versions

We decided to use the last 2 versions of the following browsers: Chrome, Firefox, Safari, Edge.
The main reasons for this are:

- Patternfly, the component library we use also only supports these browsers
- improving security
- keeping up to date with the new developments of the browser APIs

Since we only support these browser versions, the target of the typescript compiler is also set to ES2020.

## ZIP Archive

library for archive handling: <https://stuk.github.io/jszip/>
library for saving a file: <https://www.npmjs.com/package/file-saver>

These are used for downloading the support archive.

## Using a `<Link />` component vs `useNavigateTo()`

You should always try to use the `<Link />` component because this actually creates an anchor element in the html.
This allows right clicking the link and other browser behaviour.

You should only use `useNavigateTo` when you need to programmatically change the url.

## Package cleanup

We publish the packages of new development versions to the github package registry.
The jenkins job to release a new dev version of the web-console also cleans up older dev versions, by calling the `clean_up_packages` script in this repository.
This will remove dev versions that were published more than 30 days ago, by using the github GraphQL API.

## Url state handling

The state of a page may be saved to the url query parameters by using the `useUrlState` and related hooks. This usually includes the expansion state, filters, sorting and paging parameters, but other kinds of component state may also be saved to the url if deemed useful. The two main goals of saving the state to the url are:

1. Shareability: a full link with all parameters can be bookmarked or sent to others
2. Context: when drilling down - navigating to pages that are under the same 'main' page with regards to breadcrumbs - the state of the parent pages, that has been saved to the url, is kept. This makes the navigation clearer - when going back the user can see exactly where they started, and continue from there.
When going back to a parent page, the state of the child page is not kept. The url state is fully reset when navigating to another page via the sidebar.

Under the hood, these hooks are built on the `useLocation` and `useHistory` hooks from [react-router](https://v5.reactrouter.com/), and use [qs](https://www.npmjs.com/package/qs) for the serialization and deserialization of the url parameters.

Note that the values saved to the url are not checked against the contents of the state store (except for the environment id, which uses a different mechanism). This means that the url can contain items that are outdated (for example: row x is extended, the row is removed in the backend and thus not present after the next auto-update. The id of the row may still be saved to the url). These items are disregarded but not removed explicitly (until they are removed by the navigation).

Currently the url is not shortened, the parameters are written to the url as they are present in the components, this can be optimized if the length of the url becomes a problem.

## Syntax highlighting

The `CodeHighlighter` component is responsible for the syntax highlighting that we use on several pages. It offloads the highlighting logic to [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter).
We chose a custom component instead of the Patternfly `CodeBlock` component because the Pattenfly one takes up more screen real estate (actions on top in a mostly empty row, instead of on the side), and it's also missing some features that we could include in the custom component (e.g., line numbers, highlighting according to different languages).
