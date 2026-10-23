import { ParsedNumber } from "@/Core/Language";
import { CompileStatus } from "./CompileStatus";

export interface CompileReport {
  id: string;
  remote_id?: string;
  environment: string;
  requested: string;
  started?: string | null;
  completed?: string | null;
  success?: boolean;
  do_export: boolean;
  force_update: boolean;
  metadata: Record<string, unknown>;
  environment_variables: Record<string, string>;
  version: ParsedNumber;
}

/**
 * Derives a compile's status from its timestamps and success flag.
 *
 * @example getStatusFromReport({ started: null, ... }) // CompileStatus.queued
 */
export const getStatusFromReport = ({
  completed,
  success,
  started,
}: CompileReport): CompileStatus => {
  if (!started) {
    return CompileStatus.queued;
  }
  if (!completed) {
    return CompileStatus.inprogress;
  }
  if (success) {
    return CompileStatus.success;
  }

  return CompileStatus.failed;
};
