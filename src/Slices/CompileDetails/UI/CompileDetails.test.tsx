import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as Mock from "@S/CompileDetails/Core/Mock";
import { CompileDetails } from "./CompileDetails";
import { getDuration } from "./CompileStageReportTable";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <CompileDetails id="123" />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
const server = setupServer();

describe("CompileDetails", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("CompileDetailsView shows failed view", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json(
          {
            message: "error",
          },
          {
            status: 500,
          }
        );
      })
    );
    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "CompileDetailsView-Loading" })).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "CompileDetailsView-Error" })
    ).toBeInTheDocument();
  });

  test("CompileDetailsView shows completed table with success: true", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json({ data: Mock.data });
      })
    );
    const { component } = setup();

    await render(component);

    expect(
      await screen.findByRole("region", { name: "CompileDetailsView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: "CompileDetailsView-Success",
      })
    ).toBeInTheDocument();
    expect(await screen.findAllByLabelText("done-state")).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("CompileDetailsView shows completed table with success: false, error indication should appear", async () => {
    server.use(
      http.get("api/v2/compilereport/123", () => {
        return HttpResponse.json({ data: Mock.DataFailed });
      })
    );
    const { component } = setup();

    await render(component);

    expect(
      await screen.findByRole("generic", {
        name: "CompileDetailsView-Success",
      })
    ).toBeInTheDocument();

    expect(await screen.findByLabelText("error-state")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("getDuration calculates duration correctly", () => {
    const started = "2023-01-01T10:00:00.000Z";
    const completed = "2023-01-01T10:00:30.000Z";

    // Test with completed time
    expect(getDuration(started, completed)).toBe("30");

    // Test with no completed time (should use current time)
    const now = new Date("2023-01-01T10:00:45.000Z");
    jest.useFakeTimers();
    jest.setSystemTime(now);
    expect(getDuration(started)).toBe("45");
    jest.useRealTimers();

    // Test duration less than 1 second
    const startedRecent = "2023-01-01T10:00:00.000Z";
    const completedRecent = "2023-01-01T10:00:00.500Z";
    expect(getDuration(startedRecent, completedRecent)).toBe("0");
  });
});
