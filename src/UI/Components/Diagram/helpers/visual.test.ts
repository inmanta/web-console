import { dia } from "@inmanta/rappid";
import { Service } from "@/Test";
import {
  a as InstanceAttributesA,
  b as InstanceAttributesB,
} from "@/Test/Data/ServiceInstance/Attributes";
import { EventActionEnum, LabelLinkView } from "@/UI/Components/Diagram/interfaces";
import { childModel, parentModel } from "../Mocks";
import { createComposerEntity } from "../Actions/general";
import { ComposerPaper } from "../Paper";
import { Link } from "../Shapes/Link";
import { defineObjectsForJointJS } from "../testSetup";
import { createConnectionRules } from "./connections";
import {
  updateLabelPosition,
  toggleLooseElement,
  showLinkTools,
  moveCellsFromColliding,
} from "./visual";

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("updateLabelPosition", () => {
  /**
   * Function that creates graph, paper, two entities which are then manually placed into passed coordinates and connected by link to align with real life scenarios
   * @param {number} sourceX X coordinate for source cell
   * @param {number} sourceY Y coordinate for source cell
   * @param {number} sourceAnchorX X coordinate for source cell anchor for the link
   * @param {number} targetX X coordinate for target cell
   * @param {number} targetY Y coordinate for target cell
   * @param {number} targetAnchorX X coordinate for target cell anchor for the link
   * @returns {LabelLinkView} LinkView
   */
  const setup = (
    sourceX: number,
    sourceY: number,
    sourceAnchorX: number,
    targetX: number,
    targetY: number,
    targetAnchorX: number
  ) => {
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const sourceService = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });
    const targetService = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesB,
    });

    graph.addCell(sourceService);
    graph.addCell(targetService);

    sourceService.set("position", { x: sourceX, y: sourceY });
    targetService.set("position", { x: targetX, y: targetY });

    const connection = new Link();

    connection.source(sourceService, {
      anchor: {
        name: "center",
        args: { dx: sourceAnchorX, dy: sourceY + 25 },
      },
    });
    connection.target(targetService, {
      anchor: {
        name: "center",
        args: { dx: targetAnchorX, dy: targetY + 25 },
      },
    });

    graph.addCell(connection);

    const linkView = paper.findViewByModel(connection) as LabelLinkView;

    linkView.model.appendLabel({
      attrs: {
        rect: {
          fill: "none",
        },
        text: {
          text: sourceService.getName(),
          autoOrient: "target",
          class: "joint-label-text",
        },
      },
      position: {
        distance: 1,
      },
    });
    linkView.model.appendLabel({
      attrs: {
        rect: {
          fill: "none",
        },
        text: {
          text: targetService.getName(),
          autoOrient: "source",
          class: "joint-label-text",
        },
      },
      position: {
        distance: 0,
      },
    });

    return linkView;
  };

  it.each`
    sourceX | sourceY | sourceAnchorX | targetX | targetY | targetAnchorX | sourceResult                              | targetResult
    ${500}  | ${500}  | ${500}        | ${0}    | ${0}    | ${264}        | ${{ textAnchor: "end", x: -15, y: 15 }}   | ${{ textAnchor: "start", x: 15, y: -15 }}
    ${0}    | ${0}    | ${264}        | ${500}  | ${500}  | ${500}        | ${{ textAnchor: "start", x: 15, y: -15 }} | ${{ textAnchor: "end", x: -15, y: 15 }}
    ${500}  | ${0}    | ${500}        | ${0}    | ${500}  | ${264}        | ${{ textAnchor: "end", x: -15, y: -15 }}  | ${{ textAnchor: "start", x: 15, y: 15 }}
    ${0}    | ${500}  | ${264}        | ${500}  | ${0}    | ${500}        | ${{ textAnchor: "start", x: 15, y: 15 }}  | ${{ textAnchor: "end", x: -15, y: -15 }}
    ${0}    | ${0}    | ${0}          | ${0}    | ${500}  | ${0}          | ${{ textAnchor: "end", x: -15, y: -15 }}  | ${{ textAnchor: "end", x: -15, y: 15 }}
    ${0}    | ${500}  | ${0}          | ${0}    | ${0}    | ${0}          | ${{ textAnchor: "end", x: -15, y: 15 }}   | ${{ textAnchor: "end", x: -15, y: -15 }}
  `(
    "return adequate position of the link label depending on coordinates of the source and target",
    ({
      sourceX,
      sourceY,
      sourceAnchorX,
      targetX,
      targetY,
      targetAnchorX,
      sourceResult,
      targetResult,
    }) => {
      const linkView = setup(sourceX, sourceY, sourceAnchorX, targetX, targetY, targetAnchorX);
      const labelCloseToTarget = linkView.findLabelNode(0) as SVGSVGElement;
      const labelCloseToSource = linkView.findLabelNode(1) as SVGSVGElement;

      const result2 = updateLabelPosition(
        "source",
        linkView.getBBox(),
        labelCloseToSource,
        {},
        linkView
      );

      expect(result2).toEqual(sourceResult);

      const result = updateLabelPosition(
        "target",
        linkView.getBBox(),
        labelCloseToTarget,
        {},
        linkView
      );

      expect(result).toEqual(targetResult);
    }
  );
});

