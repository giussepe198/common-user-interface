/**
 * Race-safe sequencing of asynchronous search requests (Terminology Matching 2007 2.3.1:
 * tag each request with an incrementing integer and ignore responses if the text changed since).
 */

export interface RequestTicket {
  /** Incrementing request number. */
  readonly id: number;
  /** The text the request was made for. */
  readonly text: string;
}

export interface RequestSequencer {
  /** Start a new request; every earlier ticket becomes stale. */
  begin(text: string): RequestTicket;
  /**
   * True only for the latest ticket, and (when `currentText` is given) only if the text has not
   * changed since the request began. Apply a response only when this returns true.
   */
  isCurrent(ticket: RequestTicket, currentText?: string): boolean;
  /** Make every outstanding ticket stale (for example when the field is cleared or closed). */
  invalidate(): void;
  /** Number of the latest ticket issued (0 before the first). */
  readonly latestId: number;
}

export function createRequestSequencer(): RequestSequencer {
  let latest = 0;
  let latestText: string | null = null;
  return {
    begin(text) {
      latest += 1;
      latestText = text;
      return { id: latest, text };
    },
    isCurrent(ticket, currentText) {
      if (ticket.id !== latest || latestText === null) return false;
      return currentText === undefined || currentText === ticket.text;
    },
    invalidate() {
      latest += 1;
      latestText = null;
    },
    get latestId() {
      return latest;
    },
  };
}
