"use strict";

$(function () {
  const $folderInput = $("#folder-input");
  const $resultsBody = $("#results-body");
  const $searchInput = $("#search-input");
  const $exportButton = $("#export-button");
  const $scanStatus = $("#scan-status");
  let inventory = [];
  let hasScannedFolder = false;

  function maskStringsAndComments(source) {
    const characters = source.split("");
    let quote = "";
    let tripleQuoted = false;
    let inComment = false;

    for (let index = 0; index < characters.length; index += 1) {
      const character = source[index];

      if (inComment) {
        if (character === "\n") {
          inComment = false;
        } else if (character !== "\r") {
          characters[index] = " ";
        }
        continue;
      }

      if (quote) {
        if (character === "\\") {
          characters[index] = " ";
          if (index + 1 < characters.length) {
            if (source[index + 1] !== "\n" && source[index + 1] !== "\r") {
              characters[index + 1] = " ";
            }
            index += 1;
          }
          continue;
        }

        if (tripleQuoted && source.slice(index, index + 3) === quote.repeat(3)) {
          characters[index] = " ";
          characters[index + 1] = " ";
          characters[index + 2] = " ";
          index += 2;
          quote = "";
          tripleQuoted = false;
          continue;
        }

        if (!tripleQuoted && character === quote) {
          characters[index] = " ";
          quote = "";
          continue;
        }

        if (character === "\n" || character === "\r") {
          if (!tripleQuoted) {
            quote = "";
          }
        } else {
          characters[index] = " ";
        }
        continue;
      }

      if (character === "#") {
        characters[index] = " ";
        inComment = true;
      } else if (character === "'" || character === '"') {
        quote = character;
        tripleQuoted = source.slice(index, index + 3) === character.repeat(3);
        characters[index] = " ";
        if (tripleQuoted) {
          characters[index + 1] = " ";
          characters[index + 2] = " ";
          index += 2;
        }
      }
    }

    return characters.join("");
  }

  function findClassNames(source) {
    const code = maskStringsAndComments(source.replace(/^\uFEFF/, ""));
    const classPattern = /^[\t ]*class[\t ]+([\p{ID_Start}_][\p{ID_Continue}]*)/gmu;
    return Array.from(code.matchAll(classPattern), (match) => match[1]);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderResults() {
    const query = $searchInput.val().trim().toLocaleLowerCase();
    const visibleFiles = inventory.filter((file) => {
      const searchable = `${file.path} ${file.classes.join(" ")}`.toLocaleLowerCase();
      return searchable.includes(query);
    });

    if (visibleFiles.length === 0) {
      const message = !hasScannedFolder
        ? "Choose a folder to see its Python files."
        : inventory.length === 0
          ? "No Python files were found in this folder."
          : "No files or classes match this filter.";
      $resultsBody.html(`<tr class="empty-row"><td colspan="2">${message}</td></tr>`);
      $("#result-count").text("");
      return;
    }

    const rows = visibleFiles.map((file) => {
      const classContent = file.error
        ? `<span class="read-error">Could not read this file</span>`
        : file.classes.length
          ? `<div class="class-list">${file.classes.map((name) => `<span class="class-name">${escapeHtml(name)}</span>`).join("")}</div>`
          : `<span class="no-classes">No classes found</span>`;
      return `<tr><td class="file-name">${escapeHtml(file.path)}</td><td>${classContent}</td></tr>`;
    });

    $resultsBody.html(rows.join(""));
    $("#result-count").text(`Showing ${visibleFiles.length} of ${inventory.length} Python files`);
  }

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
  }

  function downloadCsv() {
    const rows = [["Python file", "Class name"]];
    inventory.forEach((file) => {
      if (file.classes.length === 0) {
        rows.push([file.path, ""]);
      } else {
        file.classes.forEach((name) => rows.push([file.path, name]));
      }
    });

    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pyclassledger-classes.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function scanFolder(files) {
    hasScannedFolder = true;
    const pythonFiles = Array.from(files)
      .filter((file) => file.name.toLocaleLowerCase().endsWith(".py"))
      .sort((left, right) => left.webkitRelativePath.localeCompare(right.webkitRelativePath));

    if (pythonFiles.length === 0) {
      inventory = [];
      $scanStatus.text("No .py files were found in the selected folder.");
      $("#file-count").text("0");
      $("#class-count").text("0");
      $exportButton.prop("disabled", true);
      $searchInput.prop("disabled", true).val("");
      renderResults();
      return;
    }

    $scanStatus.text(`Reading ${pythonFiles.length} Python ${pythonFiles.length === 1 ? "file" : "files"}...`);
    const results = await Promise.all(pythonFiles.map(async (file) => {
      const path = file.webkitRelativePath || file.name;
      try {
        return { path, classes: findClassNames(await file.text()), error: false };
      } catch (error) {
        return { path, classes: [], error: true };
      }
    }));

    inventory = results;
    const classCount = inventory.reduce((total, file) => total + file.classes.length, 0);
    const errorCount = inventory.filter((file) => file.error).length;
    $("#file-count").text(String(inventory.length));
    $("#class-count").text(String(classCount));
    $exportButton.prop("disabled", false);
    $searchInput.prop("disabled", false);
    $scanStatus.text(errorCount
      ? `Scanned ${inventory.length - errorCount} files; ${errorCount} could not be read.`
      : `Scanned ${inventory.length} Python ${inventory.length === 1 ? "file" : "files"}.`);
    renderResults();
  }

  $folderInput.on("change", function () {
    if (this.files && this.files.length) {
      scanFolder(this.files);
    }
  });
  $searchInput.on("input", renderResults);
  $exportButton.on("click", downloadCsv);
});