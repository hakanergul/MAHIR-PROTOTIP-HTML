"""Smoke test for the CED validator against the sample fixture."""

from __future__ import annotations

from pathlib import Path

from app.validator import load_ced_json, validate_ced_payload

SHARED_DIR = Path(__file__).resolve().parents[2] / "shared"


def test_validate_ced_payload_accepts_example_fixture() -> None:
    payload = load_ced_json(SHARED_DIR / "ced-example.json")
    is_valid, errors, document = validate_ced_payload(payload)
    assert is_valid is True
    assert errors == []
    assert document is not None
