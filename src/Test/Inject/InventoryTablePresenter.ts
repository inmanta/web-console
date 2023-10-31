import {
  DummyActionPresenter,
  DummyDatePresenter,
  DummyStatePresenter,
} from "@/Test/Mock";
import { ActionPresenter } from "@/UI/Presenters";
import { AttributesPresenter } from "@S/ServiceInventory/UI/Presenters/AttributesPresenter";
import { InventoryTablePresenter } from "@S/ServiceInventory/UI/Presenters/InventoryTablePresenter";

export const tablePresenter = (actionPresenter?: ActionPresenter) =>
  new InventoryTablePresenter(
    new DummyDatePresenter(),
    new AttributesPresenter(),
    actionPresenter || new DummyActionPresenter(),
    new DummyStatePresenter(),
  );

export const tablePresenterWithIdentity = (actionPresenter?: ActionPresenter) =>
  new InventoryTablePresenter(
    new DummyDatePresenter(),
    new AttributesPresenter(),
    actionPresenter || new DummyActionPresenter(),
    new DummyStatePresenter(),
    "order_id",
    "Order ID",
  );
