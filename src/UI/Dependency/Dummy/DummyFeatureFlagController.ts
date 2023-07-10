import { FeatureFlagController } from "@/Core";

export class DummyFeatureFlagController implements FeatureFlagController {
  isComposerAvailable(): boolean {
    throw new Error("Method not implemented.");
  }
}
