import {
  Row,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  ServiceModel,
  getUuidFromRaw,
  words,
} from "@inmanta/web-console-core";
import { isTransferDisabled } from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Utils";
import { ColumnHead, createTablePresenter } from "@inmanta/web-console-ui/Presenters";

const instanceToRow = (instance: ServiceInstanceModel, service: ServiceModel): Row => {
  const {
    id,
    created_at,
    last_updated,
    version,
    environment,
    service_entity,
    state,
    deployment_progress,
    service_identity_attribute_value,
    deleted,
  } = instance;

  return {
    id: getUuidFromRaw(id),
    state,
    createdAt: created_at,
    updatedAt: last_updated,
    version,
    environment,
    service_entity,
    deploymentProgress: deployment_progress,
    serviceIdentityValue: service_identity_attribute_value,
    deleted,
    editDisabled: isTransferDisabled(instance, "on_update", service),
    deleteDisabled: isTransferDisabled(instance, "on_delete", service),
  };
};

/**
 * Table presenter for the Service Inventory. When a service identity is set, its
 * column replaces the default id column and becomes sortable.
 *
 * @example createInventoryTablePresenter("service_id", "Service ID").shouldUseServiceIdentity() // true
 */
export const createInventoryTablePresenter = (
  serviceIdentity?: string,
  serviceIdentityDisplayName?: string | null
) => {
  const getIdColumnApiName = (): string => serviceIdentity ?? "id";

  const getIdColumnName = (): string => {
    if (serviceIdentityDisplayName && serviceIdentity) {
      return serviceIdentityDisplayName;
    }
    if (serviceIdentity) {
      return serviceIdentity;
    }

    return words("id");
  };

  const columnHeads: ColumnHead[] = [
    { displayName: getIdColumnName(), apiName: getIdColumnApiName() },
    { displayName: words("inventory.column.state"), apiName: "state" },
    {
      displayName: words("inventory.collumn.deploymentProgress"),
      apiName: "deployment_progress",
    },
    { displayName: words("created"), apiName: "created_at" },
    { displayName: words("updated"), apiName: "last_updated" },
  ];

  const sortableColumns = ["state", "created_at", "last_updated"];

  if (serviceIdentity) {
    sortableColumns.push(serviceIdentity);
  }

  const base = createTablePresenter<ServiceInstanceModelWithTargetStates, Row, ServiceModel>({
    columnHeads,
    sortableColumns,
    createRows: (instances, service) =>
      instances.map((instance) => instanceToRow(instance, service)),
  });

  return {
    ...base,
    getIdColumnName,
    getIdColumnApiName,
    shouldUseServiceIdentity: (): boolean => !!serviceIdentity,
  };
};

export type InventoryTablePresenter = ReturnType<typeof createInventoryTablePresenter>;
