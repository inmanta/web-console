import { render, screen, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { ServiceFilterForm } from "./ServiceFilterForm";

vi.mock("@/Data/Queries", () => ({
  useGetServiceModels: () => ({
    useOneTime: () => ({
      data: [{ name: "l2Connect" }, { name: "DirectInternetAccess" }],
      isLoading: false,
    }),
  }),
  useGetInstances: () => ({
    useInfiniteScroll: () => ({
      data: {
        pages: [{ data: [{ id: "uuid-1", service_identity_attribute_value: "demo-cpe-ring" }] }],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    }),
  }),
}));

const createHandlers = () => ({
  onAddServiceEntity: vi.fn(),
  onAddServiceInstance: vi.fn(),
  onChangeIncludeOwned: vi.fn(),
});

const renderForm = (filter: Resource.Filter, handlers: ReturnType<typeof createHandlers>) =>
  render(<ServiceFilterForm filter={filter} {...handlers} />);

const entityInput = () =>
  screen.getByRole("combobox", {
    name: `${words("resources.filters.service.entity.label")}-input`,
  });

const instanceInput = () =>
  screen.getByRole("combobox", {
    name: `${words("resources.filters.service.instance.label")}-input`,
  });

describe("ServiceFilterForm", () => {
  it("disables the instance field and include-owned switch until the entity input has a value", () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    expect(instanceInput()).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: words("resources.filters.service.includeOwned.label") })
    ).toBeDisabled();

    fireEvent.change(entityInput(), { target: { value: "l2" } });

    expect(instanceInput()).toBeEnabled();
  });

  it("adds a service entity that matches an option", () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    fireEvent.change(entityInput(), { target: { value: "l2Connect" } });
    fireEvent.click(
      screen.getByRole("button", {
        name: `Add filter-${words("resources.filters.service.entity.label")}`,
      })
    );

    expect(handlers.onAddServiceEntity).toHaveBeenCalledWith("l2Connect");
  });

  it("adds a service instance as an id|name value when its name is selected", () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    // A known entity in the entity input enables and populates the instance field.
    fireEvent.change(entityInput(), { target: { value: "l2Connect" } });

    fireEvent.change(instanceInput(), { target: { value: "demo-cpe-ring" } });
    fireEvent.click(
      screen.getByRole("button", {
        name: `Add filter-${words("resources.filters.service.instance.label")}`,
      })
    );

    // The filter value keeps both the id (for the API) and the name (for display).
    expect(handlers.onAddServiceInstance).toHaveBeenCalledWith(
      Resource.encodeServiceInstanceFilterValue("uuid-1", "demo-cpe-ring")
    );
  });

  it("lets the service entity switch to a free-text input", async () => {
    const handlers = createHandlers();

    renderForm({}, handlers);

    await userEvent.click(
      screen.getByRole("button", {
        name: words("resources.filters.service.entity.selectInfoLabel"),
      })
    );

    const textInput = screen.getByPlaceholderText(
      words("resources.filters.service.entity.placeholder")
    );
    await userEvent.type(textInput, "custom-entity{enter}");

    expect(handlers.onAddServiceEntity).toHaveBeenCalledWith("custom-entity");
  });

  it("toggles include-owned once an instance is set", async () => {
    const handlers = createHandlers();

    renderForm(
      { serviceInstance: [Resource.encodeServiceInstanceFilterValue("uuid-1")] },
      handlers
    );

    await userEvent.click(
      screen.getByRole("switch", {
        name: words("resources.filters.service.includeOwned.label"),
      })
    );

    expect(handlers.onChangeIncludeOwned).toHaveBeenCalledWith(true);
  });
});
