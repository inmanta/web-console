import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { InstanceDetailsContext } from "../Core/Context";
import { HistorySection } from "../UI/Components/Sections";
import { historyData, instanceData } from "./mockData";
import { SetupWrapper } from "./mockSetup";

const setup = (hasNextPage: boolean, hasPreviousPage: boolean) => {
  const fetchNextPage = vi.fn();
  const fetchPreviousPage = vi.fn();

  const component = (
    <SetupWrapper expertMode={false}>
      <InstanceDetailsContext.Provider
        value={{
          instance: instanceData,
          logsQuery: {
            data: historyData,
            hasNextPage,
            hasPreviousPage,
            fetchNextPage,
            fetchPreviousPage,
            isLoading: false,
            isError: false,
            isSuccess: true,
          } as unknown as UseInfiniteQueryResult<InstanceLog[], Error>,
          serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
        }}
      >
        <HistorySection />
      </InstanceDetailsContext.Provider>
    </SetupWrapper>
  );

  return {
    component,
    fetchNextPage,
    fetchPreviousPage,
  };
};

//I test that the HistorySection infinite query render functionalities as the component as a whole is being testes in the PAge.test.tsx file
describe("HistorySection infinite query", () => {
  it("should render", () => {
    const { component } = setup(false, false);

    render(component);

    expect(screen.getByRole("grid", { name: "VersionHistoryTable" })).toBeInTheDocument();

    const buttonPrevious = screen.queryByRole("button", {
      name: "Load previous",
    });
    const buttonNext = screen.queryByRole("button", { name: "Load next" });

    expect(buttonPrevious).toBeNull();
    expect(buttonNext).toBeNull();
  });

  it("should render with functional button to fetch newer versions", async () => {
    const { component, fetchPreviousPage } = setup(false, true);

    render(component);

    const button = screen.getByRole("button", { name: "Load next" });

    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    expect(fetchPreviousPage).toHaveBeenCalled();
  });

  it("should render with functional button to fetch previous versions", async () => {
    const { component, fetchNextPage } = setup(true, false);

    render(component);

    const button = screen.getByRole("button", { name: "Load previous" });

    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
