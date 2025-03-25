import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, Resource } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Mock } from "@S/Facts/Test";
import { FactsTab } from "./FactsTab";
import { sortFactRows } from "./FactsTable";
import { setupServer } from "msw/node";
import { delay, http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clear } from "console";

function setup() {
  const store = getStoreInstance();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <FactsTab resourceId={"abc"} />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
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
      }),
    );

    const { component } = setup();

    render(component);

    expect(
      screen.getByRole("region", { name: "ResourceFacts-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "ResourceFacts-Error" }),
    ).toBeInTheDocument();
  });

  test("Given the FactsTab When the backend response is successful Then shows success table", async () => {
    server.use(
      http.get("/api/v2/resource/abc/facts", () => {
        delay(100);
        return HttpResponse.json(Mock.response);
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ResourceFacts-Loading" }),
    ).toBeInTheDocument();
    clear;
    expect(
      await screen.findByRole("grid", { name: "ResourceFacts-Success" }),
    ).toBeInTheDocument();
  });

  test("Given sortFactRows When sorting by different columns Then the result is correct", async () => {
    const sortedByNameAsc = sortFactRows(Mock.response.data, "name", "asc");

    expect(sortedByNameAsc[0].name).toEqual("awsDevice");
    expect(sortedByNameAsc[sortedByNameAsc.length - 1].name).toEqual(
      "partnerName",
    );
    const sortedByNameDesc = sortFactRows(Mock.response.data, "name", "desc");

    expect(sortedByNameDesc[0].name).toEqual("partnerName");
    expect(sortedByNameDesc[sortedByNameDesc.length - 1].name).toEqual(
      "awsDevice",
    );

    const sortedByDateAsc = sortFactRows(Mock.response.data, "updated", "asc");

    expect(sortedByDateAsc[0].name).toEqual("jumboFrameCapable");
    expect(sortedByDateAsc[sortedByDateAsc.length - 1].name).toEqual(
      "location",
    );

    const sortedByDateDesc = sortFactRows(
      Mock.response.data,
      "updated",
      "desc",
    );

    expect(sortedByDateDesc[0].name).toEqual("location");
    expect(sortedByDateDesc[sortedByDateDesc.length - 1].name).toEqual(
      "jumboFrameCapable",
    );

    const sortedByValueAsc = sortFactRows(Mock.response.data, "value", "asc");

    expect(sortedByValueAsc[0].value).toEqual("available");
    expect(sortedByValueAsc[sortedByValueAsc.length - 1].value).toEqual("no");

    const sortedByValueDesc = sortFactRows(Mock.response.data, "value", "desc");

    expect(sortedByValueDesc[0].value).toEqual("no");
    expect(sortedByValueDesc[sortedByValueDesc.length - 1].value).toEqual(
      "available",
    );

    const factsWithUndefinedDate = [
      ...Mock.response.data,
      { name: "no_date", updated: undefined, value: "yes", id: "123" },
    ];

    const sortedByDateWithUndefined = sortFactRows(
      factsWithUndefinedDate,
      "updated",
      "asc",
    );

    expect(sortedByDateWithUndefined[0].name).toEqual("no_date");
    expect(
      sortedByDateWithUndefined[sortedByDateWithUndefined.length - 1].name,
    ).toEqual("location");
  });
});
