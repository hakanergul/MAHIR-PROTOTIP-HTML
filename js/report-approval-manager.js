"use strict";

const reportApprovalManager = (() => {
  let approvalInput;
  let pdfButton;
  let reportScreen;

  const setApproved = (isApproved) => {
    if (!reportScreen || !pdfButton) return;
    reportScreen.dataset.reportLocked = String(isApproved);
    reportScreen.querySelectorAll("article, aside").forEach((section) => {
      section.dataset.reportLocked = String(isApproved);
    });
    pdfButton.disabled = !isApproved;
    pdfButton.setAttribute("aria-disabled", String(!isApproved));
  };

  const resetApproval = () => {
    if (approvalInput) approvalInput.checked = false;
    setApproved(false);
  };

  const printApprovedReport = () => {
    if (!approvalInput?.checked || pdfButton?.disabled) return;
    const cleanupPrintMode = () => document.body.classList.remove("print-approved-report");
    document.body.classList.add("print-approved-report");
    window.addEventListener("afterprint", cleanupPrintMode, { once: true });
    window.print();
    window.setTimeout(cleanupPrintMode, 1000);
  };

  const init = () => {
    reportScreen = document.querySelector("#report-screen");
    approvalInput = document.querySelector("[data-final-report-approval]");
    pdfButton = document.querySelector("[data-download-approved-pdf]");
    if (!reportScreen || !approvalInput || !pdfButton) return;

    resetApproval();
    approvalInput.addEventListener("change", () => setApproved(approvalInput.checked));
    pdfButton.addEventListener("click", printApprovedReport);
    document.addEventListener("mahir:report-reset", resetApproval);
  };

  return { init };
})();
