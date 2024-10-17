import React, { useContext } from "react";
import { Alert, Button } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string | string[] | null;
  description?: string;
  isOptional: boolean;
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
 * @prop {string} description - The description of the attribute.
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
  handleInputChange,
  alreadySelected,
  multi,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"GetService">({
    kind: "GetService",
    name: serviceName,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: (message) => (
        <Alert
          variant="danger"
          isInline
          title={words("inventory.service.failed")}
        >
          {message}
          <div>
            <Button variant="link" isInline onClick={retry}>
              {words("retry")}
            </Button>
          </div>
        </Alert>
      ),
      success: () => {
        return (
          <AutoCompleteInputProvider
            alreadySelected={alreadySelected}
            attributeName={attributeName}
            attributeValue={attributeValue}
            isOptional={isOptional}
            description={description}
            handleInputChange={handleInputChange}
            serviceName={serviceName}
            multi={multi}
          />
        );
      },
    },
    data,
  );
};
