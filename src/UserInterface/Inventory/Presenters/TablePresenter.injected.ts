import { TablePresenter } from "./TablePresenter";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributePresenter } from "./AttributePresenter";
import { DummyActionPresenter } from "./DummyActionPresenter";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributePresenter(),
  new DummyActionPresenter()
);
