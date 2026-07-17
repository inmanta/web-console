import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Token } from "@/Core/Domain";
import { MockedDependencyProvider } from "@/Test";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { CustomDatePresenter } from "@/UI/Utils";
import { TokenTable } from "./TokenTable";

const datePresenter = new CustomDatePresenter();

const makeToken = (overrides: Partial<Token> = {}): Token => ({
  jti: "11111111-1111-1111-1111-111111111111",
  created_by: "admin",
  client_types: ["api"],
  environment: null,
  issued_at: "2026-07-04T10:00:00+00:00",
  expires_at: null,
  revoked_at: null,
  last_used: null,
  ...overrides,
});

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <MockedDependencyProvider>
        <ModalProvider>
          <TokenTable />
        </ModalProvider>
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
}

describe("TokenTable", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN no registered tokens THEN the empty view is shown", async () => {
    server.use(http.get("/api/v2/environment_auth", () => HttpResponse.json({ data: [] })));

    render(setup());

    expect(await screen.findByLabelText("TokenTable-Empty")).toBeVisible();
  });

  test("GIVEN registered tokens THEN they are listed with creator, client types and status", async () => {
    const revokedAt = "2026-07-10T12:00:00+00:00";
    const expiresAt = "2026-08-04T10:00:00+00:00";
    server.use(
      http.get("/api/v2/environment_auth", () =>
        HttpResponse.json({
          data: [
            makeToken({
              jti: "aaa",
              created_by: "alice",
              client_types: ["api", "compiler"],
              expires_at: expiresAt,
            }),
            makeToken({ jti: "bbb", created_by: "bob", revoked_at: revokedAt }),
          ],
        })
      )
    );

    render(setup());

    const activeRow = await screen.findByLabelText("token-row-aaa");
    expect(within(activeRow).getByText("alice")).toBeVisible();
    expect(within(activeRow).getByText("api, compiler")).toBeVisible();
    expect(within(activeRow).getByText(words("settings.tabs.token.status.active"))).toBeVisible();
    expect(within(activeRow).getByText(datePresenter.getFull(expiresAt))).toBeVisible();

    const revokedRow = screen.getByLabelText("token-row-bbb");
    expect(within(revokedRow).getByText(words("settings.tabs.token.status.revoked"))).toBeVisible();
    // The revocation moment is shown for revoked tokens.
    expect(within(revokedRow).getByText(datePresenter.getFull(revokedAt))).toBeVisible();
    // An already-revoked token cannot be revoked again.
    expect(within(revokedRow).getByRole("button", { name: "revoke-bbb" })).toBeDisabled();
  });

  test("GIVEN a token WHEN revoke is confirmed THEN the revoke call is made and the list refreshes", async () => {
    let revokedJti: string | null = null;
    let tokens: Token[] = [makeToken({ jti: "ccc", created_by: "carol" })];

    server.use(
      http.get("/api/v2/environment_auth", () => HttpResponse.json({ data: tokens })),
      http.delete("/api/v2/environment_auth/:jti", ({ params }) => {
        revokedJti = params.jti as string;
        tokens = [];

        return new HttpResponse(null, { status: 200 });
      })
    );

    render(setup());

    await userEvent.click(await screen.findByRole("button", { name: "revoke-ccc" }));
    // Confirm in the modal.
    await userEvent.click(await screen.findByRole("button", { name: "confirm-revoke" }));

    await waitFor(() => expect(revokedJti).toBe("ccc"));
    expect(await screen.findByLabelText("TokenTable-Empty")).toBeVisible();
  });

  test("GIVEN a token WHEN revoke is cancelled THEN no revoke call is made", async () => {
    let deleteCalled = false;

    server.use(
      http.get("/api/v2/environment_auth", () =>
        HttpResponse.json({ data: [makeToken({ jti: "ddd" })] })
      ),
      http.delete("/api/v2/environment_auth/:jti", () => {
        deleteCalled = true;

        return new HttpResponse(null, { status: 200 });
      })
    );

    render(setup());

    await userEvent.click(await screen.findByRole("button", { name: "revoke-ddd" }));
    await userEvent.click(await screen.findByRole("button", { name: words("cancel") }));

    // The row is still there and no delete was issued.
    expect(screen.getByLabelText("token-row-ddd")).toBeVisible();
    expect(deleteCalled).toBe(false);
  });

  test("GIVEN the list request fails THEN the error view is shown", async () => {
    server.use(
      http.get("/api/v2/environment_auth", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 })
      )
    );

    render(setup());

    expect(await screen.findByLabelText("TokenTable-Failed")).toBeVisible();
  });
});
