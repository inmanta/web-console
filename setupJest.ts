import {GlobalWithFetchMock} from "jest-fetch-mock";
 
/* tslint:disable:no-var-requires */
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;