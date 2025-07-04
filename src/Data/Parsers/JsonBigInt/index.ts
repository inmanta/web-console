/**
 * This file is based on json-bigint package
 * @license MIT
 * @copyright Copyright (c) 2013-present Andrey Sidorov <sidorares@yandex.ru>
 * @see {@link https://github.com/sidorares/json-bigint}
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

// Use CommonJS require to import CJS modules

import jsonParse from "./lib/parse.js";

import { stringify as jsonStringify } from "./lib/stringify.js";

export interface JSONBigIntOptions {
  [key: string]: unknown;
}

export interface JSONBigInt {
  parse: ReturnType<typeof jsonParse>;
  stringify: typeof jsonStringify;
}

/**
 * Factory function to create JSONBigInt methods with options.
 */
function createJSONBigInt(options?: JSONBigIntOptions): JSONBigInt {
  return {
    parse: jsonParse(options),
    stringify: jsonStringify,
  };
}

// Default instance for backward compatibility
const defaultInstance: JSONBigInt = {
  parse: jsonParse(),
  stringify: jsonStringify,
};

export default Object.assign(createJSONBigInt, defaultInstance);
