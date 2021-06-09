import { ReactElement } from "react";
import { ActionPresenter } from "@/UI/Contracts";

export class DummyActionPresenter implements ActionPresenter {
  getForId(): ReactElement | null {
    return null;
  }
}
