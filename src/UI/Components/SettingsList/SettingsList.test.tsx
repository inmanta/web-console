import React from "react";
import { Setting } from "@/Core";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsList } from "./SettingsList";

test("ConfigView shows setting as toggle correctly", () => {
  const settings: Setting[] = [
    { name: "test", value: false, defaultValue: false },
  ];
  const cb = jest.fn();

  render(<SettingsList settings={settings} onChange={cb} />);

  const toggle = screen.getByRole("checkbox", { name: "test-False" });

  expect(toggle).toBeVisible();
});

test("ConfigView handles click on toggle correctly", () => {
  const settings: Setting[] = [
    { name: "test", value: false, defaultValue: false },
  ];
  const cb = jest.fn();

  render(<SettingsList settings={settings} onChange={cb} />);

  const toggle = screen.getByRole("checkbox", { name: "test-False" });

  fireEvent.click(toggle);

  expect(cb.mock.calls[0]).toEqual(["test", true]);
});
