import { dia, shapes } from "@joint/plus";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import { defineObjectsForJointJS } from "../../testSetup";
import {
  addConnectionsBetweenShapes,
  removeConnectionsBetweenShapes,
} from "../../Data/Helpers/linkUtils";
import { ServiceEntityShape } from "./ServiceEntityShape";
import { getConnectedLayerData, getDirectLayerData } from "./createHalo";

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

  it("includes core-type inter-service relation shapes in layer results", () => {
    // A core shape connected to another standalone core shape via interServiceRelations
    // should show that other core shape as a collapsible layer so icons appear.
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("ServiceA"), {
      interServiceRelations: { ServiceB: ["core-2"] },
    });
    const other = createShape("core-2", "core", createMockServiceModel("ServiceB"));

    parent.addTo(graph);
    other.addTo(graph);

    const { shapes } = getConnectedLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("core-2");
  });

  it("finds a newly connected core-type inter-service relation shape after addConnectionsBetweenShapes", () => {
    // Regression: connecting a new core shape to another core shape (inter-service relation)
    // at runtime must cause getConnectedLayerData to return the target so toggle/expand icons appear.
    const graph = new dia.Graph();
    const source = createShape("core-1", "core", createMockServiceModel("ServiceA"));
    const target = createShape("core-2", "core", createMockServiceModel("ServiceB"));

    source.addTo(graph);
    target.addTo(graph);

    expect(getConnectedLayerData(graph, source).shapes).toHaveLength(0);

    addConnectionsBetweenShapes(source, target);

    const { shapes: layerShapes } = getConnectedLayerData(graph, source);
    expect(layerShapes).toHaveLength(1);
    expect(layerShapes[0].id).toBe("core-2");
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

  it("returns empty for a leaf whose relation-type parent is in the graph", () => {
    // The leaf's rootEntities back-reference populates parentIds, so the BFS skips
    // upward traversal to the parent without needing established graph links.
    // This prevents expand/collapse buttons from appearing on true leaf nodes.
    const graph = new dia.Graph();
    const parent = createShape("relation-1", "relation", createMockServiceModel("RelationService"), {
      embeddedEntities: { LeafType: ["embedded-1"] },
    });
    const leaf = createShape(
      "embedded-1",
      "embedded",
      createMockEmbeddedEntity("leaf", "LeafType"),
      { rootEntities: { RelationService: ["relation-1"] } }
    );

    parent.addTo(graph);
    leaf.addTo(graph);

    const { shapes: layerShapes } = getConnectedLayerData(graph, leaf);

    expect(layerShapes).toHaveLength(0);
  });

  it("finds children via connections map when the shape has no links yet (stencil-drop)", () => {
    // parentIds-based direction detection works without established links, so a
    // freshly-dropped shape correctly shows expand/collapse buttons regardless of
    // whether other shapes on the canvas already have links.
    const graph = new dia.Graph();

    // Pre-existing shapes with an established link (simulates a populated canvas)
    const other1 = createShape("other-1", "core", createMockServiceModel("OtherService"));
    const other2 = createShape("other-2", "relation", createMockServiceModel("OtherRelation"));
    other1.addTo(graph);
    other2.addTo(graph);
    const existingLink = new shapes.standard.Link();
    existingLink.source({ id: "other-1" });
    existingLink.target({ id: "other-2" });
    existingLink.addTo(graph);

    // Freshly dropped shape: connections set but no links yet
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
    // No link between parent and child yet

    const { shapes: layerShapes } = getConnectedLayerData(graph, parent);

    expect(layerShapes).toHaveLength(1);
    expect(layerShapes[0].id).toBe("embedded-1");
  });

  it("shows children of a placeholder inter-service relation dropped with its parent (no links yet)", () => {
    // Placeholder drop creates a core shape and a relation shape together.
    // The relation shape has rootEntities pointing to the core shape (upward reference).
    // The BFS from the core shape must find the relation child via parentIds direction
    // detection, without any graph links established yet.
    const graph = new dia.Graph();
    const core = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      interServiceRelations: { RelationService: ["relation-1"] },
    });
    const relation = createShape("relation-1", "relation", createMockServiceModel("RelationService"), {
      rootEntities: { CoreService: ["core-1"] },
    });

    core.addTo(graph);
    relation.addTo(graph);
    // No links yet — simulates the state immediately after a placeholder stencil drop

    const { shapes: layerShapes } = getConnectedLayerData(graph, core);

    expect(layerShapes).toHaveLength(1);
    expect(layerShapes[0].id).toBe("relation-1");
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

  it("finds a newly connected relation child after addConnectionsBetweenShapes", () => {
    // Regression: connecting a new core shape to an inter-service relation at runtime
    // must cause getConnectedLayerData to return the relation so the toggle/expand icons appear.
    const graph = new dia.Graph();
    const core = createShape("core-1", "core", createMockServiceModel("CoreService"));
    const relation = createShape("relation-1", "relation", createMockServiceModel("RelationService"));

    core.addTo(graph);
    relation.addTo(graph);

    expect(getConnectedLayerData(graph, core).shapes).toHaveLength(0);

    addConnectionsBetweenShapes(core, relation);

    const { shapes: layerShapes } = getConnectedLayerData(graph, core);
    expect(layerShapes).toHaveLength(1);
    expect(layerShapes[0].id).toBe("relation-1");
  });

  it("returns empty after removeConnectionsBetweenShapes disconnects the last child", () => {
    // Regression: after disconnecting, icons should disappear from the source shape's halo.
    const graph = new dia.Graph();
    const core = createShape("core-1", "core", createMockServiceModel("CoreService"), {
      interServiceRelations: { RelationService: ["relation-1"] },
    });
    const relation = createShape("relation-1", "relation", createMockServiceModel("RelationService"), {
      rootEntities: { CoreService: ["core-1"] },
    });

    core.addTo(graph);
    relation.addTo(graph);

    expect(getConnectedLayerData(graph, core).shapes).toHaveLength(1);

    removeConnectionsBetweenShapes(core, relation);

    expect(getConnectedLayerData(graph, core).shapes).toHaveLength(0);
  });

  it("the newly connected child (target) still shows no children of its own", () => {
    // The target of a new connection is the child, not the parent.
    // getConnectedLayerData from the child's perspective must return empty so
    // the child's halo does not incorrectly show expand/collapse icons.
    const graph = new dia.Graph();
    const core = createShape("core-1", "core", createMockServiceModel("CoreService"));
    const relation = createShape("relation-1", "relation", createMockServiceModel("RelationService"));

    core.addTo(graph);
    relation.addTo(graph);

    addConnectionsBetweenShapes(core, relation);

    const { shapes: layerShapes } = getConnectedLayerData(graph, relation);
    expect(layerShapes).toHaveLength(0);
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

describe("getDirectLayerData", () => {
  beforeAll(() => {
    defineObjectsForJointJS();
  });

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

  it("returns only direct children, not grandchildren", () => {
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

    const { shapes } = getDirectLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("embedded-1");
  });

  it("returns empty results for a shape with no connections", () => {
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("CoreService"));
    parent.addTo(graph);

    const { shapes, links } = getDirectLayerData(graph, parent);

    expect(shapes).toHaveLength(0);
    expect(links).toHaveLength(0);
  });

  it("returns multiple direct children", () => {
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

    const { shapes } = getDirectLayerData(graph, parent);

    expect(shapes).toHaveLength(2);
    expect(shapes.map((s) => s.id)).toContain("embedded-1");
    expect(shapes.map((s) => s.id)).toContain("embedded-2");
  });

  it("includes core-type inter-service relation shapes as direct children", () => {
    // A core shape connected to another standalone core shape via interServiceRelations
    // should include that other core shape as a direct child (so icons appear on the halo).
    const graph = new dia.Graph();
    const parent = createShape("core-1", "core", createMockServiceModel("ServiceA"), {
      interServiceRelations: { ServiceB: ["core-2"] },
    });
    const other = createShape("core-2", "core", createMockServiceModel("ServiceB"));

    parent.addTo(graph);
    other.addTo(graph);

    const { shapes } = getDirectLayerData(graph, parent);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].id).toBe("core-2");
  });

  it("includes links between parent and direct children but not links to grandchildren", () => {
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

    const parentToChild = new shapes.standard.Link();
    parentToChild.source({ id: "core-1" });
    parentToChild.target({ id: "embedded-1" });
    parentToChild.addTo(graph);

    const childToGrandchild = new shapes.standard.Link();
    childToGrandchild.source({ id: "embedded-1" });
    childToGrandchild.target({ id: "embedded-2" });
    childToGrandchild.addTo(graph);

    const { links } = getDirectLayerData(graph, parent);

    expect(links).toHaveLength(1);
    expect(links[0]).toBe(parentToChild);
  });

  it("includes links between sibling direct children", () => {
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

    const siblingLink = new shapes.standard.Link();
    siblingLink.source({ id: "embedded-1" });
    siblingLink.target({ id: "embedded-2" });
    siblingLink.addTo(graph);

    const { links } = getDirectLayerData(graph, parent);

    expect(links).toHaveLength(1);
    expect(links[0]).toBe(siblingLink);
  });
});
