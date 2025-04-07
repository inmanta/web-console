import React from "react";
import styled, { css } from "styled-components";
import { ImageHelper } from "@/Data";

export const ImagePreview: React.FC<{ dataUrl: string }> = ({ dataUrl, ...props }) =>
  dataUrl !== "" ? (
    <StyledImage {...props} src={ImageHelper.addDataScheme(dataUrl)} alt="image preview" />
  ) : (
    <FillerImage {...props}>no icon</FillerImage>
  );

const dimensions = css`
  display: block;
  margin-bottom: 8px;
  width: 96px;
  height: 96px;
`;

const StyledImage = styled.img`
  ${dimensions};
  object-fit: contain;
`;

const FillerImage = styled.div`
  ${dimensions};
  background-color: var(--pf-t--global--background--color--secondary--default);
  color: var(--pf-t--global--text--color--subtle);
  text-align: center;
  line-height: 96px;
  font-size: var(--pf-t--global--icon--size--xl);
  font-weight: var(--pf-t--global--font--weight--300);
  border-radius: var(--pf-t--global--border--radius--small);
`;
