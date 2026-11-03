import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, Service } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { useGetServiceTitle } from "./useGetServiceTitle";

const wrapper = ({ children }) => (
  <QueryClientProvider client={testClient}>
    <MockedDependencyProvider>{children}</MockedDependencyProvider>
  </QueryClientProvider>
);

describe("useGetServiceTitle", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => server.close());

  it.each`
    case                   | service                                                                  | serviceTitle
    ${"with web_title"}    | ${{ ...Service.a, entity_annotations: Service.EntityAnnotations.valid }} | ${Service.EntityAnnotations.valid.web_title}
    ${"without web_title"} | ${{ ...Service.a, entity_annotations: undefined }}                       | ${Service.a.name}
  `(
    "GIVEN a service $case WHEN the service model loads THEN it returns $serviceTitle",
    async ({ service, serviceTitle }) => {
      server.use(
        http.get(`/lsm/v1/service_catalog/${Service.a.name}`, () =>
          HttpResponse.json({ data: service })
        )
      );

      const { result } = renderHook(() => useGetServiceTitle(Service.a.name), { wrapper });

      expect(result.current).toEqual(Service.a.name);
      await waitFor(() => expect(testClient.isFetching()).toEqual(0));
      expect(result.current).toEqual(serviceTitle);
    }
  );
});
