import { enableFetchMocks } from "jest-fetch-mock";
import moment from "moment-timezone";

enableFetchMocks();

moment.tz.setDefault("Europe/Brussels");

window.matchMedia = jest.fn().mockImplementation((query) => {
    return {
        matches: query === "(prefers-color-scheme: light)",
        addListener: jest.fn(),
        removeListener: jest.fn(),
    };
});