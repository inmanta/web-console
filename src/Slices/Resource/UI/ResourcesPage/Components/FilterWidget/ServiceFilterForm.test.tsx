import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { ServiceFilterForm } from "./ServiceFilterForm";

vi.mock("@/Data/Queries", () => ({
  useGetServiceModels: () => ({
    useOneTime: () => ({
      data: [{ name: "l2Connect" }, { name: "DirectInternetAccess" }],
    }),
  }),
  useGetInstances: () => ({
    useOneTime: () => ({
      data: { data: [{ id: "uuid-1", service_identity_attribute_value: "demo-cpe-ring" }] },
      isLoading: false,
    }),
  }),
}));

const createHandlers = () => ({
  onChangeServiceEntity: vi.fn(),
  onChangeServiceInstance: vi.fn(),
  onChangeIncludeOwned: vi.fn(),
});

const renderForm = (filter: Resource.Filter, handlers: ReturnType<typeof createHandlers>) =>
  render(<ServiceFilterForm filter={filter} {...handlers} />);

describe("ServiceFilterForm", () => {
  it("selects a service entity from the catalog", async () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    // The instance field stays visible but disabled until an entity is chosen.
    expect(screen.getByTestId("service-instance-toggle")).toHaveAttribute("disabled");
    expect(
      screen.getByRole("switch", { name: words("resources.filters.service.includeOwned.label") })
    ).toBeDisabled();

    await userEvent.click(screen.getByRole("combobox", { name: "service-entityFilterInput" }));
    await userEvent.click(screen.getByText("l2Connect"));

    expect(handlers.onChangeServiceEntity).toHaveBeenCalledWith("l2Connect");
  });

  it("filters the service entity options as you type", async () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    await userEvent.type(
      screen.getByRole("combobox", { name: "service-entityFilterInput" }),
      "Direct"
    );

    expect(screen.getByText("DirectInternetAccess")).toBeInTheDocument();
    expect(screen.queryByText("l2Connect")).not.toBeInTheDocument();
  });

  it("clears the entity field when the entity is reset from outside", () => {
    const handlers = createHandlers();

    const { rerender } = render(
      <ServiceFilterForm filter={{ serviceEntity: "l2Connect" }} {...handlers} />
    );

    expect(screen.getByRole("combobox", { name: "service-entityFilterInput" })).toHaveValue(
      "l2Connect"
    );

    // Simulate the value being cleared elsewhere (e.g. removing its active-filter chip).
    rerender(<ServiceFilterForm filter={{}} {...handlers} />);

    expect(screen.getByRole("combobox", { name: "service-entityFilterInput" })).toHaveValue("");
  });

  it("toggles include-owned once an instance is set", async () => {
    const handlers = createHandlers();

    renderForm({ serviceEntity: "l2Connect", serviceInstance: "uuid-1" }, handlers);

    await userEvent.click(
      screen.getByRole("switch", {
        name: words("resources.filters.service.includeOwned.label"),
      })
    );

    expect(handlers.onChangeIncludeOwned).toHaveBeenCalledWith(true);
  });
});
