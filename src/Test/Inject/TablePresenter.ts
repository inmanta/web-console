import { DummyActionPresenter, DummyDatePresenter } from "@/Test/Mock";
import { TablePresenter } from "@/UI/Inventory/Presenters/TablePresenter";
import { AttributesPresenter } from "@/UI/Inventory/Presenters/AttributesPresenter";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter()
);
