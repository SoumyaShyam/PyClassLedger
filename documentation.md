# PyClassLedger Development Documentation

## Current Version

`v0.0.1`

## Development Objectives

- Provide a browser-based utility made with HTML, CSS, JavaScript, and jQuery.
- Let the user explicitly select a folder and inspect its `.py` files recursively.
- List Python class names alongside the relative path of each file.
- Allow the inventory to be filtered and downloaded as a CSV file.
- Keep file contents in the browser; do not upload source code.
- Maintain this document as the record of development objectives, plans, and changes.

## Development Plan

1. Build a responsive single-page interface for folder selection and inventory review.
2. Read selected Python files in the browser and identify class declarations while ignoring comments and string literals.
3. Show per-file results, file and class totals, and a text filter.
4. Export the complete inventory, including files with no classes, as CSV.
5. Verify JavaScript syntax and exercise the class scanner against representative source snippets.

## Change Log

### v0.0.1 - 2026-10-01

- Created the PyClassLedger single-page application using HTML, CSS, JavaScript, and jQuery.
- Added recursive `.py` file selection, local class discovery, per-file results, filtering, and CSV export.
- Added this development record and the requirements prompt record.

## Versioning

Use `v<major>.<minor>.<patch>`. Start new development at `v0.0.1`; increment the patch for compatible fixes, the minor for backward-compatible features, and the major for incompatible changes. Update the displayed version and this change log together for each release.