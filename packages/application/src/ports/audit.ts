export type AuditMetadata = Readonly<
  Record<string, string | number | boolean | null>
>;

export interface AuditEntry {
  readonly actorKind: "customer" | "staff" | "system";
  readonly actorId: string | null;
  readonly organizationId: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly correlationId: string;
  readonly occurredAt: Date;
  readonly metadata?: AuditMetadata;
}

/** Gerçek yazıcı K04-06'da bağlanır. */
export interface AuditSink {
  record(entry: AuditEntry): Promise<void>;
}

export class InMemoryAuditSink implements AuditSink {
  private readonly items: AuditEntry[] = [];

  get entries(): readonly AuditEntry[] {
    return [...this.items];
  }

  async record(entry: AuditEntry): Promise<void> {
    this.items.push(Object.freeze({ ...entry }));
  }
}
