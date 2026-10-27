import * as CompileDetails from "@S/CompileDetails/Core/Route";
import * as CompileReports from "@S/CompileReports/Core/Route";
import * as ComplianceCheck from "@S/ComplianceCheck/Core/Route";
import * as DesiredState from "@S/DesiredState/Core/Route";
import * as DesiredStateCompare from "@S/DesiredStateCompare/Core/Route";
import * as DesiredStateDetails from "@S/DesiredStateDetails/Core/Route";
import * as DesiredStateResourceDetails from "@S/DesiredStateResourceDetails/Core/Route";
import * as Parameters from "@S/Parameters/Core/Route";
import { FeatureModule } from "@inmanta/web-console-core";
import { orchestrationEngineMessages } from "./messages";

/**
 * The Orchestration Engine: desired state, compliance checks, compile reports and parameters.
 */
export const orchestrationEngineFeature: FeatureModule = {
  id: "orchestration-engine",
  version: APP_VERSION,
  messages: orchestrationEngineMessages,
  routes: [
    {
      route: CompileDetails.route,
      page: () => import("@S/CompileDetails/UI").then((module) => module.CompileDetailsPage),
    },
    {
      route: CompileReports.route,
      page: () => import("@S/CompileReports/UI").then((module) => module.CompileReportsPage),
    },
    {
      route: ComplianceCheck.route,
      page: () => import("@S/ComplianceCheck/UI").then((module) => module.ComplianceCheckPage),
    },
    {
      route: DesiredState.route,
      page: () => import("@S/DesiredState/UI").then((module) => module.DesiredStatePage),
    },
    {
      route: DesiredStateCompare.route,
      page: () =>
        import("@S/DesiredStateCompare/UI").then((module) => module.DesiredStateComparePage),
    },
    {
      route: DesiredStateDetails.route,
      page: () =>
        import("@S/DesiredStateDetails/UI").then((module) => module.DesiredStateDetailsPage),
    },
    {
      route: DesiredStateResourceDetails.route,
      page: () =>
        import("@S/DesiredStateResourceDetails/UI").then(
          (module) => module.DesiredStateResourceDetailsPage
        ),
    },
    {
      route: Parameters.route,
      page: () => import("@S/Parameters/UI").then((module) => module.ParametersPage),
    },
  ],
  navigation: [
    { kind: "DesiredState", group: "orchestrationEngine" },
    { kind: "CompileReports", group: "orchestrationEngine", statusIndication: true },
    { kind: "Parameters", group: "orchestrationEngine" },
  ],
};
