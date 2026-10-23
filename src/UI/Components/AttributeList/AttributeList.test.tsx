import { t_global_font_family_mono } from "@patternfly/react-tokens";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { attributes, classified } from "@/Data/Common/AttributeClassifier/Mock";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI/words";
import { AttributeList } from "./AttributeList";

test("Given the AttributeList component When rendered with the monospace variant Then the font-family is correct", async () => {
  // PatternFly's CSS is not loaded in tests, so define the token the component refers to.
  document.documentElement.style.setProperty(
    t_global_font_family_mono.name,
    t_global_font_family_mono.value
  );
  onTestFinished(() => {
    document.documentElement.style.removeProperty(t_global_font_family_mono.name);
  });
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <AttributeList attributes={classified} variant="monospace" />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
  render(component);

  const singleLineValue = await screen.findByText(attributes["b"]);

  expect(singleLineValue).toHaveStyle({ fontFamily: t_global_font_family_mono.value });
});

test("Given an empty single-line value When rendered Then it shows an empty marker without a copy button", () => {
  render(
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <AttributeList attributes={[{ kind: "SingleLine", key: "empty", value: "" }]} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  const cell = screen.getByTestId("attribute-empty");

  expect(within(cell).getByText(words("attributes.emptyString")).tagName).toBe("EM");
  expect(within(cell).queryByRole("button")).not.toBeInTheDocument();
});
