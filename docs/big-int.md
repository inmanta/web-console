[Index](./index.md)

# BigInt

## Json Parsing of large integers

The parsing of big integers in JSON is a configuration option.  
If it is turned on, it will turn a large integer into the BigInt native type.  
If it is turned off, it will turn a large integer into a less precise number.

## Input Field

The patternfly number input field uses strings as the internal representation.  
This is good because now we don't have to do anything special for supporting large integers in input fields.  
We do need to parse them correctly when sending the data back to the api.  
If a number is too large for the number type, we turn it into a BigInt.

## JSON.stringify

The ApiHelper class uses the `fetch` api, which will stringify the data in the body.  
JSON does not support stringifying the BigInt native.  
We have added custom support for this.
