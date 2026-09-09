import { InstanceAttributeModel, VersionedServiceInstanceIdentifier, Field } from "@/Core/Domain";

export interface Command extends VersionedServiceInstanceIdentifier {
  kind: "TriggerInstanceUpdate";
  apiVersion?: string;
}

export interface Manifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: Command;
  trigger: (
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    formState: InstanceAttributeModel
  ) => Promise<string | undefined>;
}
