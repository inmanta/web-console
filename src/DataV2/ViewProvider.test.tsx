import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { ServiceModel } from "@/Core";
import * as GetServices from "./Queries/GetServices";
import { ServicesProvider } from "./ServicesProvider";

const mockedQueryResult = (
  isLoading: boolean = false,
  isPending: boolean = true,
  isError: boolean = false,
  error: Error | null = null,
) => {
  return {
    data: [],
    isLoading,
    isPending,
    isError,
    error,
  } as unknown as UseQueryResult<ServiceModel[]>;
};

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <ServicesProvider
        serviceName="test"
        Wrapper={(_name, children) => <div className="test">{children}</div>}
        Dependant={(_props) => <div>success-view</div>}
      />
    </QueryClientProvider>
  );
};

describe("ViewProvider", () => {
  beforeEach(() => {
    const mockedUseGetServices = jest.spyOn(GetServices, "useGetServices");
    mockedUseGetServices.mockImplementation(() => ({
      useContinuous: () => mockedQueryResult(),
      useOneTime: () => mockedQueryResult(),
    }));
  });
  describe("when pending", () => {
    it("returns null", () => {
      const { container } = render(setup());

      expect(container).toBeEmptyDOMElement();
    });
  });
  describe("when loading", () => {
    it("return loader", () => {
      const mockedUseGetServices = jest.spyOn(GetServices, "useGetServices");
      mockedUseGetServices.mockImplementation(() => ({
        useContinuous: () => mockedQueryResult(true, false),
        useOneTime: () => mockedQueryResult(true, false),
      }));
      render(setup());

      expect(screen.getByText("Loading")).toBeVisible();
    });
  });
  describe("when error", () => {
    it("return-error", () => {
      const mockedUseGetServices = jest.spyOn(GetServices, "useGetServices");
      const mockedResult = mockedQueryResult(false, false, true, {
        message: "Error-Message",
        name: "test-error",
      });
      mockedUseGetServices.mockImplementation(() => ({
        useContinuous: () => mockedResult,
        useOneTime: () => mockedResult,
      }));
      render(setup());

      expect(screen.getByText("Error-Message")).toBeVisible();
    });
  });
  describe("when success", () => {
    it("loads-data", () => {
      const mockedUseGetServices = jest.spyOn(GetServices, "useGetServices");
      mockedUseGetServices.mockImplementation(() => ({
        useContinuous: () => mockedQueryResult(false, false),
        useOneTime: () => mockedQueryResult(false, false),
      }));
      render(setup());
      expect(screen.getByText("success-view")).toBeVisible();
    });
  });
});
