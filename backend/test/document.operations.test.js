import test from "node:test";
import assert from "node:assert/strict";
import { applyOperations } from "../src/modules/document/document.operations.js";

test("applyOperations handles insert delete and replace", () => {
  const result = applyOperations("hello", [
    { type: "insert", index: 5, text: " world" },
    { type: "replace", index: 0, length: 1, text: "H" },
    { type: "delete", index: 10, length: 1 },
  ]);

  assert.equal(result, "Hello worl");
});
