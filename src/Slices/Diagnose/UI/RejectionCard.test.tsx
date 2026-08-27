import { act } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { CompileError } from "@/Core";
import { MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { Rejection } from "@S/Diagnose/Core/Domain";
import { RejectionCard } from "./RejectionCard";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const singleError: CompileError[] = [
  {
    type: "inmanta.ast.DoubleSetException",
    category: "runtime_error",
    message: "value set twice",
    location: {
      uri: "./main.cf",
      range: { start: { line: 29, character: 4 }, end: { line: 29, character: 5 } },
    },
  },
];

const twoErrors: CompileError[] = [
  ...singleError,
  {
    type: "inmanta.ast.AttributeException",
    category: "plugin_exception",
    message: "Could not set attribute name",
    location: {
      uri: "./main.cf",
      range: { start: { line: 12, character: 1 }, end: { line: 12, character: 10 } },
    },
  },
];

function createRejection(overrides: Partial<Rejection> = {}): Rejection {
  return {
    instance_version: 4,
    model_version: 3,
    compile_id: "11111111-1111-1111-1111-111111111111",
    errors: singleError,
    ...overrides,
  };
}

function setup(rejection: Rejection) {
  return (
    <TestMemoryRouter initialEntries={["/?env=aaa"]}>
      <MockedDependencyProvider>
        <RejectionCard rejection={rejection} />
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );
}

describe("RejectionCard", () => {
  it("shows the instance version and, for a single error, its message directly without needing to expand anything", () => {
    render(setup(createRejection()));

    expect(screen.getByText(words("diagnose.rejection.instanceVersion")(4))).toBeVisible();

    expect(screen.getByText("value set twice")).toBeVisible();

    // a single error isn't counted - there's nothing to distinguish it from.
    expect(screen.queryByText(words("diagnose.rejection.errorsCount")(1))).not.toBeInTheDocument();
  });

  it("shows an 'N errors' badge and every error's message when there is more than one error", () => {
    render(setup(createRejection({ errors: twoErrors })));

    expect(screen.getByText(words("diagnose.rejection.errorsCount")(2))).toBeVisible();

    expect(screen.getByText("value set twice")).toBeVisible();
    expect(screen.getByText("Could not set attribute name")).toBeVisible();
  });

  it("hides the error details behind a 'Show details' toggle, and reveals type/category/location for the right error on expand", async () => {
    const user = userEvent.setup();

    render(setup(createRejection({ errors: twoErrors })));

    expect(screen.queryByText("inmanta.ast.DoubleSetException")).not.toBeVisible();
    expect(screen.queryByText("inmanta.ast.AttributeException")).not.toBeVisible();

    // Each toggle renders the same visible "Show details" text, but is given a distinct
    // aria-label (error 1, error 2, ...) - both so screen reader users can tell them apart,
    // and so their linked content regions don't collide on axe's landmark-unique rule.
    const firstToggle = screen.getByRole("button", {
      name: words("diagnose.rejection.showDetailsAriaLabel")(1),
    });
    const secondToggle = screen.getByRole("button", {
      name: words("diagnose.rejection.showDetailsAriaLabel")(2),
    });

    // expanding the first error's details doesn't reveal the second error's details.
    await user.click(firstToggle);

    expect(screen.getByText("inmanta.ast.DoubleSetException")).toBeVisible();
    expect(screen.getByText("runtime_error")).toBeVisible();
    expect(screen.getByText("./main.cf:29:4")).toBeVisible();
    expect(screen.queryByText("inmanta.ast.AttributeException")).not.toBeVisible();

    await user.click(secondToggle);

    expect(screen.getByText("inmanta.ast.AttributeException")).toBeVisible();
    expect(screen.getByText("plugin_exception")).toBeVisible();
    expect(screen.getByText("./main.cf:12:1")).toBeVisible();
  });

  it("shows the traceback, collapsed by default, in the card footer", async () => {
    const user = userEvent.setup();
    const trace =
      'Traceback (most recent call last):\n  raise DoubleSetException("value set twice")';

    render(setup(createRejection({ trace })));

    const traceToggle = screen.getByRole("button", {
      name: words("diagnose.rejection.traceback"),
    });
    // The traceback is rendered through a monaco mock that doesn't expose the code as text, so
    // visibility of its region (rather than its content) is what we can assert on here. A
    // collapsed region's accessible name computes to "" (aria-labelledby isn't resolved for
    // hidden nodes), so it has to be located via the toggle's aria-controls id, not by role+name.
    const contentId = traceToggle.getAttribute("aria-controls");
    const traceRegion = document.getElementById(contentId ?? "");

    expect(traceRegion).not.toBeVisible();

    await user.click(traceToggle);

    expect(traceRegion).toBeVisible();
  });

  it("does not show a traceback toggle when there is no trace", () => {
    render(setup(createRejection({ trace: undefined })));

    expect(
      screen.queryByRole("button", { name: words("diagnose.rejection.traceback") })
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations, with multiple errors and a traceback, details expanded", async () => {
    const { container } = render(
      setup(
        createRejection({
          errors: twoErrors,
          trace:
            'Traceback (most recent call last):\n  raise DoubleSetException("value set twice")',
        })
      )
    );

    const user = userEvent.setup();

    for (const index of [1, 2]) {
      await user.click(
        screen.getByRole("button", {
          name: words("diagnose.rejection.showDetailsAriaLabel")(index),
        })
      );
    }

    await user.click(screen.getByRole("button", { name: words("diagnose.rejection.traceback") }));

    await act(async () => {
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });
});
