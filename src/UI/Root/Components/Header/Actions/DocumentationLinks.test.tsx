import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { UrlManager } from "@/Core";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import { DependencyProvider } from "@/UI/Dependency";
import { DocumentationLinks } from "./DocumentationLinks";

const DOC_LINK = "https://docs.example.com";

class MockUrlManager implements UrlManager {
  getDocumentationLink(): string {
    return DOC_LINK;
  }
  getGeneralAPILink(): string {
    return "";
  }
  getLSMAPILink(): string {
    return "";
  }
  getApiUrl(): string {
    return "";
  }
}

const mockUrlManager = new MockUrlManager();

describe("DocumentationLinks", () => {
  it("renders links without token when no token is provided", () => {
    render(
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ urlManager: mockUrlManager, authHelper: defaultAuthContext }}
        >
          <DocumentationLinks />
        </DependencyProvider>
      </MemoryRouter>
    );
    // Documentation link
    const docButton = screen.getByLabelText("documentation link");
    expect(docButton).toBeInTheDocument();
    const docLink = docButton.closest("a");
    expect(docLink).toHaveAttribute("href", DOC_LINK);
    // REST API link is no longer rendered by DocumentationLinks
    expect(screen.queryByLabelText("general API link")).not.toBeInTheDocument();
  });

  it("renders links with token when authenticated", () => {
    vi.spyOn(defaultAuthContext, "getToken").mockReturnValue("my-token");
    render(
      <MemoryRouter>
        <DependencyProvider dependencies={{ urlManager: mockUrlManager }}>
          <DocumentationLinks />
        </DependencyProvider>
      </MemoryRouter>
    );
    // Documentation link
    const docButton = screen.getByLabelText("documentation link");
    expect(docButton).toBeInTheDocument();
    const docLink = docButton.closest("a");
    expect(docLink).toHaveAttribute("href", `${DOC_LINK}?token=my-token`);
    // REST API link is no longer rendered by DocumentationLinks
    expect(screen.queryByLabelText("general API link")).not.toBeInTheDocument();
  });
});
