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