describe("toggleLooseElement", () => {
  it("dispatch a proper event with id when called", () => {
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    //add highlighter
    const entity = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });

    graph.addCell(entity);

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.ADD);

    //assert the arguments of the first call - calls is array of the arguments of each call
    expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
      JSON.stringify({ kind: "add", id: entity.id })
    );
    expect(dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element")).not.toBeNull();

    //remove
    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.REMOVE);
    expect(dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element")).toBeNull();

    //assert the arguments of the second call
    expect((dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail).toEqual(
      JSON.stringify({ kind: "remove", id: entity.id })
    );
  });

  it("appends and removes a highlighted object from an entity", () => {
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const entity = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });

    graph.addCell(entity);

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.ADD);
    expect(dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element")).not.toBeNull();

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.REMOVE);
    expect(dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element")).toBeNull();
  });
});

describe("showLinkTools", () => {
  const setup = (
    isParentInEditMode: boolean,
    isChildInEditMode: boolean,
    modifier: "rw+" | "rw"
  ) => {
    const editable = true;
    const graph = new dia.Graph({});
    const connectionRules = createConnectionRules([parentModel, childModel], {});
    const paper = new ComposerPaper(connectionRules, graph, editable).paper;

    connectionRules[childModel.name][0].modifier = modifier;

    const parentEntity = createComposerEntity({
      serviceModel: parentModel,
      isCore: false,
      isInEditMode: isParentInEditMode,
    });
    const childEntity = createComposerEntity({
      serviceModel: childModel,
      isCore: false,
      isInEditMode: isChildInEditMode,
      isEmbeddedEntity: true,
    });

    graph.addCell(parentEntity);
    graph.addCell(childEntity);

    const link = new Link();

    link.source(parentEntity);
    link.target(childEntity);

    graph.addCell(link);
    const linkView = paper.findViewByModel(link) as dia.LinkView;

    return { paper, graph, linkView, connectionRules };
  };

  it("adds tools to the link when instances aren't in EditMode and there is no rule with rw modifier", () => {
    const isParentInEditMode = false;
    const isChildInEditMode = false;
    const modifier = "rw+";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);

    expect(linkView.hasTools()).toBeTruthy();
  });

  it("adds tools to the link when only instance without rule is in edit mode", () => {
    const isParentInEditMode = true;
    const isChildInEditMode = false;
    const modifier = "rw";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);

    expect(linkView.hasTools()).toBeTruthy();
  });

  it("doesn't add tools to the link when instance with rw rule is in edit mode", () => {
    const isParentInEditMode = false;
    const isChildInEditMode = true;
    const modifier = "rw";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);
    expect(linkView.hasTools()).toBeFalsy();
  });
});

describe("moveCellsFromColliding", () => {
  it("should move cells to avoid collision", () => {
    const graph = new dia.Graph();

    new dia.Paper({
      model: graph,
    });

    const entityA = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });
    const entityB = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesB,
    });

    graph.addCell(entityA);
    graph.addCell(entityB);

    entityA.set("position", { x: 0, y: 0 });
    entityB.set("position", { x: 0, y: 0 });

    moveCellsFromColliding(graph, graph.getCells());

    const updatedCells = graph.getCells();

    expect(updatedCells[0].position()).toEqual({ x: 0, y: 50 });
    expect(updatedCells[1].position()).toEqual({ x: 0, y: 0 });
  });

  it("should not move cells if they are not colliding", () => {
    const graph = new dia.Graph();

    new dia.Paper({
      model: graph,
    });
    const entityA = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });
    const entityB = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbeddedEntity: false,
      isInEditMode: false,
      attributes: InstanceAttributesB,
    });

    graph.addCell(entityA);
    graph.addCell(entityB);

    entityA.set("position", { x: 0, y: 0 });
    entityB.set("position", { x: 200, y: 200 });

    moveCellsFromColliding(graph, graph.getCells());
    const updatedCells = graph.getCells();

    expect(updatedCells[0].position()).toEqual({ x: 0, y: 0 });
    expect(updatedCells[1].position()).toEqual({ x: 200, y: 200 });
  });
});
