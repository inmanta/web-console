import { DummyActionPresenter, DummyDatePresenter } from "@/Test/Mock";
import { AttributesPresenter } from "@/UI/Inventory/Presenters/AttributesPresenter";
import { TablePresenter } from "@/UI/Inventory/Presenters/TablePresenter";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter()
);
