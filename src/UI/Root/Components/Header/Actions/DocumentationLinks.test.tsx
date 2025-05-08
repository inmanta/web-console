import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { UrlManager } from "@/Core";
import { AuthContextInterface } from "@/Data/Auth/AuthContext";
import { DependencyProvider } from "@/UI/Dependency";
import { DocumentationLinks } from "./DocumentationLinks";

const DOC_LINK = "https://docs.example.com";
const API_LINK = "https://api.example.com/docs";
const LSM_API_LINK = "https://lsm.example.com/docs";
const API_URL = "https://api.example.com";

class MockUrlManager implements UrlManager {
  getDocumentationLink(): string {
    return DOC_LINK;
  }
  getGeneralAPILink(): string {
    return API_LINK;
  }
  getLSMAPILink(): string {
    return LSM_API_LINK;
  }
  getApiUrl(): string {
    return API_URL;
  }
  setEnvironment(): void {
    throw new Error("Method not implemented.");
  }
}

const mockUrlManager = new MockUrlManager();

const mockAuthHelper = (token?: string): AuthContextInterface => ({
  getToken: () => token ?? null,
  getUser: () => null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isDisabled: () => false,
});

describe("DocumentationLinks", () => {
  it("renders links without token when no token is provided", () => {
    render(
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ urlManager: mockUrlManager, authHelper: mockAuthHelper() }}
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
    // API link
    const apiButton = screen.getByLabelText("general API link");
    expect(apiButton).toBeInTheDocument();
    const apiLink = apiButton.closest("a");
    expect(apiLink).toHaveAttribute("href", API_LINK);
  });

  it("renders links with token when authenticated", () => {
    render(
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ urlManager: mockUrlManager, authHelper: mockAuthHelper("my-token") }}
        >
          <DocumentationLinks />
        </DependencyProvider>
      </MemoryRouter>
    );
    // Documentation link
    const docButton = screen.getByLabelText("documentation link");
    expect(docButton).toBeInTheDocument();
    const docLink = docButton.closest("a");
    expect(docLink).toHaveAttribute("href", `${DOC_LINK}?token=my-token`);
    // API link
    const apiButton = screen.getByLabelText("general API link");
    expect(apiButton).toBeInTheDocument();
    const apiLink = apiButton.closest("a");
    expect(apiLink).toHaveAttribute("href", `${API_LINK}?token=my-token`);
  });
});
