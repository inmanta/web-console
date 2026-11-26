import { DesiredStateVersion } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { DesiredStateStatusLabel } from "@inmanta/web-console-ui/Components/DesiredStateStatusLabel";
import { VersionSelectOption } from "./VersionSelect";

/**
 * Turns a model version from the desired state endpoint into a version select option, with the
 * model version's status label.
 */
export const createModelVersionOption = (
  modelVersion: DesiredStateVersion
): VersionSelectOption => ({
  version: Number(modelVersion.version),
  date: modelVersion.date,
  status: <DesiredStateStatusLabel status={modelVersion.status} />,
});
