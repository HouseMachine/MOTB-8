import assert from "node:assert/strict";
import { test } from "node:test";
import { processSecretInput } from "../dist/cli/secret-input.js";

const empty = () => ({
  value: "",
  complete: false,
  cancelled: false
});

test("processes synthetic text and Enter", () => {
  const state = processSecretInput(empty(), "Test123!\r");

  assert.equal(state.value, "Test123!");
  assert.equal(state.complete, true);
  assert.equal(state.cancelled, false);
});

test("handles backspace correctly", () => {
  const state = processSecretInput(empty(), "Test123\b\b\b456\r");

  assert.equal(state.value, "Test456");
  assert.equal(state.complete, true);
});

test("handles Unicode characters and backspace", () => {
  const state = processSecretInput(
    empty(),
    "Test\u{1F512}\b123\r"
  );

  assert.equal(state.value, "Test123");
  assert.equal(state.complete, true);
});

test("preserves Unicode characters", () => {
  const state = processSecretInput(
    empty(),
    "caf\u00e9\u{1F512}\r"
  );

  assert.equal(state.value, "caf\u00e9\u{1F512}");
  assert.equal(state.complete, true);
});

test("handles Ctrl+C cancellation", () => {
  const state = processSecretInput(
    empty(),
    "Test123\u0003"
  );

  assert.equal(state.cancelled, true);
  assert.equal(state.complete, false);
  assert.equal(state.value, "");
});

test("ignores input after cancellation", () => {
  const cancelled = processSecretInput(
    empty(),
    "\u0003"
  );

  const result = processSecretInput(
    cancelled,
    "MoreText\r"
  );

  assert.deepEqual(result, cancelled);
});

test("handles input across multiple chunks", () => {
  let state = empty();

  state = processSecretInput(state, "Test");
  state = processSecretInput(state, "123");
  state = processSecretInput(state, "!\r");

  assert.equal(state.value, "Test123!");
  assert.equal(state.complete, true);
  assert.equal(state.cancelled, false);
});

test("ignores input after completion", () => {
  const completed = processSecretInput(
    empty(),
    "Test123\r"
  );

  const result = processSecretInput(
    completed,
    "UnexpectedText"
  );

  assert.deepEqual(result, completed);
});

test("rejects terminal escape sequences", () => {
  const state = processSecretInput(
    empty(),
    "Test123\u001b[A\r"
  );

  assert.equal(state.cancelled, true);
  assert.equal(state.complete, false);
  assert.equal(state.value, "");
});

test("rejects escape sequences across input chunks", () => {
  let state = empty();

  state = processSecretInput(state, "Test123");
  state = processSecretInput(state, "\u001b");
  state = processSecretInput(state, "[A\r");

  assert.equal(state.cancelled, true);
  assert.equal(state.complete, false);
  assert.equal(state.value, "");
});
