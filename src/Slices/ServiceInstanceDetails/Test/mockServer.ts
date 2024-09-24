import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import {
  historyData,
  historyDataWithDocumentation,
  instanceData,
  instanceDataWithDocumentation,
  JSONSchema,
  serviceModel,
  serviceModelWithConfig,
  serviceModelWithDocumentation,
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
    return HttpResponse.json({
      data: historyData,
    });
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

    return HttpResponse.json({
      data: historyData,
    });
  },
);

const getHistoryLogsWithDocumentation = http.get(
  "/lsm/v1/service_inventory/mobileCore/1d96a1ab/log",
  async () => {
    return HttpResponse.json({
      data: historyDataWithDocumentation,
    });
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

export const loadingServer = setupServer(
  getServiceModel,
  getHistoryLogsDelayed,
  getInstanceData,
);

export const errorServerInstance = setupServer(
  getServiceModelError,
  getHistoryLogsError,
  getInstanceError,
);

export const errorServerHistory = setupServer(
  getServiceModelWithConfig,
  getHistoryLogsError,
  getInstanceDataDelayed,
);

export const defaultServer = setupServer(
  getServiceModel,
  getHistoryLogs,
  getInstanceData,
  getJSONSchema,
  deleteInstance,
  destroyInstance,
  postStateUpdate,
  postForceStateUpdate,
);

export const defaultServerFailedActions = setupServer(
  getServiceModel,
  getHistoryLogs,
  getInstanceData,
  getJSONSchema,
  deleteInstanceFailed,
  destroyInstanceFailed,
  postStateUpdateFailed,
  postForceStateUpdateFailed,
);

export const serverWithConfig = setupServer(
  getServiceModel,
  getHistoryLogs,
  getInstanceData,
);

export const serverWithDocumentation = setupServer(
  getServiceModelWithDocumentation,
  getHistoryLogsWithDocumentation,
  getInstanceDataWithDocumentation,
);
