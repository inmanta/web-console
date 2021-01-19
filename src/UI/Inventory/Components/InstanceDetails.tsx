import React from "react";
import { Attributes } from "@/Core";
import { words } from "@/UI";
import { Card, CardTitle, CardBody } from "@patternfly/react-core";
import { AttributesList } from "./AttributesList";

interface Props {
  attributes: Attributes;
}

export const InstanceDetails: React.FC<Props> = ({ attributes }) => (
  <>
    <Wrapper title={words("attributes.candidate")}>
      {attributes.candidate !== null && (
        <AttributesList attributes={attributes.candidate} />
      )}
    </Wrapper>

    <Wrapper title={words("attributes.active")}>
      {attributes.active !== null && (
        <AttributesList attributes={attributes.active} />
      )}
    </Wrapper>

    <Wrapper title={words("attributes.rollback")}>
      {attributes.rollback !== null && (
        <AttributesList attributes={attributes.rollback} />
      )}
    </Wrapper>
  </>
);

interface WrapperProps {
  title: string;
}

const Wrapper: React.FC<WrapperProps> = ({ title, children }) => (
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardBody>{children}</CardBody>
  </Card>
);
