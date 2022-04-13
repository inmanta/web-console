import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { AutoCompleteInputProvider } from "./AutoCompleteInputProvider";

interface Props {
  serviceName: string;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  handleInputChange: (value, event) => void;
  alreadySelected: string[];
}

export const RelatedServiceProvider: React.FC<Props> = ({
  serviceName,
  attributeName,
  attributeValue,
  description,
  isOptional,
  handleInputChange,
  alreadySelected,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetService">({
    kind: "GetService",
    name: serviceName,
  });
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
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
          />
        );
      },
    },
    data
  );
};
