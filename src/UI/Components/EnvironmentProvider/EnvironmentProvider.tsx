import React from "react";
import { useStoreState } from "@/UI/Store";
import { words } from "@/UI/words";
import { ErrorView } from "@/UI/Components/ErrorView";

interface Props {
  Wrapper: React.FC;
  Dependant: React.FC<{ environment: string }>;
}

export const EnvironmentProvider: React.FunctionComponent<Props> = ({
  Wrapper,
  Dependant,
}) => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <Dependant environment={environmentId} />
  ) : (
    <Wrapper aria-label="EnvironmentProvider-Failed">
      <ErrorView message={words("error.environment.missing")} delay={500} />
    </Wrapper>
  );
};
