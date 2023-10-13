import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
  DummyExpertActionPresenter,
} from "@/Test/Mock";
import { AttributesPresenter } from "@S/ServiceInventory/UI/Presenters/AttributesPresenter";
import { InventoryTablePresenter } from "@S/ServiceInventory/UI/Presenters/InventoryTablePresenter";

export const tablePresenter = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyExpertActionPresenter(),
  new DummyStatePresenter(),
);

export const tablePresenterWithIdentity = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyExpertActionPresenter(),
  new DummyStatePresenter(),
  "order_id",
  "Order ID",
);
