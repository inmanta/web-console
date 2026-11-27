[Index](./index.md)

# BigInt

## Reading large integers

Responses are parsed with the native `JSON.parse` (in `useFetchHelpers.ts`), so an integer above `Number.MAX_SAFE_INTEGER` loses precision when it is read.

## Input Field

The patternfly number input field uses strings as the internal representation.
This is good because now we don't have to do anything special for supporting large integers in input fields.
We do need to parse them correctly when sending the data back to the api.
`parseNumberWithType` (in the attribute converter) turns an integer that is too large for the number type into a BigInt; `toSubmittableNumber` (unit conversion) does the same.

## JSON.stringify

The fetch helpers in `@inmanta/web-console-core/Queries/Helpers` send bodies with `JSON.stringify`, which doesn't support BigInt.
`@inmanta/web-console-core/Language/Extensions` (imported once by the shell's `createApp`) adds `BigInt.prototype.toJSON`, which writes a BigInt as its decimal string.
