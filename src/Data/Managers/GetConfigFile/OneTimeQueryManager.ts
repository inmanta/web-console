import { ApiHelper } from "@/Core";
import { Type } from "@/Core/Language/Either";

export function GetConfigFileQueryManager(
  apiHelper: ApiHelper
): Promise<Type<string, string>> {
  return apiHelper.getWithoutEnvironmentAsText("/console/config.js");
}
