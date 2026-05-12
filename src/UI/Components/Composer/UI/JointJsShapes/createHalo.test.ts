import { dia, shapes } from "@joint/plus";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import { defineObjectsForJointJS } from "../../testSetup";
import { ServiceEntityShape } from "./ServiceEntityShape";
import { getConnectedLayerData } from "./createHalo";

describe("getConnectedLayerData", () => {
  beforeAll(() => {
    defineObjectsForJointJS();
  });

  // --- Factories ---

  const createMockServiceModel = (name: string): ServiceModel => ({
    name,
    environment: "test",
    lifecycle: { initial_state: "active", states: [], transfers: [] },
    attributes: [],
    config: {},
    embedded_entities: [],
    inter_service_relations: [],
    owned_entities: [],
    owner: null,
  });

  const createMockEmbeddedEntity = (name: string, type: string): EmbeddedEntity => ({
    name,
    type,
    lower_limit: 0,
    upper_limit: null,
    modifier: "rw",
    attributes: [],
    embedded_entities: [],
    inter_service_relations: [],
  });

  const createShape = (
    id: string,
    entityType: "core" | "embedded" | "relation",
    serviceModel: ServiceModel | EmbeddedEntity,
    connections: {
      embeddedEntities?: Record<string, string[]>;
      interServiceRelations?: Record<string, string[]>;
      rootEntities?: Record<string, string[]>;
    } = {}
  ): ServiceEntityShape =>
    new ServiceEntityShape({
      id,
      entityType,
      serviceModel,
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      embeddedEntities: connections.embeddedEntities ?? {},
      interServiceRelations: connections.interServiceRelations ?? {},
      rootEntities: connections.rootEntities ?? {},
    });

  // --- Tests ---

  it("returns empty results for a shape with no connections", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("ServiceA"));
    parent.addTo(graph);

    const { shapes, links } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(0);
    expect(links).toHaveLength(0);
  });

  it("finds embedded children via connections map even when no graph links exist", () => {
    // This is the key regression test: the connections map must be consulted
    // synchronously — before JointJS links are established (e.g. right after
    // a stencil drop before the useLinkInteractions effect has run).
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("ServiceA"), {
      embeddedEntities: { ChildType: ["embedded-1"] },
    });
    const child = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("child", "ChildType")
    );

    parent.addTo(graph);
    child.addTo(graph);
    // Intentionally no link is added to the graph

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("embedded-1");
  });

  it("finds relation children via connections map", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      interServiceRelations: { RelationService: ["relation-1"] },
    });
    const child = createShape("relation-1", "relation", createMockServiceModel("RelationService"));

    parent.addTo(graph);
    child.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("relation-1");
  });

  it("excludes core-type shapes from layer results", () => {
    // A core shape that also stores an inter-service reference to another core shape
    // should not expose that other core shape as a collapsible layer.
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("ServiceA"), {
      interServiceRelations: { ServiceB: ["core-2"] },
    });
    const other = createShape("core-2", "core", createMockServiceModel("ServiceB"));

    parent.addTo(graph);
    other.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(0);
  });

  it("traverses nested levels (BFS finds grandchildren)", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      embeddedEntities: { ChildType: ["embedded-1"] },
    });
    const child = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("child", "ChildType"),
      { embeddedEntities: { GrandchildType: ["embedded-2"] } }
    );
    const grandchild = createShape(
      "embedded-2",
      "embedded",
      createMockEmbeddedEntity("grandchild", "GrandchildType")
    );

    parent.addTo(graph);
    child.addTo(graph);
    grandchild.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(2);
    expect(shapes.map((s) => s.id)).toContain("embedded-1");
    expect(shapes.map((s) => s.id)).toContain("embedded-2");
  });

  it("does not loop infinitely when child has a back-reference to the parent", () => {
    // Embedded shapes store their root entity ID in connections (rootEntities).
    // The BFS must not re-visit the already-seen parent.
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      embeddedEntities: { ChildType: ["embedded-1"] },
    });
    const child = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("child", "ChildType"),
      { rootEntities: { CoreService: ["core-1"] } }
    );

    parent.addTo(graph);
    child.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("embedded-1");
  });

  it("returns no layer shapes for a leaf embedded entity (no nested children)", () => {
    // A leaf embedded entity should show no toggle button — this test guards
    // against the pre-fix behaviour where bidirectional link traversal from
    // a leaf would reach its parent and incorrectly mark the parent as a child.
    const graph = new dia.Graph();
    const leaf = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("leaf", "LeafType"),
      { rootEntities: { CoreService: ["core-1"] } }
    );
    leaf.addTo(graph);
    // core-1 is deliberately absent from the graph

    const { shapes } = getConnectedLayerData(graph, leaf);

    expect(shapes).toHaveLength(0);
  });

  it("handles multiple children under the same parent", () => {
    const graph = new dia.Graph();
    const embeddedModel = createMockEmbeddedEntity("child", "ChildType");
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      embeddedEntities: { ChildType: ["embedded-1", "embedded-2"] },
    });
    const child1 = createShape("embedded-1", "embedded", embeddedModel);
    const child2 = createShape("embedded-2", "embedded", embeddedModel);

    parent.addTo(graph);
    child1.addTo(graph);
    child2.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(2);
    expect(shapes.map((s) => s.id)).toContain("embedded-1");
    expect(shapes.map((s) => s.id)).toContain("embedded-2");
  });

  it("silently ignores connection entries that reference shapes not in the graph", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      embeddedEntities: { ChildType: ["embedded-missing"] },
    });
    parent.addTo(graph);
    // embedded-missing is never added to the graph

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(0);
  });

  it("collects graph links whose endpoints include a discovered layer shape", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      embeddedEntities: { ChildType: ["embedded-1"] },
    });
    const child = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("child", "ChildType")
    );

    parent.addTo(graph);
    child.addTo(graph);

    // Add a real link so graph.getLinks() can find it
    const link = new shapes.standard.Link();
    link.source({ id: "core-1" });
    link.target({ id: "embedded-1" });
    link.addTo(graph);

    const { links } = getConnectedLayerData(graph, parent);

    expect(links).toHaveLength(1);
  });

  it("detects children whose connections are set post-construction (InventoryTabElement pattern)", () => {
    // InventoryTabElement.ts sets connections directly on the model after drop,
    // before JointJS links are created. The BFS must find those children.
    const graph = new dia.Graph();
    const parent = createShape("relation-1", "relation", createMockServiceModel("RelationService"));
    const child = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("child", "ChildType")
    );

    parent.addTo(graph);
    child.addTo(graph);

    // Simulate what InventoryTabElement does: set connections AFTER construction
    parent.connections.set("ChildType", ["embedded-1"]);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("embedded-1");
  });
});
