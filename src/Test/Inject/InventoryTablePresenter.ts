import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
} from "@/Test/Mock";
import { AttributesPresenter } from "@/UI/Pages/ServiceInventory/Presenters/AttributesPresenter";
import { InventoryTablePresenter } from "@/UI/Pages/ServiceInventory/Presenters/InventoryTablePresenter";

export const tablePresenter = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter()
);

export const tablePresenterWithIdentity = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter(),
  "order_id",
  "Order ID"
);
