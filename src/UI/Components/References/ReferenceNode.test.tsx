import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Reference } from "@/Core/Domain";
import { indexReferences } from "@/Data/Common/References";
import { complianceReferences, environmentReferences } from "@/Data/Common/References/Mock";
import { useExpansion } from "@/Data/Common/useExpansion";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ReferenceNode } from "./ReferenceNode";

/** A node driven by the real expansion hook, so a click actually expands it. */
const Harness: React.FC<{ referenceId: string; index: Reference.ReferenceIndex }> = ({
  referenceId,
  index,
}) => {
  const [isExpanded, onToggle] = useExpansion();

  return (
    <ReferenceNode
      referenceId={referenceId}
      index={index}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
};

const renderNode = (ui: React.ReactNode) =>
  render(
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/"]}>
        <MockedDependencyProvider>{ui}</MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

const collapsed = () => false;
const noToggle = () => () => undefined;

const environmentId = environmentReferences[0].id;
const complianceRootId = complianceReferences[0].id;

test("collapses a reference to a chip and expands it to its uuid and arguments", async () => {
  renderNode(
    <Harness referenceId={environmentId} index={indexReferences(environmentReferences)} />
  );

  const toggle = screen.getByRole("button", {
    name: /std::Environment\(name=CLOUDSMITH_API_KEY\)/,
  });

  // Collapsed: the body is not rendered (so hidden subtrees cost nothing).
  expect(screen.queryByText(environmentId)).not.toBeInTheDocument();

  await userEvent.click(toggle);

  expect(screen.getByText(environmentId)).toBeVisible();
  expect(screen.getByText("name")).toBeVisible();
  expect(screen.getByText("CLOUDSMITH_API_KEY")).toBeVisible();
});

test("renders an mjson value with a replacement row per destination and recurses into references", async () => {
  renderNode(
    <Harness referenceId={complianceRootId} index={indexReferences(complianceReferences)} />
  );

  await userEvent.click(screen.getByRole("button", { name: /future::std::ComplianceReport/ }));

  // the mjson value is kept as stored, rendered in the (mocked) editor
  expect(screen.getAllByTestId("code-editor-content").length).toBeGreaterThan(0);
  // one replacement row per destination in the mjson references map
  ["$[0]", "$[1]", "$[2]"].forEach((destination) => {
    expect(screen.getByText(destination)).toBeVisible();
  });
  // one collapsed child node per destination
  const childToggles = screen.getAllByRole("button", {
    name: /future::std::CompliantResourceCompliance/,
  });

  expect(childToggles).toHaveLength(3);

  // expanding a child reveals its own reference argument, which expands again
  await userEvent.click(childToggles[0]);
  await userEvent.click(
    screen.getByRole("button", { name: /future::std::ResourceComplianceStatus/ })
  );

  expect(
    screen.getByText(
      "future::lsm::ServiceAttributeValue[lsm,uri=3ef00f70-ef21-3821-969f-1c3193f69fd4:documentation]"
    )
  ).toBeVisible();
});

test("renders a grey fallback chip for a reference id absent from the index", () => {
  renderNode(
    <ReferenceNode referenceId="missing-id" index={{}} isExpanded={collapsed} onToggle={noToggle} />
  );

  // no expandable toggle, just the id
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByText("missing-id")).toBeInTheDocument();
});

test("renders a terminal chip when a reference repeats an ancestor", () => {
  const index = indexReferences(environmentReferences);

  renderNode(
    <ReferenceNode
      referenceId={environmentId}
      index={index}
      isExpanded={collapsed}
      onToggle={noToggle}
      ancestors={[environmentId]}
    />
  );

  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByText(/cycle/)).toBeInTheDocument();
});

test("renders a truncation notice at the depth cap", () => {
  const index = indexReferences(environmentReferences);

  renderNode(
    <ReferenceNode
      referenceId={environmentId}
      index={index}
      isExpanded={collapsed}
      onToggle={noToggle}
      depth={10}
    />
  );

  expect(screen.getByText(/truncated/)).toBeInTheDocument();
});

test("renders each argument kind, links genuine resources and drops the self resource", async () => {
  const references: Reference.RawReference[] = [
    {
      id: "root",
      type: "test::AllKinds",
      args: [
        { name: "resource", type: "resource", id: "self::Resource[a,name=self]" },
        { name: "resource_id", type: "resource", id: "other::Resource[b,name=target]" },
        { name: "a_type", type: "python_type", value: "str" },
        { name: "a_get", type: "get", dict_path_expression: "config.value" },
        { name: "future", type: "brand_new_kind", value: { some: "payload" } },
      ],
    },
  ];

  renderNode(<Harness referenceId="root" index={indexReferences(references)} />);
  await userEvent.click(screen.getByRole("button", { name: /test::AllKinds/ }));

  // genuine resource argument becomes a link; the implicit self resource is dropped
  expect(screen.getByText("resource_id")).toBeVisible();
  expect(screen.getByRole("link")).toBeInTheDocument();
  expect(screen.queryByText("resource", { exact: true })).not.toBeInTheDocument();

  // python_type and get render as text, get marked unresolved
  expect(screen.getByText("str")).toBeVisible();
  expect(screen.getByText(/config\.value/)).toBeVisible();
  expect(screen.getByText(/unresolved/)).toBeVisible();

  // an unknown kind shows its type name plus the raw payload, no crash
  expect(screen.getByText("brand_new_kind")).toBeVisible();
});

test("renders a shared node at every occurrence, each expanding independently", async () => {
  // The exporter may point several parents at one node (a shared reference). It must
  // render in each place, and because expansion is keyed by tree position, opening one
  // occurrence leaves the other collapsed.
  const references: Reference.RawReference[] = [
    {
      id: "root",
      type: "test::Root",
      args: [
        { name: "child_a", type: "reference", id: "shared" },
        { name: "child_b", type: "reference", id: "shared" },
      ],
    },
    {
      id: "shared",
      type: "test::Shared",
      args: [{ name: "name", type: "literal", value: "SHARED_VALUE" }],
    },
  ];

  const keyWarnings: string[] = [];
  const spy = vi
    .spyOn(console, "error")
    .mockImplementation((...args) => keyWarnings.push(args.join(" ")));

  renderNode(<Harness referenceId="root" index={indexReferences(references)} />);
  await userEvent.click(screen.getByRole("button", { name: /test::Root/ }));

  const sharedToggles = screen.getAllByRole("button", {
    name: /test::Shared\(name=SHARED_VALUE\)/,
  });

  expect(sharedToggles).toHaveLength(2);

  // opening one occurrence expands only that one; the other stays collapsed
  await userEvent.click(sharedToggles[0]);
  expect(screen.getAllByText("SHARED_VALUE")).toHaveLength(1);

  // a shared id must not collide as a React key
  expect(keyWarnings.filter((warning) => /key/i.test(warning))).toEqual([]);
  spy.mockRestore();
});
