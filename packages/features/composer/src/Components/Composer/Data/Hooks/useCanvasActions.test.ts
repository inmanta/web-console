import { useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../../testSetup";
import { createRelationsDictionary, RelationsDictionary } from "../Helpers";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { useCanvasActions } from "./useCanvasActions";

const relation: InterServiceRelation = {
  name: "database",
  entity_type: "DatabaseService",
  lower_limit: 0,
  upper_limit: 1,
  modifier: "rw+",
};

const createModel = (name: string, overrides: Partial<ServiceModel> = {}): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: { initial_state: "active", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
  ...overrides,
});

const appModel = createModel("AppService", { inter_service_relations: [relation] });
const databaseModel = createModel("DatabaseService");
const relationsDictionary: RelationsDictionary = {
  AppService: { DatabaseService: { lower_limit: 0, upper_limit: 1 } },
  DatabaseService: { AppService: { lower_limit: 0, upper_limit: null } },
};

const createShape = (
  id: string,
  serviceModel: ServiceModel,
  isNew: boolean,
  interServiceRelations: Record<string, string[]> = {}
) =>
  new ServiceEntityShape({
    id,
    entityType: isNew ? "core" : "relation",
    serviceModel,
    instanceAttributes: {},
    isNew,
    relationsDictionary,
    rootEntities: {},
    interServiceRelations,
    embeddedEntities: {},
  });

const renderCanvasActions = (
  shapes: ServiceEntityShape[],
  dictionary: RelationsDictionary = relationsDictionary
) =>
  renderHook(() => {
    const [canvasState, setCanvasState] = useState(
      new Map(shapes.map((shape) => [shape.id, shape]))
    );

    return {
      canvasState,
      actions: useCanvasActions({
        canvasState,
        setCanvasState,
        relationsDictionary: dictionary,
        serviceCatalog: [appModel, databaseModel],
      }),
    };
  });

describe("useCanvasActions", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  describe("removeShape", () => {
    it("keeps the relation an existing instance was loaded with", () => {
      const database = createShape("db-1", databaseModel, false);
      const app = createShape("app-1", appModel, false, { DatabaseService: ["db-1"] });
      const { result } = renderCanvasActions([app, database]);

      act(() => result.current.actions.removeShape(database));

      expect(result.current.canvasState.has("db-1")).toBe(false);
      expect(app.connections.get("DatabaseService")).toEqual(["db-1"]);
      expect(app.getOrderItem(result.current.canvasState)?.attributes?.database).toBe("db-1");
    });

    it("drops a link drawn on the canvas", () => {
      const database = createShape("db-1", databaseModel, false);
      const app = createShape("app-1", appModel, true);
      const { result } = renderCanvasActions([app, database]);

      act(() => result.current.actions.connectShapes(app, database));
      expect(app.connections.get("DatabaseService")).toEqual(["db-1"]);

      act(() => result.current.actions.removeShape(database));

      expect(app.connections.has("DatabaseService")).toBe(false);
      expect(app.getOrderItem(result.current.canvasState)?.attributes?.database).toBeUndefined();
    });
  });

  describe("connectShapes", () => {
    it("puts a linked embedded entity in the first attribute of its type with room", () => {
      const createPort = (name: string): EmbeddedEntity => ({
        name,
        type: "Port",
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
        lower_limit: 0,
        upper_limit: 1,
        modifier: "rw",
      });
      const [portA, portB] = [createPort("port_a"), createPort("port_b")];
      const linkModel = createModel("Link", { embedded_entities: [portA, portB] });
      const ports = createRelationsDictionary([linkModel]);
      const createCard = (id: string, serviceModel: ServiceModel | EmbeddedEntity) =>
        new ServiceEntityShape({
          id,
          entityType: serviceModel === linkModel ? "core" : "embedded",
          serviceModel,
          instanceAttributes: {},
          isNew: true,
          relationsDictionary: ports,
          rootEntities: {},
          interServiceRelations: {},
          embeddedEntities: {},
        });
      const link = createCard("link-1", linkModel);
      const first = createCard("port-1", portA);
      const second = createCard("port-2", portA);
      const third = createCard("port-3", portA);
      const { result } = renderCanvasActions([link, first, second, third], ports);

      act(() => result.current.actions.connectShapes(link, first));
      act(() => result.current.actions.connectShapes(second, link));

      expect(first.serviceModel.name).toBe("port_a");
      expect(second.serviceModel.name).toBe("port_b");

      // An undone delete takes its attribute back, and the card that took its place moves
      act(() => result.current.actions.markShapeForDeletion(first, true));
      act(() => result.current.actions.disconnectShapes(link, second));
      act(() => result.current.actions.connectShapes(link, third));
      act(() => result.current.actions.markShapeForDeletion(first, false));

      expect(first.serviceModel.name).toBe("port_a");
      expect(third.serviceModel.name).toBe("port_b");
    });
  });

  describe("markShapeForDeletion", () => {
    it("doesn't undo a delete when the instance holding it has no room anymore", () => {
      const database = createShape("db-1", databaseModel, false);
      const otherDatabase = createShape("db-2", databaseModel, false);
      const app = createShape("app-1", appModel, true);
      const { result } = renderCanvasActions([app, database, otherDatabase]);

      act(() => result.current.actions.connectShapes(app, database));
      act(() => result.current.actions.markShapeForDeletion(database, true));
      act(() => result.current.actions.connectShapes(app, otherDatabase));
      act(() => result.current.actions.markShapeForDeletion(database, false));

      expect(database.isMarkedForDeletion).toBe(true);
      expect(app.getOrderItem(result.current.canvasState)?.attributes?.database).toBe("db-2");
    });
  });
});
