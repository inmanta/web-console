import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { words } from "@inmanta/web-console-core";
import { MockedDependencyProvider, Service } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { route } from "./Route";

const wrapper = ({ children }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

describe("ServiceDetails route useLabel", () => {
  const server = setupServer();
  const serviceName = "basic service";

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it("GIVEN an encoded url param THEN the label uses the decoded name until the web_title loads", async () => {
    const requestedServiceNames: string[] = [];

    server.use(
      http.get("/lsm/v1/service_catalog/:service", ({ params }) => {
        requestedServiceNames.push(String(params.service));

        return HttpResponse.json({
          data: {
            ...Service.a,
            name: serviceName,
            entity_annotations: Service.EntityAnnotations.valid,
          },
        });
      })
    );

    const { useLabel } = route("");
    const { result } = renderHook(() => useLabel?.({ service: encodeURIComponent(serviceName) }), {
      wrapper,
    });

    expect(result.current).toEqual(words("ServiceDetails.title")(serviceName));
    await waitFor(() => expect(testClient.isFetching()).toEqual(0));
    expect(result.current).toEqual(
      words("ServiceDetails.title")(Service.EntityAnnotations.valid.web_title)
    );
    expect(requestedServiceNames).toEqual([serviceName]);
  });
});
