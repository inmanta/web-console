import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { Tab } from "./Tab";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <Tab />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component };
}

describe("Token Tab", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  // The tab also renders the registered-token list; give it a default (empty) response.
  beforeEach(() =>
    server.use(http.get("/api/v2/environment_auth", () => HttpResponse.json({ data: [] })))
  );
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN TokenTab WHEN generate button is clicked THEN an api token is requested by default", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);
    const generateButton = screen.getByRole("button", {
      name: words("settings.tabs.token.generate"),
    });

    expect(generateButton).toBeVisible();
    expect(generateButton).toBeEnabled();

    await userEvent.click(generateButton);

    await waitFor(() => expect(requestBody).toMatchObject({ client_types: ["api"] }));
    expect(await screen.findByRole("textbox", { name: "TokenOutput" })).toHaveValue(
      "tokenstring123"
    );
  });

  test("GIVEN the advanced section WHEN agent is selected instead of api THEN an agent token is requested", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    // The client types are tucked away in the collapsed advanced section.
    expect(screen.queryByRole("button", { name: "AgentOption" })).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.advanced") })
    );

    // api is preselected; switch the token to agent-only.
    expect(screen.getByRole("button", { name: "ApiOption" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await userEvent.click(screen.getByRole("button", { name: "ApiOption" }));
    await userEvent.click(screen.getByRole("button", { name: "AgentOption" }));

    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );

    await waitFor(() => expect(requestBody).toMatchObject({ client_types: ["agent"] }));
  });

  test("GIVEN the default form (revocable checked) WHEN generate is clicked THEN idempotent is false", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("switch", { name: "RevocableOption" })).toBeChecked();
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() => expect(requestBody).toEqual({ client_types: ["api"], idempotent: false }));
  });

  test("GIVEN the revocable switch is unchecked WHEN generate is clicked THEN idempotent is true", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    await userEvent.click(screen.getByRole("switch", { name: "RevocableOption" }));
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() => expect(requestBody).toEqual({ client_types: ["api"], idempotent: true }));
  });

  test("GIVEN a revocable token with an expiry WHEN generate is clicked THEN expire is sent", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    // Make the revocable state explicit so this test is independent of the form's default.
    const revocable: HTMLInputElement = screen.getByRole("switch", { name: "RevocableOption" });
    if (!revocable.checked) {
      await userEvent.click(revocable);
    }

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: words("settings.tabs.token.expiry") }),
      "3600"
    );
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() =>
      expect(requestBody).toEqual({ client_types: ["api"], idempotent: false, expire: 3600 })
    );
  });

  test("GIVEN a custom expiry WHEN generate is clicked THEN the computed expire is sent", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    // Make the revocable state explicit so this test is independent of the form's default.
    const revocable: HTMLInputElement = screen.getByRole("switch", { name: "RevocableOption" });
    if (!revocable.checked) {
      await userEvent.click(revocable);
    }

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: words("settings.tabs.token.expiry") }),
      "custom"
    );
    await userEvent.type(screen.getByRole("spinbutton", { name: "ExpiryCustomAmount" }), "12");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "ExpiryCustomUnit" }),
      "hours"
    );
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() =>
      expect(requestBody).toEqual({ client_types: ["api"], idempotent: false, expire: 12 * 3600 })
    );
  });

  test("GIVEN a custom expiry without a valid amount WHEN generate is clicked THEN expire is not sent", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    // Make the revocable state explicit so this test is independent of the form's default.
    const revocable: HTMLInputElement = screen.getByRole("switch", { name: "RevocableOption" });
    if (!revocable.checked) {
      await userEvent.click(revocable);
    }

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: words("settings.tabs.token.expiry") }),
      "custom"
    );
    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() => expect(requestBody).toEqual({ client_types: ["api"], idempotent: false }));
  });

  test("GIVEN a non-revocable token THEN the expiry input is hidden and expire is not sent", async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v2/environment_auth", async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ data: "tokenstring123" });
      })
    );

    const { component } = setup();

    render(component);

    // Make the revocable state explicit so this test is independent of the form's default.
    const revocable: HTMLInputElement = screen.getByRole("switch", { name: "RevocableOption" });
    if (revocable.checked) {
      await userEvent.click(revocable);
    }

    expect(
      screen.queryByRole("combobox", { name: words("settings.tabs.token.expiry") })
    ).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: words("settings.tabs.token.generate") })
    );

    await waitFor(() => expect(requestBody).toEqual({ client_types: ["api"], idempotent: true }));
  });

  test("GIVEN TokenTab WHEN generate fails THEN the error is shown", async () => {
    server.use(
      http.post("/api/v2/environment_auth", () => {
        return HttpResponse.json({ message: "wrong params" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );

    const errorContainer = await screen.findByTestId("ToastError");

    expect(errorContainer).toBeVisible();
    expect(within(errorContainer).getByText("wrong params")).toBeVisible();
  });

  test("GIVEN TokenTab WHEN generate succeeds THEN the token is shown", async () => {
    server.use(
      http.post("/api/v2/environment_auth", () => {
        return HttpResponse.json({ data: "tokenstring123" });
      })
    );
    const { component } = setup();

    render(component);

    const copyButton = screen.getByRole("button", { name: "Copy to clipboard" });
    const tokenOutput = screen.getByRole("textbox", { name: "TokenOutput" });

    expect(copyButton).toBeDisabled();
    expect(tokenOutput).toHaveValue("");

    await userEvent.click(
      screen.getByRole("button", {
        name: words("settings.tabs.token.generate"),
      })
    );
    const updatedCopyButton = await screen.findByRole("button", { name: "Copy to clipboard" });
    const updatedTokenOutput = await screen.findByRole("textbox", { name: "TokenOutput" });

    expect(updatedCopyButton).toBeEnabled();
    expect(updatedTokenOutput).toHaveValue("tokenstring123");
  });
});
