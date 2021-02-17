import * as RemoteData from "./RemoteData";

test("RemoteData.dualFold runs incompatible handler when incompatible", () => {
  const result = RemoteData.dualFold({
    notAsked: () => false,
    loading: () => false,
    failed: () => false,
    success: () => false,
    incompatible: () => true,
  })(RemoteData.notAsked(), RemoteData.loading());
  expect(result).toBeTruthy();
});

test("RemoteData.dualFold runs failed handler when both failed", () => {
  const result = RemoteData.dualFold({
    notAsked: () => [],
    loading: () => [],
    failed: (a, b) => [a, b],
    success: () => [],
    incompatible: () => [],
  })(RemoteData.failed("a failed"), RemoteData.failed("b failed"));
  expect(result).toEqual(["a failed", "b failed"]);
});

test("RemoteData.dualFold runs success handler when both success", () => {
  const result = RemoteData.dualFold({
    notAsked: () => [],
    loading: () => [],
    failed: () => [],
    success: (a, b) => [a, b],
    incompatible: () => [],
  })(RemoteData.success("a success"), RemoteData.success("b success"));
  expect(result).toEqual(["a success", "b success"]);
});
