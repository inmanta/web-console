import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import {
  logsResponse,
  instanceData,
  instanceDataWithDocumentation,
  JSONSchema,
  serviceModel,
  serviceModelWithConfig,
  serviceModelWithDocumentation,
  logsWithDocumentationResponse,
} from "./mockData";

const getServiceModel = http.get("/lsm/v1/service_catalog/mobileCore", () => {
  return HttpResponse.json({
    data: serviceModel,
  });
});

const getServiceModelError = http.get(
  "/lsm/v1/service_catalog/mobileCore",
  () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  },
);

const getServiceModelWithDocumentation = http.get(
  "/lsm/v1/service_catalog/mobileCore",
  async () => {
    return HttpResponse.json({
      data: serviceModelWithDocumentation,
    });
  },
);

const getServiceModelWithConfig = http.get(
  "/lsm/v1/service_catalog/mobileCore",
  async () => {
    return HttpResponse.json({
      data: serviceModelWithConfig,
    });
  },
);

const getHistoryLogs = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/log",
  async () => {
    return HttpResponse.json(logsResponse);
  },
);

const getHistoryLogsError = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/log",
  () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  },
);

const getHistoryLogsDelayed = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/log",
  async () => {
    await delay(500);

    return HttpResponse.json(logsResponse);
  },
);

const getHistoryLogsWithDocumentation = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/log",
  async () => {
    return HttpResponse.json(logsWithDocumentationResponse);
  },
);

const getInstanceData = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab",
  () => {
    return HttpResponse.json({
      data: instanceData,
    });
  },
);

const getInstanceError = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab",
  () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  },
);

const getInstanceDataDelayed = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab",
  async () => {
    delay(300);

    return HttpResponse.json({
      data: instanceData,
    });
  },
);

const getInstanceDataWithDocumentation = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab",
  async () => {
    return HttpResponse.json({
      data: instanceDataWithDocumentation,
    });
  },
);

const getJSONSchema = http.get(
  "/lsm/v1/service_catalog/mobileCore/schema",
  () => {
    return HttpResponse.json({
      data: JSONSchema,
    });
  },
);

const getResources = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/resources",
  () => {
    return HttpResponse.json({
      data: [{ resource_id: "test_resource[],", resource_state: "deployed" }],
    });
  },
);

const getResourcesEmpty = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/resources",
  () => {
    return HttpResponse.json({
      data: [],
    });
  },
);

const getResourcesError = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/resources",
  () => {
    return HttpResponse.json({ message: "Not Found" }, { status: 404 });
  },
);

const destroyInstance = http.delete(
  "/lsm/v2/service_inventory/mobileCore/1d96a1ab/expert",
  async () => {
    return HttpResponse.json({ status: 200 });
  },
);

const destroyInstanceFailed = http.delete(
  "/lsm/v2/service_inventory/mobileCore/1d96a1ab/expert",
  async () => {
    return HttpResponse.error();
  },
);

const deleteInstance = http.delete(
  "lsm/v1/service_inventory/mobileCore/1d96a1ab",
  async () => {
    return HttpResponse.json({ status: 200 });
  },
);

const deleteInstanceFailed = http.delete(
  "lsm/v1/service_inventory/mobileCore/1d96a1ab",
  async () => {
    return HttpResponse.error();
  },
);

const postForceStateUpdate = http.post(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/expert/state",
  async () => {
    return HttpResponse.json({ status: 200 });
  },
);

const postForceStateUpdateFailed = http.post(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/expert/state",
  async () => {
    return HttpResponse.error();
  },
);

const postStateUpdate = http.post(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/state",
  async () => {
    return HttpResponse.json({ status: 200 });
  },
);

const postStateUpdateFailed = http.post(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/state",
  async () => {
    return HttpResponse.error();
  },
);

/**
 * Setup a test server where the queries are delayed
 */
export const loadingServer = setupServer(
  getServiceModel,
  getHistoryLogsDelayed,
  getInstanceData,
  getResources,
);

/**
 * Setup a test server where all the initial GET queries return with an error
 */
export const errorServerInstance = setupServer(
  getServiceModelError,
  getHistoryLogsError,
  getInstanceError,
  getResourcesError,
);

/**
 * Setup a test server where only the HistoryLogs GET query returns an error
 */
export const errorServerHistory = setupServer(
  getServiceModelWithConfig,
  getHistoryLogsError,
  getInstanceDataDelayed,
  getResources,
);

/**
 * Setup a default test server where all queries succeed
 * This server doesn't have documentation for any attributes
 */
export const defaultServer = setupServer(
  getServiceModel,
  getHistoryLogs,
  getInstanceData,
  getJSONSchema,
  deleteInstance,
  destroyInstance,
  postStateUpdate,
  postForceStateUpdate,
  getResources,
);

/**
 * Setup a test server where only the actions fail
 * This server doesn't have documentation for any attributes
 */
export const serverFailedActions = setupServer(
  getServiceModel,
  getHistoryLogs,
  getInstanceData,
  getJSONSchema,
  deleteInstanceFailed,
  destroyInstanceFailed,
  postStateUpdateFailed,
  postForceStateUpdateFailed,
  getResources,
);

/**
 * Setup a test server with documentation for a certain attribute
 */
export const serverWithDocumentation = setupServer(
  getServiceModelWithDocumentation,
  getHistoryLogsWithDocumentation,
  getInstanceDataWithDocumentation,
  getResources,
);

export const emptyResourcesServer = setupServer(getResourcesEmpty);
