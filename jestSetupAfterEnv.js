import "@testing-library/jest-dom";

/**
 * Sometimes tests can take longer than the default 5000ms timeout.
 * When that happens, the test fails. To prevent the test from failing,
 * we increase the default timeout here.
 */
jest.setTimeout(10000);

//JointJS mock to make library work
window.SVGAngle = jest.fn();
window.SVGAngle = jest.fn();
