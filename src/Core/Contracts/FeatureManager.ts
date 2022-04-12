import { JsonParserId } from "./JsonParser";

export interface FeatureManager {
  isLsmEnabled(): boolean;
  isSupportEnabled(): boolean;
  getServerMajorVersion(): string;
  getServerVersion(): string;
  getEdition(): string;
  getJsonParser(): JsonParserId;
  getCommitHash(): string;
}
