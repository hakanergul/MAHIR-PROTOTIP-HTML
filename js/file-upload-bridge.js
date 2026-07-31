"use strict";

const fileUploadBridge = (() => {
  const progressTexts = ["✓ Dosya alındı", "✓ Belge okunuyor", "✓ CED oluşturuluyor", "✓ Program eşleştiriliyor", "✓ Ölçme analizi yapılıyor", "✓ Pedagojik analiz yapılıyor", "✓ Rapor hazırlanıyor", "✓ Tamamlandı"];
  const maxFileSize = 20 * 1024 * 1024;
  const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"];

  const init = () => {
    const fileInput = document.querySelector("#exam-file");
    const dropzone = document.querySelector("[data-upload-dropzone]");
    const fileCard = document.querySelector("[data-uploaded-file-card]");
    const filePreview = document.querySelector("[data-file-preview]");
    const fileName = document.querySelector("[data-file-name]");
    const fileType = document.querySelector("[data-file-type]");
    const fileSize = document.querySelector("[data-file-size]");
    const fileExtension = document.querySelector("[data-file-extension]");
    const removeButton = document.querySelector("[data-remove-file]");
    const readButton = document.querySelector("[data-read-document]");
    const statusMessage = document.querySelector("[data-upload-status]");

    if (!fileInput || !readButton || typeof FormData === "undefined" || typeof fetch === "undefined") {
      return;
    }

    let selectedFile = null;
    let structuredData = null;
    let previewUrl = null;
    let progressTimer;

    const setStatus = (message, state = "") => {
      if (!statusMessage) return;
      statusMessage.textContent = message;
      statusMessage.classList.toggle("is-error", state === "error");
      statusMessage.classList.toggle("is-success", state === "success");
    };

    const showMessage = (message, state = "") => {
      const analysisMessage = document.querySelector("#analysis-screen .notification-message");
      setStatus(message, state);
      if (analysisMessage) analysisMessage.textContent = message;
    };

    const formatBytes = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getExtension = (file) => file.name.split(".").pop()?.toLowerCase() || "";

    const validateFile = (file) => {
      if (!allowedExtensions.includes(getExtension(file))) {
        return "Bu dosya türü desteklenmiyor. Word, PDF, JPG, PNG veya WEBP yükleyiniz.";
      }
      if (file.size > maxFileSize) {
        return "Dosya 20 MB sınırını aşıyor. Daha küçük bir dosya yükleyiniz.";
      }
      if (file.size === 0) {
        return "Dosya boş görünüyor. Lütfen başka bir dosya seçiniz.";
      }
      return "";
    };

    const clearPreviewUrl = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
    };

    const clearFile = () => {
      selectedFile = null;
      fileInput.value = "";
      clearPreviewUrl();
      fileCard?.setAttribute("hidden", "");
      readButton.disabled = true;
      readButton.setAttribute("aria-disabled", "true");
      setStatus("Öğrenci T.C. kimlik numarası yüklemeyiniz. Belirsiz okunan alanlar analizden önce öğretmen onayına sunulacaktır.");
    };

    const renderPreview = (file) => {
      if (!filePreview) return;
      clearPreviewUrl();
      filePreview.replaceChildren();
      const extension = getExtension(file);

      if (file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
        const image = document.createElement("img");
        image.src = previewUrl;
        image.alt = "";
        filePreview.append(image);
        return;
      }

      const badge = document.createElement("span");
      badge.dataset.fileExtension = "";
      badge.textContent = extension.toUpperCase();
      filePreview.append(badge);
    };

    const selectFile = (file) => {
      const error = validateFile(file);
      if (error) {
        clearFile();
        setStatus(error, "error");
        return;
      }

      selectedFile = file;
      if (fileName) fileName.textContent = file.name;
      if (fileType) fileType.textContent = file.type || `${getExtension(file).toUpperCase()} belgesi`;
      if (fileSize) fileSize.textContent = formatBytes(file.size);
      if (fileExtension) fileExtension.textContent = getExtension(file).toUpperCase();
      renderPreview(file);
      fileCard?.removeAttribute("hidden");
      readButton.disabled = false;
      readButton.setAttribute("aria-disabled", "false");
      setStatus("Dosya hazır. “Verileri Oku ve Kontrol Et” düğmesiyle öğretmen onay ekranına geçebilirsiniz.", "success");
    };

    const showProgressStep = (activeIndex) => {
      const list = document.querySelector("#analysis-screen .analysis-progress ol");
      if (!list) return;
      while (list.children.length < progressTexts.length) list.append(document.createElement("li"));
      Array.from(list.children).forEach((item, index) => {
        item.textContent = index <= activeIndex ? progressTexts[index] : progressTexts[index].replace("✓ ", "");
      });
    };

    const showReport = (text) => {
      const reportScreen = document.querySelector("#report-screen");
      const reportTarget = document.querySelector("#report-screen .summary-card p");
      if (!reportTarget || reportScreen?.dataset.reportLocked === "true") return;
      reportTarget.textContent = text;
      reportTarget.style.whiteSpace = "pre-line";
    };

    const editableCell = (value, label, type = "text", field = "") => {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.className = "validation-input";
      input.type = type;
      input.value = value ?? "";
      input.setAttribute("aria-label", label);
      if (field) input.dataset.validationField = field;
      if (type === "number") input.step = "0.01";
      cell.append(input);
      return cell;
    };

    const renderValidationData = (data) => {
      if (!data) return;
      structuredData = data;
      const questionBody = document.querySelector("[data-validation-questions]");
      const studentHead = document.querySelector("[data-validation-student-head]");
      const studentBody = document.querySelector("[data-validation-students]");
      const examSummary = document.querySelector("[data-validation-exam-summary]");
      const warningList = document.querySelector("[data-validation-warnings]");
      const questions = data.questions || [];

      questionBody?.replaceChildren();
      questions.forEach((question) => {
        const row = document.createElement("tr");
        row.dataset.questionRow = "";
        row.append(
          editableCell(question.number, `${question.number}. soru numarası`, "number", "number"),
          editableCell(question.maxScore, `${question.number}. soru azami puanı`, "number", "maxScore"),
          editableCell(
            question.outcomeCode,
            `${question.number}. soru öğrenme çıktısı kodu`,
            "text",
            "outcomeCode"
          )
        );
        questionBody?.append(row);
      });

      if (studentHead) {
        const row = document.createElement("tr");
        ["Öğrenci No", "Ad Soyad", ...questions.map((question) => `S${question.number}`), "Toplam", "Katılım"]
          .forEach((label) => {
            const header = document.createElement("th");
            header.scope = "col";
            header.textContent = label;
            row.append(header);
          });
        studentHead.replaceChildren(row);
      }

      studentBody?.replaceChildren();
      (data.students || []).forEach((student) => {
        const row = document.createElement("tr");
        row.dataset.studentRow = "";
        row.dataset.rowNumber = student.rowNumber;
        row.append(
          editableCell(student.studentNo, `${student.fullName || student.rowNumber} okul numarası`, "text", "studentNo"),
          editableCell(student.fullName, `${student.rowNumber}. öğrenci adı soyadı`, "text", "fullName")
        );
        questions.forEach((question, index) => {
          row.append(editableCell(student.scores?.[index], `${student.fullName || student.rowNumber} S${question.number} puanı`, "number", "score"));
        });
        row.append(
          editableCell(student.totalScore, `${student.fullName || student.rowNumber} toplam puanı`, "number", "totalScore"),
          editableCell(student.attendance, `${student.fullName || student.rowNumber} katılım durumu`, "text", "attendance")
        );
        studentBody?.append(row);
      });

      if (examSummary) {
        const exam = data.exam || {};
        const identity = [exam.schoolName, exam.course, exam.classSection].filter(Boolean).join(" · ");
        examSummary.textContent = `${identity || "Sınav bilgileri eksik"} — ${data.summary?.questionCount || 0} soru, ${data.summary?.studentCount || 0} öğrenci satırı okundu.`;
      }

      if (warningList) {
        warningList.replaceChildren();
        const warnings = data.warnings?.length ? data.warnings : ["Belge yapısında otomatik kontrol uyarısı bulunmadı."];
        warnings.forEach((warning) => {
          const item = document.createElement("li");
          item.textContent = warning;
          warningList.append(item);
        });
      }
    };

    const numberValue = (input) => {
      const value = input?.value.trim().replace(",", ".");
      return value === "" ? null : Number(value);
    };

    const collectApprovedData = () => {
      const questions = Array.from(document.querySelectorAll("[data-question-row]")).map((row) => ({
        number: numberValue(row.querySelector('[data-validation-field="number"]')),
        maxScore: numberValue(row.querySelector('[data-validation-field="maxScore"]')),
        outcomeCode: row.querySelector('[data-validation-field="outcomeCode"]')?.value.trim() || ""
      }));
      const students = Array.from(document.querySelectorAll("[data-student-row]")).map((row) => ({
        rowNumber: Number(row.dataset.rowNumber),
        studentNo: row.querySelector('[data-validation-field="studentNo"]')?.value.trim() || "",
        fullName: row.querySelector('[data-validation-field="fullName"]')?.value.trim() || "",
        scores: Array.from(row.querySelectorAll('[data-validation-field="score"]')).map(numberValue),
        totalScore: numberValue(row.querySelector('[data-validation-field="totalScore"]')),
        attendance: row.querySelector('[data-validation-field="attendance"]')?.value.trim() || "Girdi"
      }));
      return { exam: structuredData?.exam || {}, questions, students };
    };

    const renderAnalysis = (analysis) => {
      const reportScreen = document.querySelector("#report-screen");
      if (reportScreen?.dataset.reportLocked === "true") return;
      const summary = analysis.summary || {};
      const reportSummary = document.querySelector("#report-screen .summary-card p");
      const general = document.querySelector("#report-screen [aria-labelledby='general-evaluation-title'] p");
      const analysisTable = document.querySelector("#report-screen [aria-labelledby='analysis-table-title'] p");
      const outcomes = document.querySelector("#report-screen [aria-labelledby='learning-outcomes-title'] p");
      const strong = document.querySelector("#report-screen [aria-labelledby='strong-areas-title'] p");
      const development = document.querySelector("#report-screen [aria-labelledby='development-areas-title'] p");
      const suggestions = document.querySelector("#report-screen [aria-labelledby='teaching-suggestions-title'] p");
      const percent = (rate) => `%${((rate || 0) * 100).toFixed(2)}`;
      const strongOutcomes = (analysis.outcomes || []).filter((item) => item.successRate >= 0.70);
      const developmentOutcomes = (analysis.outcomes || []).filter((item) => item.successRate < 0.70);

      if (reportSummary) reportSummary.textContent = `${summary.participatingStudentCount} öğrencinin ${summary.questionCount} soruya ait öğretmen onaylı puanları analiz edilmiştir.`;
      if (general) general.textContent = `Sınıf ortalaması ${summary.classAverage}; genel başarı oranı ${percent(summary.classSuccessRate)} olarak hesaplanmıştır. Sınava katılmayan öğrenci sayısı ${summary.absentStudentCount}.`;
      if (analysisTable) analysisTable.textContent = (analysis.questions || []).map((item) => `Soru ${item.number}: ${percent(item.successRate)}`).join(" · ");
      if (outcomes) outcomes.textContent = (analysis.outcomes || []).map((item) => `${item.outcomeCode}: ${percent(item.successRate)} (${item.category})`).join(" · ");
      if (strong) strong.textContent = strongOutcomes.length ? strongOutcomes.map((item) => `${item.outcomeCode} — ${percent(item.successRate)}`).join(" · ") : "Güçlü alan eşiğine ulaşan öğrenme çıktısı bulunmamaktadır.";
      if (development) development.textContent = developmentOutcomes.length ? developmentOutcomes.map((item) => `${item.outcomeCode} — ${percent(item.successRate)}`).join(" · ") : "Öncelikli gelişim alanı belirlenmemiştir.";
      if (suggestions) suggestions.textContent = (analysis.outcomes || []).map((item) => `${item.outcomeCode}: ${item.decision}`).join(" ");
    };

    const analyzeApprovedData = () => {
      const approvalButton = document.querySelector('[data-approval-action="confirm-data"]');
      if (!structuredData || !approvalButton) return;
      approvalButton.disabled = true;
      approvalButton.textContent = "Analiz Başlatılıyor…";
      showMessage("Öğretmen onaylı veriler analiz motoruna aktarılıyor.");

      fetch("/mahir-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectApprovedData())
      })
        .then((response) => response.json().catch(() => ({})).then((payload) => ({ response, payload })))
        .then(({ response, payload }) => {
          if (!response.ok) throw new Error(payload.message || "Onaylanan veriler analiz edilemedi.");
          renderAnalysis(payload.analysis || {});
          showProgressStep(progressTexts.length - 1);
          screenManager.approveData();
          screenManager.showScreen("analysis-screen");
          showMessage(payload.message, "success");
        })
        .catch((error) => {
          const approvalMessage = document.querySelector("[data-approval-message]");
          if (approvalMessage) {
            approvalMessage.textContent = error.message;
            approvalMessage.focus({ preventScroll: true });
          }
          showMessage(error.message, "error");
        })
        .finally(() => {
          approvalButton.disabled = false;
          approvalButton.textContent = "Verileri Onayla";
        });
    };

    const uploadSelectedFile = () => {
      if (!selectedFile) return;
      const formData = new FormData();
      let progressIndex = 0;
      formData.append("exam-file", selectedFile);
      document.dispatchEvent(new CustomEvent("mahir:report-reset"));
      readButton.disabled = true;
      readButton.setAttribute("aria-disabled", "true");
      readButton.textContent = "Belge Okunuyor…";
      window.clearInterval(progressTimer);
      showProgressStep(progressIndex);
      progressTimer = window.setInterval(() => {
        if (progressIndex < progressTexts.length - 2) showProgressStep(++progressIndex);
      }, 500);

      fetch("/mahir-upload", {
        method: "POST",
        body: formData
      })
        .then((response) => response.json().catch(() => ({})).then((payload) => ({ response, payload })))
        .then(({ response, payload }) => {
          const logMethod = response.ok ? "info" : "warn";
          const message = payload.message || (response.ok ? "Dosya başarıyla işlendi." : "Dosya işlenemedi.");
          window.clearInterval(progressTimer);
          if (response.ok) {
            renderValidationData(payload.structuredData);
            showProgressStep(progressTexts.length - 1);
            const reportText = payload.reportText || payload.report || payload.report_text;
            const reportRequest = reportText ? Promise.resolve(reportText) : fetch(`/shared/report-example.txt?ts=${Date.now()}`).then((reportResponse) => reportResponse.ok ? reportResponse.text() : message);
            reportRequest.then(showReport).catch(() => showReport(message));
            screenManager.showScreen("validation-screen");
          } else {
            showReport(message);
          }
          console[logMethod]("[MAHIR] Dosya backend alıcısına gönderildi.", payload);
          showMessage(message, response.ok ? "success" : "error");
        })
        .catch((error) => {
          window.clearInterval(progressTimer);
          console.warn("[MAHIR] Dosya backend alıcısına gönderilemedi.", error);
          showMessage("Belge okuma servisine ulaşılamadı. Prototip sunucusunu çalıştırıp yeniden deneyiniz.", "error");
          showReport("Backend bağlantısı kurulamadı.");
        })
        .finally(() => {
          readButton.disabled = false;
          readButton.setAttribute("aria-disabled", "false");
          readButton.textContent = "Verileri Oku ve Kontrol Et";
        });
    };

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) selectFile(file);
    });

    removeButton?.addEventListener("click", clearFile);
    readButton.addEventListener("click", uploadSelectedFile);
    document.addEventListener("mahir:confirm-data", analyzeApprovedData);

    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.add("is-dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropzone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.remove("is-dragging");
      });
    });

    dropzone?.addEventListener("drop", (event) => {
      const file = event.dataTransfer?.files?.[0];
      if (file) selectFile(file);
    });
  };

  return { init };
})();
