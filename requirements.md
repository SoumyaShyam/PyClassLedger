# PyClassLedger Requirements Record

## Version

`v0.0.3`

## Prompt Change Log

### v0.0.1 - 2026-10-01

Initial requirements supplied for the AI prompt:

- Create a program named `PyClassLedger` using only HTML, CSS, JavaScript, and jQuery.
- Ask the user to select a folder.
- Read and analyze all Python files in the selected folder.
- List all class names in each Python file.
- Allow the list to be downloaded as a CSV.
- Create `documentation.md` to record development objectives, plans, and change logs.
- Create `requirements.md` to record requirement changes given through AI prompts.
- Maintain semantic versioning in the format `v<major>.<minor>.<patch>`, starting at `v0.0.1`.

### v0.0.2 - 2026-10-01

Requirement update supplied for the AI prompt:

- Ignore files during analysis when their filenames contain `serializers`, `bkup`, or `bkp`.

Interpretation: apply these filename exclusions case-insensitively to Python files before reading their contents.

### v0.0.3 - 2026-10-01

Requirement update supplied for the AI prompt:

- Do not consider subclass `Meta` from the models.

Interpretation: omit indented `Meta` class declarations, commonly used for model metadata, from inventory results; retain top-level `Meta` classes.

## Requirement Update Process

For each later prompt that changes or adds a requirement, add a dated entry under Prompt Change Log with the applicable application version. Preserve earlier entries so requirement history remains auditable.