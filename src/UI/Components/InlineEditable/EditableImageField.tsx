import React from "react";
import { ImageUpload } from "@/UI/Components/ImageUpload";
import { ImagePreview } from "../ImageUpload/ImagePreview";
import { EditableField, EditViewComponent, FieldProps, StaticViewComponent } from "./EditableField";

export const EditableImageField: React.FC<FieldProps> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
}) => (
  <EditableField
    isRequired={isRequired}
    initiallyEditable={initiallyEditable}
    label={label}
    initialValue={initialValue}
    onSubmit={onSubmit}
    EditView={EditView}
    StaticView={StaticView}
    alignActions="end"
  />
);

const EditView: EditViewComponent = ({ onChange, initialValue, ...props }) => (
  <ImageUpload {...props} onComplete={onChange} initial={initialValue} />
);

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <ImagePreview {...props} dataUrl={value} />
);
