import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { Project } from "@/Test";
import { ManageProjectsModal } from "./ManageProjectsModal";

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={client}>
      <ManageProjectsModal />
    </QueryClientProvider>
  );
};

describe("ManageProjectsModal", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN ManageProjectsModal WHEN data is loading THEN spinner is shown", () => {
    server.use(
      http.get("/api/v2/project", async () => {
        await new Promise(() => {}); // never resolves
      })
    );

    render(setup());

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("GIVEN ManageProjectsModal WHEN fetch fails THEN error alert is shown", async () => {
    server.use(
      http.get("/api/v2/project", () =>
        HttpResponse.json({ message: "Internal server error" }, { status: 500 })
      )
    );

    render(setup());

    // PF6 inline Alert does not carry role="alert"; query by the rendered error title
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  test("GIVEN ManageProjectsModal WHEN projects are loaded THEN project names are shown", async () => {
    server.use(
      http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.a, Project.empty] }))
    );

    render(setup());

    expect(await screen.findByText(Project.a.name)).toBeVisible();
    expect(screen.getByText(Project.empty.name)).toBeVisible();
  });

  test("GIVEN ManageProjectsModal WHEN project has environments THEN Delete button is disabled", async () => {
    server.use(http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.a] })));

    render(setup());

    const deleteButton = await screen.findByTestId(`delete-project-${Project.a.id}`);

    expect(deleteButton).toBeDisabled();
  });

  test("GIVEN ManageProjectsModal WHEN project has no environments THEN Delete button is enabled", async () => {
    server.use(http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.empty] })));

    render(setup());

    const deleteButton = await screen.findByTestId(`delete-project-${Project.empty.id}`);

    expect(deleteButton).toBeEnabled();
  });

  test("GIVEN ManageProjectsModal WHEN Delete is clicked THEN inline confirmation is shown", async () => {
    server.use(http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.empty] })));

    render(setup());

    const deleteButton = await screen.findByTestId(`delete-project-${Project.empty.id}`);

    await userEvent.click(deleteButton);

    expect(screen.getByTestId(`confirm-delete-project-${Project.empty.id}`)).toBeVisible();
    expect(screen.getByTestId(`cancel-delete-project-${Project.empty.id}`)).toBeVisible();
    expect(screen.getByText("This action cannot be undone.")).toBeVisible();
  });

  test("GIVEN ManageProjectsModal WHEN Cancel is clicked after Delete THEN row returns to default state", async () => {
    server.use(http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.empty] })));

    render(setup());

    const deleteButton = await screen.findByTestId(`delete-project-${Project.empty.id}`);

    await userEvent.click(deleteButton);

    const cancelButton = screen.getByTestId(`cancel-delete-project-${Project.empty.id}`);

    await userEvent.click(cancelButton);

    expect(screen.getByTestId(`delete-project-${Project.empty.id}`)).toBeVisible();
    expect(
      screen.queryByTestId(`confirm-delete-project-${Project.empty.id}`)
    ).not.toBeInTheDocument();
  });

  test("GIVEN ManageProjectsModal WHEN Confirm delete is clicked THEN DELETE request is sent", async () => {
    let deleteCalled = false;

    server.use(
      http.get("/api/v2/project", () => HttpResponse.json({ data: [Project.empty] })),
      http.delete(`/api/v1/project/${Project.empty.id}`, () => {
        deleteCalled = true;

        return new HttpResponse(null, { status: 200 });
      })
    );

    render(setup());

    const deleteButton = await screen.findByTestId(`delete-project-${Project.empty.id}`);

    await userEvent.click(deleteButton);

    const confirmButton = screen.getByTestId(`confirm-delete-project-${Project.empty.id}`);

    await userEvent.click(confirmButton);

    await waitFor(() => expect(deleteCalled).toBe(true));
  });
});
