import { registerGraphQLWorker } from "./graphqlWorker";

vi.mock("monaco-graphql/esm/graphql.worker.js?worker", () => ({
  default: vi.fn(function GraphQLWorker() {
    return { kind: "graphql worker" };
  }),
}));

const appWorker = { kind: "app worker" } as unknown as Worker;

afterEach(() => {
  delete self.MonacoEnvironment;
});

describe("registerGraphQLWorker", () => {
  it("starts the GraphQL worker for the graphql label", () => {
    self.MonacoEnvironment = { getWorker: vi.fn(() => appWorker) };

    registerGraphQLWorker();

    expect(self.MonacoEnvironment.getWorker?.("id", "graphql")).toEqual({
      kind: "graphql worker",
    });
  });

  it("hands every other label to the app's workers", () => {
    const getWorker = vi.fn(() => appWorker);
    self.MonacoEnvironment = { getWorker };

    registerGraphQLWorker();

    expect(self.MonacoEnvironment.getWorker?.("id", "json")).toBe(appWorker);
    expect(getWorker).toHaveBeenCalledWith("id", "json");
  });

  it("fails for another label when the app hasn't set up Monaco", () => {
    registerGraphQLWorker();

    expect(() => self.MonacoEnvironment?.getWorker?.("id", "json")).toThrow(
      'No Monaco worker for "json": the app hasn\'t set up Monaco.'
    );
  });
});
