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
`local-cors-proxy` is a simple tool that let's you do just that. (https://www.npmjs.com/package/local-cors-proxy)

```bash
$ lcp --proxyUrl [API_BASE_URL]
```

This is however only a temporary solution. You should fix the cors problem... I mean core problem.

## Pruning unused code

TypeScript by itself can detect unused code. But once you export it, TypeScript no longer cares about it.  
The tool `ts-prune` looks for unused exports. Some of these exports can be removed.  
Some can not be removed. For example the exports done in storybook files and not used anywhere.  
But Storybook does pick them up.

You can list the unused exports by running:

```bash
$ yarn ts-prune
```

## Select vs Dropdown (Patternfly)

These components sort of do the same thing. But Select is more powerfull.  
To do a selection in a dropdown, you need to use `event.target.innerText`.  
This is not a good idea because `innerText` is not implemented in `jsdom`.  
So code using `innerText` will not work in a test.

Never use Dropdown for selection.  
Use it for actions that after the click move away from the component.  
Use Select for selecting stuff.  
See https://www.patternfly.org/v4/components/select/design-guidelines.

## Async timers in Jest

https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
