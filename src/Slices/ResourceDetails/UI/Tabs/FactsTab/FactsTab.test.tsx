import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Mock } from "@S/Facts/Test";
import { FactsTab } from "./FactsTab";
import { sortFactRows } from "./FactsTable";

const valueOf = (name: string) => Mock.list.find((f) => f.name === name)?.value ?? "";

// The code editor is mocked globally in test-setup.ts; it renders its content
// into a <pre data-testid="code-editor-content">. Scope to it so we match the
// formatted value in the editor rather than the raw value in the preview button.
const editorShowing = (snippet: string) =>
  screen.getAllByTestId("code-editor-content").find((el) => el.textContent?.includes(snippet));

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <FactsTab resourceId={"abc"} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("FactsTab", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("Given the FactsTab When the backend response is an error Then shows failed view", async () => {
    server.use(
      http.get("/api/v2/resource/abc/facts", () => {
        delay(100);

        return HttpResponse.json({ message: "error" }, { status: 500 });
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "Facts-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "Facts-Error" })).toBeInTheDocument();
  });

  test("Given the FactsTab When the backend response is successful Then shows success table", async () => {
    server.use(
      http.get("/api/v2/resource/abc/facts", () => {
        delay(100);

        return HttpResponse.json(Mock.response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "Facts-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("grid", { name: "Facts-Success" })).toBeInTheDocument();
  });

  test("Given the FactsTab When a fact has a JSON value Then it expands into the formatted editor", async () => {
    server.use(http.get("/api/v2/resource/abc/facts", () => HttpResponse.json(Mock.response)));
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: valueOf("jsonValueFact") }));

    // The editor shows the pretty-printed JSON (a space after the colon that the
    // raw value does not have) - distinctive of the formatted output.
    expect(editorShowing('"status": "deployed"')).toBeVisible();
  });

  test("Given the FactsTab When a fact has an XML value Then it expands into the formatted editor", async () => {
    server.use(http.get("/api/v2/resource/abc/facts", () => HttpResponse.json(Mock.response)));
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: valueOf("xmlValueFact") }));

    expect(editorShowing("<host>localhost</host>")).toBeVisible();
  });

  test("Given sortFactRows When sorting by different columns Then the result is correct", async () => {
    const sortedByNameAsc = sortFactRows(Mock.response.data, "name", "asc");

    expect(sortedByNameAsc[0].name).toEqual("awsDevice");
    expect(sortedByNameAsc[sortedByNameAsc.length - 1].name).toEqual("xmlValueFact");
    const sortedByNameDesc = sortFactRows(Mock.response.data, "name", "desc");

    expect(sortedByNameDesc[0].name).toEqual("xmlValueFact");
    expect(sortedByNameDesc[sortedByNameDesc.length - 1].name).toEqual("awsDevice");

    const sortedByDateAsc = sortFactRows(Mock.response.data, "updated", "asc");

    expect(sortedByDateAsc[0].name).toEqual("jumboFrameCapable");
    expect(sortedByDateAsc[sortedByDateAsc.length - 1].name).toEqual("location");

    const sortedByDateDesc = sortFactRows(Mock.response.data, "updated", "desc");

    expect(sortedByDateDesc[0].name).toEqual("location");
    expect(sortedByDateDesc[sortedByDateDesc.length - 1].name).toEqual("jumboFrameCapable");

    const jsonValue = Mock.response.data.find((f) => f.name === "jsonValueFact")?.value;

    const sortedByValueAsc = sortFactRows(Mock.response.data, "value", "asc");

    expect(sortedByValueAsc[0].value).toEqual(jsonValue);
    expect(sortedByValueAsc[sortedByValueAsc.length - 1].value).toEqual("no");

    const sortedByValueDesc = sortFactRows(Mock.response.data, "value", "desc");

    expect(sortedByValueDesc[0].value).toEqual("no");
    expect(sortedByValueDesc[sortedByValueDesc.length - 1].value).toEqual(jsonValue);

    const factsWithUndefinedDate = [
      ...Mock.response.data,
      { name: "no_date", updated: undefined, value: "yes", id: "123" },
    ];

    const sortedByDateWithUndefined = sortFactRows(factsWithUndefinedDate, "updated", "asc");

    expect(sortedByDateWithUndefined[0].name).toEqual("no_date");
    expect(sortedByDateWithUndefined[sortedByDateWithUndefined.length - 1].name).toEqual(
      "location"
    );
  });
});
