import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LookBackSlider } from "./LookBackSlider";

it("LookBackSlider calls callback with adequate value on apply", async () => {
  const callback = jest.fn();

  render(
    <LookBackSlider
      instanceVersion={5}
      initialLookBehind={1}
      setSelectedVersion={callback}
    />,
  );

  expect(
    screen.getByText(
      "The number of lifecycle versions to look back when looking for failures.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      "By default diagnosis is run against the latest version of the service -1.",
    ),
  ).toBeInTheDocument();

  expect(screen.getByLabelText("LookBack-Slider")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("slider"));

  await userEvent.type(screen.getByRole("slider"), "{arrowRight}"); // to simulate changing slider, I think that's cleaner approach as patternfly slider is not actual input

  await userEvent.type(screen.getByRole("slider"), "{arrowRight}"); // to simulate changing slider, I think that's cleaner approach as patternfly slider is not actual input

  await userEvent.click(screen.getByText("Apply"));

  expect(callback).toHaveBeenCalledWith(3);
});
