import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
} from "@/Test/Mock";
import { AttributesPresenter } from "@/UI/ServiceInventory/Presenters/AttributesPresenter";
import { TablePresenter } from "@/UI/ServiceInventory/Presenters/TablePresenter";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter()
);
