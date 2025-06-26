import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page>
            <View id={"abc"} />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("ResourceDetailsView", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN The Resource details view THEN details data is fetched immediately", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);
    expect(screen.getByLabelText("ResourceDetails-Loading")).toBeVisible();

    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

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
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0]
    );

    expect(await screen.findByLabelText("ResourceRequires-Empty")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0]
    );
    expect(await screen.findByRole("grid", { name: "ResourceRequires-Success" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view THEN shows status label", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByTestId("Status-deployed")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceLogsView WHEN clicking download button THEN downloads the file content", async () => {
    const fileId = "abc123";
    const fileContent = "file content";
    const base64Content = btoa(fileContent);

    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      }),
      http.get(`/api/v1/file/${fileId}`, () => {
        return HttpResponse.json({ content: base64Content });
      })
    );

    const { component } = setup();
    render(component);

    // Wait for the ResourceDetails to load
    await screen.findByLabelText("ResourceDetails-Success");

    // Find and click the download button
    const downloadButton = await screen.findByRole("button", { name: words("resources.file.get") });
    await userEvent.click(downloadButton);

    // Wait for the code viewer with content to load
    const codeEditor = await screen.findByText(fileContent);
    expect(codeEditor).toBeVisible();
  });
});
