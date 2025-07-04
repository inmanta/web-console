import { act, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

const server = setupServer(
  http.get("/lsm/v1/service_inventory/test_entity", ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get("id_or_service_identity");
    let data = [ServiceInstance.a];
    if (filter === "ab") {
      data = [];
    }
    return HttpResponse.json({
      data,
      metadata: {
        total: 0,
        before: 0,
        after: 0,
        page_size: 250,
      },
    });
  })
);

const TestWrapper = () => {
  const [value, setValue] = useState("");

  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <AutoCompleteInputProvider
            alreadySelected={[]}
            attributeName={"test_attribute"}
            attributeValue={value}
            isOptional={false}
            description={""}
            handleInputChange={setValue}
            serviceName={"test_entity"}
            isDisabled={false}
            multi={false}
          />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
};

test("Given the AutoCompleteInputProvider When typing an instance name or id Then the correct request is fired", async () => {
  server.listen();

  render(<TestWrapper />);

  const relationInputField = await screen.findByPlaceholderText(
    "Select an instance of test_entity"
  );

  expect(relationInputField).toBeInTheDocument();

  // Type 'a' and check input value and option
  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "a" } });
  });
  expect(relationInputField).toHaveValue("a");
  expect(await screen.findByText("service_name_a")).toBeInTheDocument();

  // Type 'ab' and check input value and option
  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "ab" } });
  });
  expect(relationInputField).toHaveValue("ab");
  expect(screen.queryByText("service_name_a")).not.toBeInTheDocument();

  // Clear input and check value and option
  await act(async () => {
    fireEvent.change(relationInputField, { target: { value: "" } });
  });
  expect(relationInputField).toHaveValue("");
  expect(await screen.findByText("service_name_a")).toBeInTheDocument();

  server.close();
});
