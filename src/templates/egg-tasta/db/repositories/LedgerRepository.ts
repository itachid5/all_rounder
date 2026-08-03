import { LedgerService, PostLedgerInput, LedgerListOptions } from "@/templates/egg-tasta/services/LedgerService";

export { LedgerService };
export type { PostLedgerInput, LedgerListOptions };

export class LedgerRepository extends LedgerService {}
