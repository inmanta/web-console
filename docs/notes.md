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

### QS parser

__25-10-2022__
Currently, the [*qs* ](https://www.npmjs.com/package/qs) library is being used to parse the query into a stateObject. The library allows you to pass in an arrayLimit in the parsing method. When the limit is reached, the query string will be transformed into an object instead of an array. The current limitation is set to `200`. This limit is only applied to a list of queries of the same level.

Example: 

`http://example.com?fruits=Banana&fruits=Apple`

Will be parsed as : 

`{ fruits: [ 'Banana', 'Apples' ] }`

If the arrayLimit is set to `2`, on the third fruit, the parser will change the fruits Array into a fruits Object. This behaviour is built-in the third party we are using, and cannot be overriden. 

`http://example.com?fruits=Banana&fruits=Apple&fruits=Oranges`

Will be parsed as : 

`{ fruits: { 1:'Banana', 2:'Apples', 3:'Oranges' } }`

When this occurs, the app is getting an Object instead of an Array at the place it calls `fruits` and will throw an error. 

Concretely this means that when a user clicks 201 logs open on the same page, that limit will be reached and result in an error that's being caught by the ErrorBoundary component. 

__Decission__ 
The limit is set to 200, and before the app would even throw, the user would have to click 201 elements of same the state-type (so in the case of the example above, 201 fruits.) The limitation is only applied on lists of the same level. Nested elements aren't affected and each level will have it's own limit of 200 length. 

The effort of changing and catching the unwanted Objects and changing them to Arrays is too big for the few occasions this issue might arise. The limit could be set to a higher number, but this isn't something we should do lightly. Very long urls can cause issues such as DOS. 200 is already a very big number. 

If the problem is being noticed and the app crashes for this specific reason, we can investigate how to prevent it while preserving performance and security. 

__Related tickets__
- [#3869](https://github.com/inmanta/web-console/issues/3869) Browser crashes when url keeps growing
- [#2680](https://github.com/inmanta/web-console/issues/2680) Expanding many items in a resource logs page makes the page crash

## Syntax highlighting

The `CodeHighlighter` component is responsible for the syntax highlighting that we use on several pages. It offloads the highlighting logic to [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter).
We chose a custom component instead of the Patternfly `CodeBlock` component because the Pattenfly one takes up more screen real estate (actions on top in a mostly empty row, instead of on the side), and it's also missing some features that we could include in the custom component (e.g., line numbers, highlighting according to different languages).

## Storybook
__27-10-2022__
As of this date, we decided to remove storybook and all related dependencies. The main reasons are as follow: 
- We don't have any benefit in displaying the list of components that we are using. We are not building a library of components, but an application using third party components. This results in unnecessary maintenance. 
- We tested to see for 1-2 months if it has any usecases, asside from maintaining it, we didn't use it either. 
- A lot of dependencies are being imported for no major interesting reasons. 

## React 18 update notes
__04-10-2022__
As of this date, the project has been updated to the latest React version. React 18 brings a few breaking changes and improvements. 
You can find the release note [here](https://reactjs.org/blog/2022/03/29/react-v18.html)

### List of changes concerning this project

#### Using FakeTimers
They changed the format, you can't pass a string anymore to the fakeTimer method. You need to pass an object instead.
```Javascript
const jestOptions = { legacyFakeTimers: true };

jest.useFakeTimers(jestOptions);
```

#### Act in tests.
- Resolving mocked calls in tests always needs to be wrapped in an "act". 
Example: 
```Javascript
  await act(async () => {
    await apiHelper.resolve(204);
  });
```

#### Styled Components compatibility
- Some Styled components might give you typing errors, especially SVGIcons when trying to déclare them. If you encounter this issue, please remove your node_modules and reinstall the project. You might have some cached typings. The reason why this error occurs is because StyleComponents are using a wildcard in the dependency for React types. We use a resolution to stay compatible with the new typing of React 18 and the ones needed for the StyledComponents. 

- We needed to proxy the globalStyles, this solution is required because of the typing related compatibility. [You can find the Github issue here.](https://github.com/styled-components/styled-components/issues/3738)

```Javascript 
 const GlobalStyleProxy: any = GlobalStyles;
```

#### Children in Components
- From now on, if a component has children props you will need to declare them explicitly. You have two options.
    1) You define the children in the interface, this is handy when you already defined an interface for it. 
    2) You can type your component as follow : ``React.FC<React.PropsWithChildren<unkown>>`` or ``React.FC<React.PropsWithChildren<Props>>`` if you use an interface.

#### Multiple Children error
- If you encounter an error telling you the number of ReactNode is multiple instead of 1, this is again either a compatibility issue from Paternfly components OR you defined that the children of a component as follow : ``children?: React.ReactNode;`` instead of ``children?: React.ReactNode | React.ReactNode[];`` 
There is a simple way to bypass this issue if it's coming from a third party component. You can wrap the innercontent of the component in a ReactFragment.

```Javascript
<ComponentWithChildren>
    <>
        // your content
    </>
</ComponentWithChildren>
```

#### Type ParsedNumber is not signable to ReactNode
If you get a simmilar error, you will most likely need to cast the variable to a ReactNode element.
Example: 
```Javascript
{row.version as React.ReactNode}
```

### Naming conventions

#### Events
We agreed to use hyphen-sepraten name covention for custom Events i.e.
```
  document.dispatchEvent(new Event("settings-update"));
```


