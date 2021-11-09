import React, { useContext } from "react";
import { ErrorView } from "@/UI/Components/ErrorView";
import { EnvironmentHandlerContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  Wrapper: React.FC;
  Dependant: React.FC<{ environment: string }>;
}

export const EnvironmentProvider: React.FunctionComponent<Props> = ({
  Wrapper,
  Dependant,
}) => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);

  const environment = environmentHandler.useSelected();
  if (environment) {
    return <Dependant environment={environment.id} />;
  } else {
    return (
      <Wrapper aria-label="EnvironmentProvider-Failed">
        <ErrorView message={words("error.environment.missing")} />
      </Wrapper>
    );
  }
};
