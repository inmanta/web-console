import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import {
  historyData,
  historyDataWithDocumentation,
  instanceData,
  instanceDataWithDocumentation,
  JSONSchema,
  serviceModel,
  serviceModelWithDocumentation,
} from "./mockData";

export const loadingServer = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", async () => {
    return HttpResponse.json({
      data: serviceModel,
    });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", async () => {
    await delay(500);

    return HttpResponse.json({
      data: historyData,
    });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", async () => {
    await delay(300);

    return HttpResponse.json({
      data: instanceData,
    });
  }),
);

export const errorServerInstance = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  }),
);

export const errorServerHistory = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", async () => {
    return HttpResponse.json({
      data: serverWithConfig,
    });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", async () => {
    delay(300);

    return HttpResponse.json({
      data: instanceData,
    });
  }),
);

export const defaultServer = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", () => {
    return HttpResponse.json({
      data: serviceModel,
    });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", () => {
    return HttpResponse.json({
      data: historyData,
    });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", () => {
    return HttpResponse.json({
      data: instanceData,
    });
  }),

  // get json schema for editor
  http.get("/lsm/v1/service_catalog/mobileCore/schema", () => {
    return HttpResponse.json({
      data: JSONSchema,
    });
  }),
);

export const serverWithConfig = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", async () => {
    return HttpResponse.json({
      data: serviceModel,
    });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", async () => {
    return HttpResponse.json({
      data: historyData,
    });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", async () => {
    return HttpResponse.json({
      data: instanceData,
    });
  }),
);

export const serverWithDocumentation = setupServer(
  // service model
  http.get("/lsm/v1/service_catalog/mobileCore", async () => {
    return HttpResponse.json({
      data: serviceModelWithDocumentation,
    });
  }),

  // history logs
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab/log", async () => {
    return HttpResponse.json({
      data: historyDataWithDocumentation,
    });
  }),

  // service instance data
  http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", async () => {
    return HttpResponse.json({
      data: instanceDataWithDocumentation,
    });
  }),
);
