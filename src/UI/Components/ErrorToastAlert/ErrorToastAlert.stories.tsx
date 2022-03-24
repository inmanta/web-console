import React from "react";
import { ErrorToastAlert } from "..";

export default {
  title: "ErrorToastAlert",
  component: ErrorToastAlert,
};

export const Default = () => (
  <>
    <ErrorToastAlert
      title="Creating instance failed"
      errorMessage={`The following error occured while communicating with the server: 400 Bad Request 
Invalid request: 2 validation errors for st
embedded -> my_attr
  none is not an allowed value (type=type_error.none.not_allowed)
embedded3 -> 0 -> embedded_nest -> 0 -> my_attr
  none is not an allowed value (type=type_error.none.not_allowed)`}
      setErrorMessage={console.log}
    />
  </>
);
