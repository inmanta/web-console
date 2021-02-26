import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
} from "@/Test/Mock";
import { AttributesPresenter } from "@/UI/ServiceInventory/Presenters/AttributesPresenter";
import { InventoryTablePresenter } from "@/UI/ServiceInventory/Presenters/InventoryTablePresenter";

export const tablePresenter = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter()
);
