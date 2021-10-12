import { enableFetchMocks } from "jest-fetch-mock";
import moment from "moment-timezone";

enableFetchMocks();

moment.tz.setDefault("Europe/Brussels");
