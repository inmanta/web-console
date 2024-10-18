import React, { useContext, useState } from "react";
import { PageSize, RemoteData, ServiceInstanceParams } from "@/Core";
import { initialCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { DependencyContext } from "@/UI/Dependency";
import { AutoCompleteInput } from "./AutoCompleteInput";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string | string[] | null;
  description?: string;
  isOptional: boolean;
  isDisabled?: boolean;
  handleInputChange: (value) => void;
  alreadySelected: string[] | null;
  multi?: boolean;
}

export const AutoCompleteInputProvider: React.FC<Props> = ({
  serviceName,
  attributeName,
  attributeValue,
  description,
  isOptional,
  isDisabled = false,
  handleInputChange,
  alreadySelected,
  multi,
  ...props
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});
  const [data] = queryResolver.useOneTime<"GetServiceInstances">({
    kind: "GetServiceInstances",
    name: serviceName,
    filter,
    pageSize: PageSize.from("250"),
    currentPage: initialCurrentPage,
  });

  const onSearchTextChanged = (searchText: string) => {
    setFilter({ id_or_service_identity: [searchText] });
  };

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <AutoCompleteInput
          options={[]}
          selected={attributeValue}
          serviceEntity={serviceName}
          attributeName={attributeName}
          isOptional={isOptional}
          shouldBeDisabled={isDisabled}
          description={description}
          handleInputChange={handleInputChange}
          onSearchTextChanged={onSearchTextChanged}
          {...props}
        />
      ),
      failed: () => null,
      success: (instancesResponse) => {
        console.log(alreadySelected);
        const options = instancesResponse.data.map(
          ({ id, service_identity_attribute_value }) => {
            const displayName = service_identity_attribute_value
              ? service_identity_attribute_value
              : id;

            const isSelected =
              alreadySelected !== null && alreadySelected.includes(id); // It is possible that selectedValue will be null

            return {
              displayName,
              value: id,
              isSelected,
            };
          },
        );

        return (
          <AutoCompleteInput
            options={options}
            attributeName={attributeName}
            serviceEntity={serviceName}
            selected={attributeValue}
            isOptional={isOptional}
            shouldBeDisabled={isDisabled}
            description={description}
            handleInputChange={handleInputChange}
            onSearchTextChanged={onSearchTextChanged}
            multi={multi}
            {...props}
          />
        );
      },
    },
    data,
  );
};
