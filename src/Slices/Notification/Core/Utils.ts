import { RemoteData } from "@/Core";
import { Manifest } from "./Query";

export type ViewData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["usedData"]
>;

export type ApiData = RemoteData.RemoteData<
  Manifest["error"],
  Manifest["apiResponse"]
>;
