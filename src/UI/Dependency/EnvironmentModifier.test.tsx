import { act } from "react";
import { renderHook } from "@testing-library/react";
import { EnvironmentDetails, EnvironmentSettings } from "@/Test";
import { useEnvironmentModifierImpl } from "./EnvironmentModifier";

test("Given the environmentModifier When the server compile setting is requested Then returns the correct value", async () => {
  const { result } = renderHook(() => useEnvironmentModifierImpl());
  // No setting is specified, and the default is true
  await act(() => {
    result.current.setEnvironment(EnvironmentDetails.a);
  });
  await act(() => {
    result.current.setEnvironmentSettings({
      settings: {},
      definition: EnvironmentSettings.definition,
    });
  });

  expect(result.current.useIsServerCompileEnabled()).toBe(true);

  // Set the option explicitly to false
  await act(() => {
    result.current.setEnvironment({
      ...EnvironmentDetails.a,
      settings: {
        ...EnvironmentDetails.a.settings,
        server_compile: false,
      },
    });
  });

  expect(result.current.useIsServerCompileEnabled()).toBe(false);
});

test("Given the environmentModifier When the missing setting is requested Then render component as the value would be false without throwing an error", async () => {
  const consoleError = jest.spyOn(console, "error");

  delete EnvironmentSettings.definition.server_compile;
  const { result } = renderHook(() => useEnvironmentModifierImpl());

  await act(() => {
    result.current.setEnvironmentSettings({
      settings: {},
      definition: EnvironmentSettings.definition,
    });
  });

  expect(result.current.useIsServerCompileEnabled()).toBe(false);
  expect(consoleError).not.toHaveBeenCalled();
});
