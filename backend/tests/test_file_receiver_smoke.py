"""Smoke tests for the file receiver's pure helper functions."""

from __future__ import annotations

from app.file_receiver import _clean_filename, validate_file_name


def test_validate_file_name_allows_supported_extension() -> None:
    result = validate_file_name("belge.docx")
    assert result.is_allowed is True
    assert result.extension == ".docx"


def test_validate_file_name_rejects_unsupported_extension() -> None:
    result = validate_file_name("belge.exe")
    assert result.is_allowed is False


def test_clean_filename_strips_windows_path() -> None:
    assert _clean_filename("C:\\Users\\x\\dosya.csv") == "dosya.csv"
