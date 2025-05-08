import React from "react";
import { Alert, Button } from "@patternfly/react-core";
import { useGetServiceModel } from "@/Data/Managers/V2/Service";
import { words } from "@/UI/words";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string | string[] | null;
  description?: string | null;
  isOptional: boolean;
  isDisabled: boolean;
  handleInputChange: (value) => void;
  alreadySelected: string[];
  multi?: boolean;
}

/**
 * A React component that provides related services for the inter-service relation input.
 *
 * @props {object} props - The properties passed to the component.
 * @prop {string} serviceName - The name of the service.
 * @prop {string} attributeName - The name of the attribute.
 * @prop {string | string[] | null} attributeValue - The value of the attribute.
 * @prop {string | null} description - The description of the attribute.
 * @prop {boolean} isOptional - Whether the attribute is optional.
 * @prop {(value): void} handleInputChange - The function to handle input changes.
 * @prop {string[]} alreadySelected - The already selected options.
 * @prop {boolean} multi - Whether multiple options can be selected.
 *
 * @returns {React.FC<Props>| null} The rendered input with fetched related services, null if the data is not yet available or Alert if the fetching failed.
 */
export const RelatedServiceProvider: React.FC<Props> = ({
  serviceName,
  attributeName,
  attributeValue,
  description,
  isOptional,
  isDisabled,
  handleInputChange,
  alreadySelected,
  multi,
}) => {
  const { isError, error, isSuccess, refetch } = useGetServiceModel(serviceName).useContinuous();

  if (isError) {
    return (
      <Alert variant="danger" isInline title={words("inventory.service.failed")}>
        {error.message}
        <div>
          <Button variant="link" isInline onClick={() => refetch()}>
            {words("retry")}
          </Button>
        </div>
      </Alert>
    );
  }

  if (isSuccess) {
    return (
      <AutoCompleteInputProvider
        alreadySelected={alreadySelected}
        attributeName={attributeName}
        attributeValue={attributeValue}
        isOptional={isOptional}
        description={description}
        handleInputChange={handleInputChange}
        isDisabled={isDisabled}
        serviceName={serviceName}
        multi={multi}
      />
    );
  }

  return null;
};
