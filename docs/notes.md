[Index](./index.md)

# Notes

## ARIA role `cell` vs `gridcell`

When querying the **DOM** during testing with **jsdom**, it is sometimes not obvious what `role` is assigned to an element.  
Usually we use Chrome Devtools to lookup an element and find its `role`.  
For the `td` element, the `role` assigned to it by Chrome was `gridcell`.  
But in **jsdom** the `role` assigned to the element was `cell`.
This might save some time and frustrations in the future.
