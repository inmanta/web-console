import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
} from "@/Test/Mock";
import { AttributesPresenter } from "@S/ServiceInventory/UI/Presenters/AttributesPresenter";
import { InventoryTablePresenter } from "@S/ServiceInventory/UI/Presenters/InventoryTablePresenter";

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
