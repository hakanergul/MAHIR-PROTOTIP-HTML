"use strict";

const assert = require("node:assert/strict");
const backup = require("../assets/js/mahir-workspace-backup.js");

const workspace = {
  teacherContext: { course: "Türk Dili ve Edebiyatı", grade: "9" },
  decisions: [{ id: "q1-destek", value: "koru" }],
  justifications: [{ id: "q1-destek", text: "Öğretmen gerekçesi" }],
  questionApprovals: [{ questionId: "q1", approved: true }],
  reportTexts: { summary: "Anonim rapor özeti" },
  approvals: { finalReport: false },
  timestamps: { savedAt: "2026-07-27T00:00:00.000Z" }
};

const current = backup.createBackup(workspace);
assert.equal(current.schemaVersion, 2);
assert.equal(backup.inspect(current).converted, false);

const legacy = backup.createLegacyV1Backup(workspace);
const migrated = backup.prepareRestore(legacy);
assert.equal(migrated.converted, true);
assert.equal(migrated.sourceVersion, 1);
assert.equal(migrated.targetVersion, 2);
assert.equal(migrated.workspace.reportTexts.summary, workspace.reportTexts.summary);
assert.equal(migrated.workspace.migration.sourceVersion, 1);
assert.equal(legacy.schemaVersion, 1, "Özgün v1 yedeği değiştirilmemeli.");

const future = { ...current, schemaVersion: 3 };
assert.throws(() => backup.prepareRestore(future), /daha yeni v3/);

const mismatched = backup.createBackup(workspace);
mismatched.workspace.schemaVersion = 1;
mismatched.integrity.digest = backup.digest((({ integrity, ...rest }) => rest)(mismatched));
assert.throws(() => backup.prepareRestore(mismatched), /sürümü uyuşmuyor/);

const tampered = backup.createBackup(workspace);
tampered.workspace.reportTexts.summary = "Değiştirildi";
assert.throws(() => backup.prepareRestore(tampered), /bütünlük kontrolünü geçemedi/);

assert.throws(
  () => backup.createBackup({ ...workspace, students: [{ fullName: "Açık öğrenci" }] }),
  /gizlilik sınırını ihlal/
);

const stored = new Map([
  [`${backup.STORAGE_PREFIX}legacy`, JSON.stringify(legacy)],
  [`${backup.STORAGE_PREFIX}broken`, "{broken"]
]);
const storage = {
  get length() { return stored.size; },
  key(index) { return Array.from(stored.keys())[index] || null; },
  getItem(key) { return stored.get(key) || null; },
  setItem(key, value) { stored.set(key, value); }
};
const storageResult = backup.migrateStoredV1Records(storage);
assert.deepEqual(storageResult, { migrated: 1, rejected: 1 });
assert.equal(JSON.parse(stored.get(`${backup.STORAGE_PREFIX}legacy`)).schemaVersion, 2);

console.log("workspace-backup.test.js: all assertions passed");
