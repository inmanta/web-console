import React, { useState } from "react";
import { PageSize, ServiceInstanceParams } from "@/Core";
import { initialCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetInstances } from "@/Data/Managers/V2/ServiceInstance";
import { AutoCompleteInput } from "./AutoCompleteInput";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string | string[] | null;
  description?: string | null;
  isOptional: boolean;
  isDisabled?: boolean;
  handleInputChange: (value) => void;
  alreadySelected: string[] | null;
  multi?: boolean;
}

/**
 * A React component that provides an autocomplete input field for inter service relations.
 *
 * @props {object} props - The properties passed to the component.
 * @prop {string} serviceName - The name of the service.
 * @prop {string} attributeName - The name of the attribute.
 * @prop {string | string[] | null} attributeValue - The value of the attribute.
 * @prop {string | null} description - The description of the attribute.
 * @prop {boolean} isOptional - Whether the attribute is optional.
 * @prop {boolean} isDisabled - Whether the input field should be disabled.
 * @prop {(value): void;} handleInputChange - The function to handle input changes.
 * @prop {string[]} alreadySelected - The already selected options.
 * @prop {boolean} multi - Whether multiple options can be selected.
 *
 * @returns {React.FC<Props> | null} The rendered autocomplete input field or null if the data is not yet available or fetching failed.
 */
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
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});
  const { data, isLoading, isSuccess } = useGetInstances(serviceName, {
    filter,
    pageSize: PageSize.from("250"),
    currentPage: initialCurrentPage,
  }).useContinuous();

  const onSearchTextChanged = (searchText: string) => {
    setFilter({ id_or_service_identity: [searchText] });
  };

  if (isLoading) {
    return (
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
    );
  }
  if (isSuccess) {
    const options = data.data.map(
      ({ id, service_identity_attribute_value }) => {
        const displayName = service_identity_attribute_value
          ? service_identity_attribute_value
          : id;

        const isSelected =
          alreadySelected !== null && alreadySelected.includes(id); //it can be that the value for inter-service relation is set to null

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
  }

  return null;
};
