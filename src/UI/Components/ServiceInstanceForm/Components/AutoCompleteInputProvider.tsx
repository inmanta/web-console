import React, { useContext, useState } from "react";
import { PageSize, RemoteData, ServiceInstanceParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { AutoCompleteInput } from "./AutoCompleteInput";

interface Props {
  serviceName: string;
  serviceIdentity?: string;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  handleInputChange: (value, event) => void;
  alreadySelected: string[];
}

export const AutoCompleteInputProvider: React.FC<Props> = ({
  serviceName,
  serviceIdentity,
  attributeName,
  attributeValue,
  description,
  isOptional,
  handleInputChange,
  alreadySelected,
  ...props
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});
  const [data] = queryResolver.useOneTime<"GetServiceInstances">({
    kind: "GetServiceInstances",
    name: serviceName,
    filter,
    pageSize: PageSize.from("100"),
  });
  const onSearchTextChanged = (searchText: string) => {
    if (serviceIdentity) {
      setFilter({ identity: { key: serviceIdentity, value: searchText } });
    } else {
      setFilter({ id: [searchText] });
    }
  };
  const selectedValue = getCurrentValue(
    attributeValue,
    filter,
    !!serviceIdentity
  );
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <AutoCompleteInput
          options={[]}
          serviceEntity={serviceName}
          attributeName={attributeName}
          attributeValue={selectedValue}
          isOptional={isOptional}
          description={description}
          handleInputChange={handleInputChange}
          onSearchTextChanged={onSearchTextChanged}
          {...props}
        />
      ),
      failed: () => null,
      success: (instancesResponse) => {
        const options = instancesResponse.data.map(
          ({ id, service_identity_attribute_value }) => {
            const displayName = service_identity_attribute_value
              ? service_identity_attribute_value
              : id;
            return {
              displayName,
              value: id,
              alreadySelected: alreadySelected.includes(id),
            };
          }
        );
        return (
          <AutoCompleteInput
            options={options}
            attributeName={attributeName}
            serviceEntity={serviceName}
            attributeValue={selectedValue}
            isOptional={isOptional}
            description={description}
            handleInputChange={handleInputChange}
            onSearchTextChanged={onSearchTextChanged}
            {...props}
          />
        );
      },
    },
    data
  );
};

const getCurrentValue = (
  attributeValue: string,
  filter: ServiceInstanceParams.Filter,
  serviceIdentity?: boolean
): string => {
  if (attributeValue) {
    return attributeValue;
  }
  if (serviceIdentity) {
    return filter?.identity ? filter?.identity.value : "";
  }
  return filter?.id ? filter?.id[0] : "";
};
