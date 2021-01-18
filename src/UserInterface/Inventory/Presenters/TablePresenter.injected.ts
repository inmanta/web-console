import { TablePresenter } from "./TablePresenter";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import { DummyActionPresenter } from "./DummyActionPresenter";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter()
);
