import { KeyMaker } from "@/Core";
import { ServiceKeyMaker } from "@/Data/Service";

interface Injections {
  serviceKeyMaker: KeyMaker<[string, string]>;
}

/**
 * Unfortunately we have to hardcode the import for these
 * injections because the injection support of easy-peasy is
 * fairly limited. There is no way to inject a service like
 * KeyMaker from a top level. Easy-peasy does have injections.
 * But they are only supplied to thunks and effects.
 *
 * We can provide these injections when creating the store.
 * We can pass them allong to all slices. But this seems a
 * bit overkill for now. This might be a good idea in the
 * future.
 */
export const injections: Injections = {
  serviceKeyMaker: new ServiceKeyMaker(),
};
