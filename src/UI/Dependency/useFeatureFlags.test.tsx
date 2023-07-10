import { act, renderHook } from "@testing-library/react";
import { Either } from "@/Core";

import { DeferredApiHelper } from "@/Test";
import useFeatureFlags from "../Dependency/useFeatureFlags";

const setup = () => {
  const apiHelper = new DeferredApiHelper();
  const { result } = renderHook(() => useFeatureFlags(apiHelper));

  return { result, apiHelper };
};
test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  const { result, apiHelper } = setup();

  await act(async () => {
    await apiHelper.resolve(Either.right(""));
  });

  expect(result.current.isComposerAvailable()).toBeFalsy();
});

test("GIVEN the app THEN the documentation link should be visible", async () => {
  const { result, apiHelper } = setup();

  await act(async () => {
    await apiHelper.resolve(Either.right('["instanceComposer"]'));
  });

  expect(result.current.isComposerAvailable()).toBeTruthy();
});
