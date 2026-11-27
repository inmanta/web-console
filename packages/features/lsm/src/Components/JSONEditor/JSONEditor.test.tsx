import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { words } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { JSONEditor } from "./JSONEditor";

const marker = {
  message: 'Missing property "name".',
  startLineNumber: 1,
  startColumn: 1,
};

interface CodeEditorMockProps {
  code: string;
  onChange: (value: string) => void;
  editorProps: { onValidate: (markers: (typeof marker)[]) => void };
}

// The global code editor mock drops editorProps, so this one hands buttons to the test that call
// onValidate the way Monaco does.
vi.mock("@inmanta/web-console-ui/Components/CodeEditor", () => ({
  CodeEditor: ({ code, onChange, editorProps }: CodeEditorMockProps) => (
    <>
      <textarea aria-label="code" value={code} onChange={(event) => onChange(event.target.value)} />
      <button onClick={() => editorProps.onValidate([marker])}>with marker</button>
      <button onClick={() => editorProps.onValidate([])}>without markers</button>
    </>
  ),
}));

const server = setupTestServer(
  http.get("/lsm/v1/service_catalog/:id/schema", () => HttpResponse.json({ data: {} }))
);

const markerError = words("validation.marker")(
  marker.message,
  marker.startLineNumber,
  marker.startColumn
);

const setup = (data: string, readOnly = false) => {
  const onChange = vi.fn();

  render(
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <JSONEditor service_entity="service" data={data} onChange={onChange} readOnly={readOnly} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { onChange };
};

/** Expands the collapsed error list, so the errors render. */
const expandErrors = () =>
  userEvent.click(
    within(screen.getByTestId("Error-container")).getByRole("button", { expanded: false })
  );

describe("JSONEditor", () => {
  beforeAll(() => server.listen());
  afterEach(() => testClient.clear());
  afterAll(() => server.close());

  it("lists the markers of Monaco as errors and reports the value as invalid", async () => {
    const { onChange } = setup('{"name": "a"}');

    expect(onChange).toHaveBeenLastCalledWith('{"name": "a"}', true);

    await userEvent.click(screen.getByRole("button", { name: "with marker" }));
    await expandErrors();

    expect(screen.getByText(markerError)).toBeVisible();
    expect(onChange).toHaveBeenLastCalledWith('{"name": "a"}', false);

    await userEvent.click(screen.getByRole("button", { name: "without markers" }));

    expect(screen.queryByTestId("Error-container")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith('{"name": "a"}', true);
  });

  it("reports an empty value as invalid JSON", async () => {
    const { onChange } = setup('{"name": "a"}');

    await userEvent.clear(screen.getByRole("textbox", { name: "code" }));
    await expandErrors();

    expect(screen.getByText(words("validation.invalidJson"))).toBeVisible();
    expect(onChange).toHaveBeenLastCalledWith("", false);
  });

  it("doesn't list the errors when it is read only", async () => {
    const { onChange } = setup('{"name": "a"}', true);

    await userEvent.click(screen.getByRole("button", { name: "with marker" }));

    expect(screen.queryByTestId("Error-container")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith('{"name": "a"}', false);
  });
});
