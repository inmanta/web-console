import React, { useContext } from "react";
import { Alert, Button } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string | string[];
  description?: string;
  isOptional: boolean;
  handleInputChange: (value, event) => void;
  alreadySelected: string[];
  multi?: boolean;
}

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
      success: (service) => {
        return (
          <AutoCompleteInputProvider
            alreadySelected={alreadySelected}
            attributeName={attributeName}
            attributeValue={attributeValue}
            isOptional={isOptional}
            description={description}
            handleInputChange={handleInputChange}
            serviceName={serviceName}
            serviceIdentity={service.service_identity}
            multi={multi}
          />
        );
      },
    },
    data,
  );
};
