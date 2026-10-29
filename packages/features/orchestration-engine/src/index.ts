import { FeatureModule } from "@inmanta/web-console-core";
import * as CompileDetails from "@inmanta/web-console-feature-orchestration-engine/Slices/CompileDetails/Core/Route";
import * as CompileReports from "@inmanta/web-console-feature-orchestration-engine/Slices/CompileReports/Core/Route";
import * as ComplianceCheck from "@inmanta/web-console-feature-orchestration-engine/Slices/ComplianceCheck/Core/Route";
import * as DesiredState from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredState/Core/Route";
import * as DesiredStateCompare from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateCompare/Core/Route";
import * as DesiredStateDetails from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateDetails/Core/Route";
import * as DesiredStateResourceDetails from "@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateResourceDetails/Core/Route";
import * as Parameters from "@inmanta/web-console-feature-orchestration-engine/Slices/Parameters/Core/Route";
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
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/CompileDetails/UI").then(
          (module) => module.CompileDetailsPage
        ),
    },
    {
      route: CompileReports.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/CompileReports/UI").then(
          (module) => module.CompileReportsPage
        ),
    },
    {
      route: ComplianceCheck.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/ComplianceCheck/UI").then(
          (module) => module.ComplianceCheckPage
        ),
    },
    {
      route: DesiredState.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/DesiredState/UI").then(
          (module) => module.DesiredStatePage
        ),
    },
    {
      route: DesiredStateCompare.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateCompare/UI").then(
          (module) => module.DesiredStateComparePage
        ),
    },
    {
      route: DesiredStateDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateDetails/UI").then(
          (module) => module.DesiredStateDetailsPage
        ),
    },
    {
      route: DesiredStateResourceDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/DesiredStateResourceDetails/UI").then(
          (module) => module.DesiredStateResourceDetailsPage
        ),
    },
    {
      route: Parameters.route,
      page: () =>
        import("@inmanta/web-console-feature-orchestration-engine/Slices/Parameters/UI").then(
          (module) => module.ParametersPage
        ),
    },
  ],
  navigation: [
    { kind: "DesiredState", group: "orchestrationEngine" },
    { kind: "CompileReports", group: "orchestrationEngine", statusIndication: true },
    { kind: "Parameters", group: "orchestrationEngine" },
  ],
};
