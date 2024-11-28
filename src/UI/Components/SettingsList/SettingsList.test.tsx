import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BooleanSwitch } from "@/UI/Components";
import { SettingsList } from "./SettingsList";

test("ConfigView handles click on toggle correctly", () => {
  const cb = jest.fn();

  render(
    <SettingsList
      config={{ test: false }}
      onChange={cb}
      Switch={BooleanSwitch}
    />,
  );

  expect(screen.getByRole("switch", { name: "test-False" })).toBeVisible();

  fireEvent.click(screen.getByRole("switch", { name: "test-False" }));
  expect(cb.mock.calls[0]).toContain("test");
});
