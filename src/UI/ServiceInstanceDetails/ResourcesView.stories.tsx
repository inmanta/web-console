import React from "react";
import { ResourcesView } from "./ResourcesView";
import { DummyResourceFetcher } from "@/Test";
import { ServicesContext } from "../ServicesContext";

export default {
  title: "ResourcesView",
  component: ResourcesView,
};

const instance = {
  id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
  service_entity: "vlan-assignment",
  version: 4,
  environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
};

export const Loading: React.FC = () => (
  <ServicesContext.Provider
    value={{ resourceFetcher: new DummyResourceFetcher("Loading") }}
  >
    <ResourcesView instance={instance} title="" icon={<></>} />
  </ServicesContext.Provider>
);

export const Empty: React.FC = () => (
  <ServicesContext.Provider
    value={{ resourceFetcher: new DummyResourceFetcher("Empty") }}
  >
    <ResourcesView instance={instance} title="" icon={<></>} />
  </ServicesContext.Provider>
);

export const Failed: React.FC = () => (
  <ServicesContext.Provider
    value={{ resourceFetcher: new DummyResourceFetcher("Failed") }}
  >
    <ResourcesView instance={instance} title="" icon={<></>} />
  </ServicesContext.Provider>
);

export const Success: React.FC = () => (
  <ServicesContext.Provider
    value={{ resourceFetcher: new DummyResourceFetcher("Success") }}
  >
    <ResourcesView instance={instance} title="" icon={<></>} />
  </ServicesContext.Provider>
);
