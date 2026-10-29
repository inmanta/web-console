import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LookBackSlider } from "./LookBackSlider";

it("LookBackSlider calls callback with adequate value on apply", async () => {
  const callback = vi.fn();

  render(
    <LookBackSlider instanceVersion={5} initialLookBehind={1} setSelectedVersion={callback} />
  );

  expect(
    screen.getByText("The number of lifecycle versions to look back when diagnosing failures.")
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "The slider determines how many lifecycle versions to look back when diagnosing failures."
    )
  ).toBeInTheDocument();

  expect(screen.getByLabelText("LookBack-Slider")).toBeInTheDocument();

  //test slider change
  await userEvent.click(screen.getByRole("slider"));

  await userEvent.type(screen.getByRole("slider"), "{arrowRight}"); // to simulate changing slider, I think that's cleaner approach as patternfly slider is not actual input

  await userEvent.type(screen.getByRole("slider"), "{arrowRight}"); // to simulate changing slider, I think that's cleaner approach as patternfly slider is not actual input

  await userEvent.click(screen.getByText("Apply"));

  expect(callback).toHaveBeenCalledWith(3);
  expect(screen.getByLabelText("Slider value input")).toHaveValue(3);
  expect(screen.getByLabelText("Value")).toHaveValue(3);

  // test input change
  await userEvent.type(
    screen.getByLabelText("Slider value input"),
    "{selectall}{backspace}4{enter}"
  );

  expect(screen.getByLabelText("Slider value input")).toHaveValue(4);
  expect(screen.getByLabelText("Value")).toHaveValue(4);

  await userEvent.click(screen.getByText("Apply"));

  expect(callback).toHaveBeenCalledWith(4);

  //test passing value below min to the input
  await userEvent.type(
    screen.getByLabelText("Slider value input"),
    "{selectall}{backspace}0{enter}"
  );
  expect(screen.getByLabelText("Slider value input")).toHaveValue(1);
  expect(screen.getByLabelText("Value")).toHaveValue(1);

  await userEvent.click(screen.getByText("Apply"));

  expect(callback).toHaveBeenCalledWith(1);

  //test passing value above max to the input
  await userEvent.type(
    screen.getByLabelText("Slider value input"),
    "{selectall}{backspace}5{enter}"
  );
  expect(screen.getByLabelText("Slider value input")).toHaveValue(4);
  expect(screen.getByLabelText("Value")).toHaveValue(4);

  await userEvent.click(screen.getByText("Apply"));

  expect(callback).toHaveBeenCalledWith(4);
});
