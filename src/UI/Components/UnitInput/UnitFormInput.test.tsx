import { act } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { UnitFormInput } from "./UnitFormInput";
import { otherScaleCandidates, selectDisplayUnit } from "./display";
import { resolveUnitConfig } from "./resolveUnitConfig";
import type { UnitConfig } from "./resolveUnitConfig";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing an isolated form field.
    region: { enabled: false },
  },
});

function configFor(webUnit: string, type = "int", scales?: "metric" | "iec" | "both"): UnitConfig {
  const result = resolveUnitConfig({ web_unit: webUnit, web_unit_scales: scales }, type);

  if (!result.ok) {
    throw new Error(`test fixture unit config could not be resolved: ${result.reason}`);
  }

  return result.config;
}

function numberInput(): HTMLElement {
  return screen.getByLabelText("UnitInput-bandwidth", { exact: false });
}

function unitSelect(): HTMLElement {
  return screen.getByLabelText(/^Unit$/);
}

describe("UnitFormInput", () => {
  test("renders the initial value in its auto-selected unit, with the stored-value helper line", () => {
    render(
      <UnitFormInput
        attributeName="memory_limit"
        attributeValue={2048}
        isOptional={false}
        config={configFor("MiB")}
        handleInputChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("UnitInput-memory_limit")).toHaveValue("2");
    expect(screen.getByLabelText(/^Unit$/)).toHaveValue("GiB");
    expect(screen.getByText("= 2048 MiB")).toBeVisible();
  });

  test("typing a value calls handleInputChange with the value converted to API units", async () => {
    const handleInputChange = vi.fn();

    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={null}
        isOptional={false}
        config={configFor("MB")}
        handleInputChange={handleInputChange}
      />
    );

    await userEvent.type(numberInput(), "2500");

    expect(handleInputChange).toHaveBeenLastCalledWith(2500, null);
  });

  test("switching the unit re-interprets the typed digits instead of converting them", async () => {
    const handleInputChange = vi.fn();

    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={null}
        isOptional={false}
        config={configFor("MB")}
        handleInputChange={handleInputChange}
      />
    );

    await userEvent.type(numberInput(), "2500");
    handleInputChange.mockClear();

    await userEvent.selectOptions(unitSelect(), "GB");

    // Same "2500" digits, now read as GB -> a completely different API value, not 2500 unchanged.
    expect(handleInputChange).toHaveBeenLastCalledWith(2500000, null);
  });

  test("the stepper buttons increment and decrement in the currently selected unit", async () => {
    const handleInputChange = vi.fn();

    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={2}
        isOptional={false}
        config={configFor("MB")}
        handleInputChange={handleInputChange}
      />
    );

    await userEvent.click(screen.getByLabelText("Increase"));
    expect(handleInputChange).toHaveBeenLastCalledWith(3, null);

    await userEvent.click(screen.getByLabelText("Decrease"));
    expect(handleInputChange).toHaveBeenLastCalledWith(2, null);
  });

  test("an entry that isn't a whole number of API units shows the exactness error", async () => {
    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={null}
        isOptional={false}
        config={configFor("MB")}
        handleInputChange={vi.fn()}
      />
    );

    await userEvent.selectOptions(unitSelect(), "GB");
    await userEvent.type(numberInput(), "2.0001");

    expect(
      screen.getByText("Must be a whole number of MB (2.0001 GB = 2000.1 MB).")
    ).toBeVisible();
    expect(numberInput()).toHaveAttribute("aria-invalid", "true");
  });

  test("an entry beyond the configured bound shows the bound error, converted to the current unit", async () => {
    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={null}
        isOptional={false}
        config={configFor("kbit/s")}
        bounds={{ le: 1000000 }}
        handleInputChange={vi.fn()}
      />
    );

    await userEvent.selectOptions(unitSelect(), "Gbit/s");
    await userEvent.type(numberInput(), "2");

    expect(screen.getByText("Must be at most 1 Gbit/s.")).toBeVisible();
  });

  test("shouldBeDisabled disables the number input, both steppers, and the unit select", () => {
    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={2}
        isOptional={false}
        shouldBeDisabled
        config={configFor("MB")}
        handleInputChange={vi.fn()}
      />
    );

    expect(numberInput()).toBeDisabled();
    expect(screen.getByLabelText("Increase")).toBeDisabled();
    expect(screen.getByLabelText("Decrease")).toBeDisabled();
    expect(unitSelect()).toBeDisabled();
  });

  test("clearing an optional field calls handleInputChange with null and shows no error", async () => {
    const handleInputChange = vi.fn();

    render(
      <UnitFormInput
        attributeName="bandwidth"
        attributeValue={500}
        isOptional
        config={configFor("MB", "int?")}
        handleInputChange={handleInputChange}
      />
    );

    await userEvent.clear(numberInput());

    expect(handleInputChange).toHaveBeenLastCalledWith(null, null);
    expect(screen.queryByText(/Must be|Enter a number/)).not.toBeInTheDocument();
  });

  test("a single-scale config shows only the primary helper line", () => {
    render(
      <UnitFormInput
        attributeName="memory_limit"
        attributeValue={2048}
        isOptional={false}
        config={configFor("MiB", "int", "iec")}
        handleInputChange={vi.fn()}
      />
    );

    expect(screen.getByText("= 2048 MiB")).toBeVisible();
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });

  test("a both-scales config also shows the equivalent-in-the-other-scale helper line", () => {
    const config = configFor("B", "int", "both");
    const rawValue = 1024 ** 3;
    const primary = selectDisplayUnit(rawValue, config);
    const equivalent = selectDisplayUnit(rawValue, {
      ...config,
      offeredUnits: otherScaleCandidates(config, primary.unit),
    });

    render(
      <UnitFormInput
        attributeName="disk_quota"
        attributeValue={rawValue}
        isOptional={false}
        config={config}
        handleInputChange={vi.fn()}
      />
    );

    expect(screen.getByText(`= ${rawValue} B`)).toBeVisible();
    expect(
      screen.getByText(`≈ ${equivalent.value.toFixed()} ${equivalent.unit} (metric)`)
    ).toBeVisible();
  });

  test("has no accessibility violations", async () => {
    render(
      <UnitFormInput
        attributeName="memory_limit"
        attributeValue={2048}
        description="Memory limit for the container."
        isOptional={false}
        config={configFor("MiB")}
        handleInputChange={vi.fn()}
      />
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
