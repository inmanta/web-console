import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { MockedDependencyProvider } from "@/Test";
import { NavigationItem } from "./NavigationItem";

function setupNavigationItem(
  props: {
    id: string;
    label: string;
    url: string;
    external?: boolean;
    locked?: boolean;
    statusIndication?: boolean;
    isActive?: boolean;
  },
  initialEntries: string[] = ["/"]
) {
  const queryClient = new QueryClient();

  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <MockedDependencyProvider>
          <NavigationItem {...props} />
        </MockedDependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("NavigationItem", () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  describe("RegularItem", () => {
    test("GIVEN regular navigation item WHEN isActive is true THEN applies active class", () => {
      const { component } = setupNavigationItem({
        id: "test-item",
        label: "Test Item",
        url: "/test",
        external: false,
        locked: false,
        statusIndication: false,
        isActive: true,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Test Item" });
      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN regular navigation item WHEN isActive is false THEN does not apply active class", () => {
      const { component } = setupNavigationItem({
        id: "test-item",
        label: "Test Item",
        url: "/test",
        external: false,
        locked: false,
        statusIndication: false,
        isActive: false,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Test Item" });
      expect(navItem).not.toHaveClass("pf-m-current");
    });

    test("GIVEN regular navigation item WHEN isActive is undefined THEN does not apply active class", () => {
      const { component } = setupNavigationItem({
        id: "test-item",
        label: "Test Item",
        url: "/test",
        external: false,
        locked: false,
        statusIndication: false,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Test Item" });
      expect(navItem).not.toHaveClass("pf-m-current");
    });
  });

  describe("ExternalItem", () => {
    test("GIVEN external navigation item WHEN isActive is true THEN applies active class", () => {
      const { component } = setupNavigationItem({
        id: "external-item",
        label: "External Item",
        url: "https://example.com",
        external: true,
        locked: false,
        statusIndication: false,
        isActive: true,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "External Item" });
      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN external navigation item WHEN isActive is false THEN does not apply active class", () => {
      const { component } = setupNavigationItem({
        id: "external-item",
        label: "External Item",
        url: "https://example.com",
        external: true,
        locked: false,
        statusIndication: false,
        isActive: false,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "External Item" });
      expect(navItem).not.toHaveClass("pf-m-current");
    });
  });

  describe("CompileReportItem", () => {
    test("GIVEN compile report item WHEN isActive is true THEN applies active class", () => {
      const { component } = setupNavigationItem({
        id: "compile-item",
        label: "Compile Reports",
        url: "/compile-reports",
        external: false,
        locked: false,
        statusIndication: true,
        isActive: true,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Compile Reports" });
      expect(navItem).toHaveClass("pf-m-current");
    });

    test("GIVEN compile report item WHEN isActive is false THEN does not apply active class", () => {
      const { component } = setupNavigationItem({
        id: "compile-item",
        label: "Compile Reports",
        url: "/compile-reports",
        external: false,
        locked: false,
        statusIndication: true,
        isActive: false,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Compile Reports" });
      expect(navItem).not.toHaveClass("pf-m-current");
    });
  });

  describe("LockedItem", () => {
    test("GIVEN locked navigation item THEN does not apply active class regardless of isActive", () => {
      const { component } = setupNavigationItem({
        id: "locked-item",
        label: "Locked Item",
        url: "/locked",
        external: false,
        locked: true,
        statusIndication: false,
        isActive: true,
      });

      render(component);

      const navItem = screen.getByRole("button", { name: "Locked Item" });
      expect(navItem).not.toHaveClass("pf-m-current");
      expect(navItem).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    test("GIVEN navigation item THEN has proper aria labels", () => {
      const { component } = setupNavigationItem({
        id: "test-item",
        label: "Test Item",
        url: "/test",
        external: false,
        locked: false,
        statusIndication: false,
        isActive: true,
      });

      render(component);

      const link = screen.getByLabelText("Sidebar-Navigation-Item");
      expect(link).toBeInTheDocument();
    });

    test("GIVEN external navigation item THEN has proper aria labels", () => {
      const { component } = setupNavigationItem({
        id: "external-item",
        label: "External Item",
        url: "https://example.com",
        external: true,
        locked: false,
        statusIndication: false,
        isActive: false,
      });

      render(component);

      const link = screen.getByLabelText("Sidebar-Navigation-Item-External");
      expect(link).toBeInTheDocument();
    });
  });
});
