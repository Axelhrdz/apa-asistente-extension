/**
 * Extension messaging contracts (background ↔ content).
 * Keep in sync with content scripts that cannot import this module.
 */
export const MESSAGE_TYPES = {
  /** Payload: { clave: string } */
  LOOKUP_ACCOUNT: "apa/lookup_account",
};
