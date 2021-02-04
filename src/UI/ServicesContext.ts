import { ResourceFetcher } from "@/Core";
import { DummyResourceFetcher } from "@/Test";
import { createContext } from "react";

export interface ServicesBundle {
  resourceFetcher: ResourceFetcher;
}

export const ServicesContext = createContext<ServicesBundle>({
  resourceFetcher: new DummyResourceFetcher("Success"),
});
