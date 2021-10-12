import React, { useContext } from "react";
import { words } from "@/UI/words";
import { ErrorView } from "@/UI/Components/ErrorView";
import { RemoteData } from "@/Core";
import { EnvironmentHandlerContext } from "@/UI/Dependency";

interface Props {
  Wrapper: React.FC;
  Dependant: React.FC<{ environment: string }>;
}

export const EnvironmentProvider: React.FunctionComponent<Props> = ({
  Wrapper,
  Dependant,
}) => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);

  const environment = environmentHandler.getSelected();
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => {
        return (
          <Wrapper aria-label="EnvironmentProvider-Failed">
            <ErrorView message={words("error.environment.missing")} />
          </Wrapper>
        );
      },
      success: (data) => {
        return <Dependant environment={data.environment.id} />;
      },
    },
    environment
  );
};
