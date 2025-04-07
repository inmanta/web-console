import { ApiHelper, VersionInfo } from "@/Core";
import { Type } from "@/Core/Language/Either";

export function GetVersionFileQueryManager(
  apiHelper: ApiHelper,
): Promise<Type<string, VersionInfo>> {
  return apiHelper.getWithoutEnvironment("/console/version.json");
}
