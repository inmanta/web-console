import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import "@testing-library/jest-dom";

configure({ adapter: new Adapter() });

/**
 * Sometimes tests can take longer than the default 5000ms timeout.
 * When that happens, the test fails. To prevent the test from failing,
 * we increase the default timeout here.
 */
jest.setTimeout(10000);
