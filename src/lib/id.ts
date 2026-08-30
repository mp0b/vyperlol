import { nanoid } from "nanoid";

/** Client-stable id for newly-created editor items (persisted as-is). */
export const newId = () => nanoid();
