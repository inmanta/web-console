import React, { useContext } from "react";
import { words } from "@/UI/words";
import { ErrorView } from "@/UI/Components/ErrorView";
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

  const environment = environmentHandler.useSelected();
  if (environment && environment?.id) {
    return <Dependant environment={environment.id} />;
  } else {
    return (
      <Wrapper aria-label="EnvironmentProvider-Failed">
        <ErrorView message={words("error.environment.missing")} />
      </Wrapper>
    );
  }
};
