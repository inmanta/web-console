import React, { useContext } from "react";
import {
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  TimesIcon,
} from "@patternfly/react-icons";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { Link, Spinner } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { HaltDialog } from "./HaltDialog";
import { ResumeDialog } from "./ResumeDialog";

export const EnvironmentControls: React.FC = () => {
  const { queryResolver, urlManager, routeManager, environmentHandler } =
    useContext(DependencyContext);

  const id = environmentHandler.useId();
  const [data] = queryResolver.useContinuous<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: false,
    id,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Bullseye>
          <Spinner variant="light" />
        </Bullseye>
      ),
      failed: () => (
        <PaddedStack>
          <StackItem>
            <Flex>
              <FlexItem>
                <Button
                  variant="danger"
                  aria-label="Server status"
                  icon={<TimesIcon />}
                  component="a"
                  href={urlManager.getServerStatusUrl()}
                  target="_blank"
                />
              </FlexItem>
              <FlexItem>
                <Button variant="danger" isDisabled />
              </FlexItem>
            </Flex>
          </StackItem>
        </PaddedStack>
      ),
      success: (data) => {
        return (
          <PaddedStack>
            <PaddedStackItem>
              {data.halted && (
                <Label color="orange" icon={<ExclamationTriangleIcon />}>
                  {words("environment.halt.label")}
                </Label>
              )}
            </PaddedStackItem>
            <StackItem>
              <Flex>
                <FlexItem>
                  <Link pathname={routeManager.getUrl("Status", undefined)}>
                    <GreenButton
                      icon={<CheckIcon />}
                      aria-label="Server status"
                    />
                  </Link>
                </FlexItem>
                <FlexItem>
                  {data.halted ? <ResumeDialog /> : <HaltDialog />}
                </FlexItem>
              </Flex>
            </StackItem>
          </PaddedStack>
        );
      },
    },
    data
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-global--success-color--100);
  }
`;

const PaddedStack = styled(Stack)`
  padding-left: 1.5rem;
`;
const PaddedStackItem = styled(StackItem)`
  padding-bottom: 1rem;
`;
