import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

expect.extend(toHaveNoViolations);

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
            <Page>
              <View id={"abc"} />
            </Page>
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("ResourceDetailsView", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN The Resource details view THEN details data is fetched immediately", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      }),
    );
    const { component } = setup();

    render(component);
    expect(screen.getByLabelText("ResourceDetails-Loading")).toBeVisible();

    expect(
      await screen.findByLabelText("ResourceDetails-Success"),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view WHEN the user clicks on the requires tab AND the requires table is empty THEN the empty state is shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({
          data: { ...ResourceDetails.a, requires_status: {} },
        });
      }),
    );
    const { component } = setup();

    render(component);
    expect(
      await screen.findByLabelText("ResourceDetails-Success"),
    ).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0],
    );

    expect(
      await screen.findByLabelText("ResourceRequires-Empty"),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      }),
    );
    const { component } = setup();

    render(component);
    expect(
      await screen.findByLabelText("ResourceDetails-Success"),
    ).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0],
    );
    expect(
      await screen.findByRole("grid", { name: "ResourceRequires-Success" }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view THEN shows status label", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      }),
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByTestId("Status-deployed")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
