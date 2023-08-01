import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BooleanSwitch } from "@/UI/Components";
import { SettingsList } from "./SettingsList";

test("ConfigView shows setting as toggle correctly", () => {
  render(
    <SettingsList
      config={{ test: false }}
      onChange={jest.fn()}
      Switch={BooleanSwitch}
    />,
  );

  expect(screen.getByRole("checkbox", { name: "test-False" })).toBeVisible();
});

test("ConfigView handles click on toggle correctly", () => {
  const cb = jest.fn();

  render(
    <SettingsList
      config={{ test: false }}
      onChange={cb}
      Switch={BooleanSwitch}
    />,
  );

  fireEvent.click(screen.getByRole("checkbox", { name: "test-False" }));
  expect(cb.mock.calls[0]).toEqual(["test", true]);
});
