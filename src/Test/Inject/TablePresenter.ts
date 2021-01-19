import { DummyActionPresenter, DummyDatePresenter } from "@/Test/Mock";
import { AttributesPresenter, TablePresenter } from "@/UI/Inventory/Presenters";

export const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter()
);
