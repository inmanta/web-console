import React, { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { AuthContext } from "@/Data/Auth/AuthContext";
import { AuthProvider } from "@/Data/Auth/AuthProvider";
import * as CookieHelper from "@/Data/Common/CookieHelper";

const mockedUsedNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();

  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

/**
 * A minimal consumer that logs a user in through the DatabaseAuthProvider. The expiry is short (below the
 * renewal buffer) so the provider's renewal timer fires immediately, letting the tests observe renewal
 * without fake timers.
 */
const Consumer: React.FC<{ expiresIn?: number | null }> = ({ expiresIn = 30 }) => {
  const { updateUser, getUser } = useContext(AuthContext);

  return (
    <>
      <span data-testid="user">{getUser() ?? "none"}</span>
      <button onClick={() => updateUser("admin", "initial-token", expiresIn)}>login</button>
    </>
  );
};

const setup = (expiresIn?: number | null) => (
  <AuthProvider config={{ method: "database" }}>
    <Consumer expiresIn={expiresIn} />
  </AuthProvider>
);

describe("DatabaseAuthProvider session renewal", () => {
  beforeEach(() => {
    localStorage.clear();
    // A restored username so the mount effect does not log out while a (mocked) token cookie is present.
    localStorage.setItem("inmanta_user", "admin");
    mockedUsedNavigate.mockClear();
    // The provider reads the current token from the cookie to authenticate the renewal request.
    vi.spyOn(CookieHelper, "getCookie").mockReturnValue("initial-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renews the token shortly before the session expires", async () => {
    const spiedCreateCookie = vi.spyOn(CookieHelper, "createCookie");
    const server = setupServer(
      http.post("/api/v2/login/renew", () =>
        HttpResponse.json({
          data: {
            token: "renewed-token",
            user: { username: "admin", auth_method: "database" },
            expires_in: 3600,
          },
        })
      )
    );
    server.listen();

    render(setup(30));
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    // The 30s expiry is within the 60s renewal buffer, so the renewal fires right away and stores the
    // fresh token in the cookie.
    await waitFor(() =>
      expect(spiedCreateCookie).toHaveBeenCalledWith("inmanta_user", "renewed-token", 12)
    );

    server.close();
  });

  it("logs the user out when renewal fails", async () => {
    const spiedRemoveCookie = vi.spyOn(CookieHelper, "removeCookie");
    const server = setupServer(
      http.post("/api/v2/login/renew", () => new HttpResponse(null, { status: 401 }))
    );
    server.listen();

    render(setup(30));
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() =>
      expect(mockedUsedNavigate).toHaveBeenCalledWith(expect.stringContaining("login"))
    );
    expect(spiedRemoveCookie).toHaveBeenCalledWith("inmanta_user");

    server.close();
  });

  it("does not schedule renewal for a session without an expiry", async () => {
    let renewCalls = 0;
    const server = setupServer(
      http.post("/api/v2/login/renew", () => {
        renewCalls += 1;

        return HttpResponse.json({
          data: {
            token: "renewed-token",
            user: { username: "admin", auth_method: "database" },
            expires_in: 3600,
          },
        });
      })
    );
    server.listen();

    render(setup(null));
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    // Give any (unexpected) scheduled renewal a chance to fire before asserting none did.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(renewCalls).toBe(0);
    expect(localStorage.getItem("inmanta_session_expiry")).toBeNull();

    server.close();
  });
});
