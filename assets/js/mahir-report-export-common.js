(() => {
  const REPORT_TITLE = "SINAV SONUÇLARI ANALİZ RAPORU";
  const BRAND_NAME = "MAHİR";
  const BRAND_EXPANSION = "Maarif Anlayışıyla Hizmet İşleme ve Raporlama Ajanı";
  const SUCCESS_THRESHOLD = 0.5;

  const design = {
    a4WidthPt: 595.28,
    a4HeightPt: 841.89,
    renderWidth: 794,
    renderScale: 2,
    pageMargin: 38,
    contentX: 42,
    cardGap: 8,
    titleSize: 22,
    titleLine: 28,
    subtitleSize: 10.8,
    subtitleLine: 15,
    metaSize: 9.6,
    metaLine: 13,
    headingSize: 12.8,
    headingLine: 16,
    bodySize: 10.6,
    bodyLine: 15,
    tableSize: 8.8,
    tableLine: 12,
    sectionTitlePaddingX: 9,
    sectionTitlePaddingY: 5,
    sectionPaddingX: 9,
    sectionPaddingY: 7,
    tableCellPaddingX: 5,
    tableCellPaddingY: 4,
    colors: {
      ink: "#1f1f1f",
      navy: "#17365d",
      heading: "#365f91",
      blue: "#2f75b5",
      paleBlue: "#d9eaf7",
      softBlue: "#edf4fa",
      light: "#f8fbfd",
      border: "#9ebcd3",
      muted: "#59697a"
    }
  };

  const normalizeText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const isUseful = (value) => normalizeText(value) && !/^belirtilmedi$/i.test(normalizeText(value));

  const normalizeForCompare = (value) => normalizeText(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/[ıİ]/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const runtime = () => window.MAHIRReportRuntime || {};

  const valueFrom = (source, keys) => {
    for (const key of keys) {
      const value = source?.[key];
      if (isUseful(value)) return normalizeText(value);
    }
    return "";
  };

  const optionText = (selector) => {
    const element = document.querySelector(selector);
    if (!element || element.disabled || !element.value) return "";
    const text = normalizeText(element.selectedOptions?.[0]?.textContent || element.value);
    return /seçiniz$/i.test(text) ? "" : text;
  };

  const inputText = (selector) => {
    const element = document.querySelector(selector);
    if (!element || element.disabled) return "";
    return normalizeText(element.value || element.textContent || "");
  };

  const getContext = () => {
    const schoolType = inputText("#other-school-type") || optionText("#school-type");
    const course = inputText("#other-course-name") || optionText("#course-select");
    const field = optionText("#mtal-field");
    const branch = optionText("#mtal-branch");
    return {
      educationStage: optionText("#education-stage"),
      schoolType,
      programType: optionText("#program-type"),
      field,
      branch,
      fieldBranch: [field, branch].filter(Boolean).join(" / "),
      gradeLevel: optionText("#grade-level"),
      courseType: optionText("#course-type"),
      course,
      sourceScope: [optionText("#education-stage"), schoolType, optionText("#program-type"), field, branch, optionText("#grade-level"), course, optionText("#course-type")].filter(Boolean)
    };
  };

  const getExam = () => runtime().structuredData?.exam || runtime().analysis?.exam || {};
  const getStructuredQuestions = () => runtime().structuredData?.questions || [];
  const getStructuredStudents = () => runtime().structuredData?.students || [];
  const getAnalysis = () => runtime().analysis || {};

  const dateText = () => new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date());

  const formatNumber = (value, digits = 2) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    const hasFraction = Math.abs(number - Math.round(number)) > 0.001;
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: hasFraction ? Math.min(2, digits) : 0,
      maximumFractionDigits: digits
    }).format(number);
  };

  const formatPercent = (rate) => {
    const numeric = Number(rate);
    if (!Number.isFinite(numeric)) return "";
    const percent = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
    const rounded = Math.round(percent * 100) / 100;
    const hasFraction = Math.abs(rounded - Math.round(rounded)) > 0.001;
    return `%${new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    }).format(rounded)}`;
  };

  const successLevel = (rate, fallback = "") => {
    if (isUseful(fallback)) return normalizeText(fallback);
    const value = Number(rate);
    if (!Number.isFinite(value)) return "Belirlenmedi";
    if (value >= 0.85) return "Çok güçlü";
    if (value >= 0.70) return "Güçlü";
    if (value >= 0.50) return "Gelişmekte";
    return "Destek gerekli";
  };

  const getQuestionDescription = (question) => {
    const structured = getStructuredQuestions().find((item) => Number(item.number) === Number(question.number)) || {};
    return valueFrom(question, ["outcomeDescription", "learningOutcome", "description"]) || valueFrom(structured, ["outcomeDescription", "learningOutcome", "description"]) || valueFrom(question, ["outcomeCode"]) || "Öğrenme çıktısı belirtilmedi";
  };

  const getParticipatingStudents = () => {
    const students = getAnalysis().students || getStructuredStudents();
    return students.filter((student) => !["g", "girmedi", "katılmadı", "katilmadi", "yok"].includes(normalizeText(student.attendance || "Girdi").toLocaleLowerCase("tr-TR")));
  };

  const getQuestionRows = () => {
    const analysisQuestions = getAnalysis().questions || [];
    const structured = getStructuredQuestions();
    const source = analysisQuestions.length ? analysisQuestions : structured;
    const participating = Number(getAnalysis().summary?.participatingStudentCount) || getParticipatingStudents().length || 0;
    return source.map((question, index) => {
      const structuredQuestion = structured.find((item) => Number(item.number) === Number(question.number)) || structured[index] || {};
      const maxScore = Number(question.maxScore ?? structuredQuestion.maxScore) || 0;
      const average = participating && Number.isFinite(Number(question.earnedScore)) ? Number(question.earnedScore) / participating : "";
      const rate = Number(question.successRate);
      return {
        number: question.number ?? structuredQuestion.number ?? index + 1,
        outcomeCode: normalizeText(question.outcomeCode || structuredQuestion.outcomeCode),
        outcomeDescription: getQuestionDescription({ ...structuredQuestion, ...question }),
        maxScore,
        average,
        successRate: Number.isFinite(rate) ? rate : "",
        level: successLevel(rate),
        evaluation: Number.isFinite(rate)
          ? `${successLevel(rate)} düzeyindedir; değerlendirme öğretmen onaylı puanlara dayanmaktadır.`
          : "Soru için başarı oranı hesaplanamamıştır."
      };
    });
  };

  const relatedQuestionsForOutcome = (outcomeCode) => getQuestionRows()
    .filter((question) => normalizeText(question.outcomeCode) === normalizeText(outcomeCode))
    .map((question) => `S${question.number}`)
    .join(", ");

  const getSummary = () => {
    const analysis = getAnalysis();
    const summary = analysis.summary || {};
    const students = getParticipatingStudents();
    const totals = students.map((student) => Number(student.calculatedTotal ?? student.totalScore)).filter(Number.isFinite);
    const examMax = Number(summary.examMaxScore) || getQuestionRows().reduce((sum, question) => sum + (Number(question.maxScore) || 0), 0);
    const threshold = examMax * SUCCESS_THRESHOLD;
    const successful = totals.filter((total) => total >= threshold).length;
    const unsuccessful = totals.length ? totals.length - successful : "";
    const average = Number(summary.classAverage);
    return {
      questionCount: Number(summary.questionCount) || getQuestionRows().length,
      studentCount: Number(summary.studentCount) || getStructuredStudents().length || students.length,
      participatingStudentCount: Number(summary.participatingStudentCount) || students.length,
      absentStudentCount: Number(summary.absentStudentCount) || Math.max(0, (getStructuredStudents().length || students.length) - students.length),
      examMaxScore: examMax,
      classAverage: Number.isFinite(average) ? average : (totals.length ? totals.reduce((sum, item) => sum + item, 0) / totals.length : ""),
      classSuccessRate: Number(summary.classSuccessRate) || (examMax && totals.length ? (totals.reduce((sum, item) => sum + item, 0) / totals.length) / examMax : ""),
      highestScore: totals.length ? Math.max(...totals) : "",
      lowestScore: totals.length ? Math.min(...totals) : "",
      successfulStudentCount: totals.length ? successful : "",
      unsuccessfulStudentCount: totals.length ? unsuccessful : ""
    };
  };

  const getMetadata = () => {
    const exam = getExam();
    const context = getContext();
    const summary = getSummary();
    const schoolName = valueFrom(exam, ["schoolName", "school", "institutionName"]);
    const teacherName = valueFrom(exam, ["teacherName", "teacher", "teacherFullName"]);
    const wordCourse = valueFrom(exam, ["course"]);
    const wordClass = valueFrom(exam, ["classSection", "grade", "className"]);

    return [
      { label: "İl", value: valueFrom(exam, ["province", "city"]) },
      { label: "İlçe", value: valueFrom(exam, ["district", "town"]) },
      { label: "Okul/Kurum Adı", value: schoolName, source: "word", required: true },
      { label: "Öğretmenin Adı Soyadı", value: teacherName, source: "word", required: true },
      { label: "Eğitim Öğretim Yılı", value: valueFrom(exam, ["academicYear", "educationYear"]) },
      { label: "Öğretim Kademesi", value: context.educationStage, source: "context" },
      { label: "Okul Türü", value: context.schoolType, source: "context" },
      { label: "Program Türü", value: context.programType, source: "context" },
      { label: "Alan/Dal", value: context.fieldBranch, source: "context" },
      { label: "Ders", value: wordCourse || context.course, source: wordCourse ? "word" : "context", required: true },
      { label: "Ders Türü", value: context.courseType, source: "context" },
      { label: "Sınıf/Şube", value: wordClass || context.gradeLevel, source: wordClass ? "word" : "context", required: true },
      { label: "Dönem", value: valueFrom(exam, ["term"]) },
      { label: "Sınav Türü", value: valueFrom(exam, ["examType"]) },
      { label: "Sınav Tarihi", value: valueFrom(exam, ["examDate"]) },
      { label: "Rapor Tarihi", value: dateText() },
      { label: "Analiz Edilen Öğrenci Sayısı", value: summary.participatingStudentCount ? String(summary.participatingStudentCount) : "", required: true }
    ].filter((item) => isUseful(item.value));
  };

  const conflictPair = (label, wordValue, contextValue, comparator = "text") => {
    if (!isUseful(wordValue) || !isUseful(contextValue)) return null;
    let conflict = false;
    if (comparator === "grade") {
      const wordGrade = normalizeText(wordValue).match(/\d+/)?.[0] || "";
      const contextGrade = normalizeText(contextValue).match(/\d+/)?.[0] || "";
      conflict = Boolean(wordGrade && contextGrade && wordGrade !== contextGrade);
    } else {
      const a = normalizeForCompare(wordValue);
      const b = normalizeForCompare(contextValue);
      conflict = Boolean(a && b && a !== b && !a.includes(b) && !b.includes(a));
    }
    return conflict ? `${label}: Word belgesi "${wordValue}", Eğitim Bağlamı "${contextValue}" gösteriyor.` : null;
  };

  const validateModel = () => {
    const exam = getExam();
    const context = getContext();
    const summary = getSummary();
    const missing = [];
    if (!isUseful(valueFrom(exam, ["schoolName", "school", "institutionName"]))) missing.push("Okul/Kurum Adı");
    if (!isUseful(valueFrom(exam, ["teacherName", "teacher", "teacherFullName"]))) missing.push("Öğretmenin Adı Soyadı");
    if (!isUseful(valueFrom(exam, ["course"]) || context.course)) missing.push("Ders");
    if (!isUseful(valueFrom(exam, ["classSection", "grade", "className"]) || context.gradeLevel)) missing.push("Sınıf/Şube");
    if (!summary.participatingStudentCount) missing.push("Analiz Edilen Öğrenci Sayısı");

    const conflicts = [
      conflictPair("Ders", valueFrom(exam, ["course"]), context.course),
      conflictPair("Sınıf/Şube", valueFrom(exam, ["classSection", "grade", "className"]), context.gradeLevel, "grade")
    ].filter(Boolean);

    return {
      valid: missing.length === 0 && conflicts.length === 0,
      missing,
      conflicts,
      message: missing.length || conflicts.length
        ? [missing.length ? `Tamamlanması gereken alanlar: ${missing.join(", ")}.` : "", conflicts.length ? `Tutarlılık kontrolü: ${conflicts.join(" ")}` : ""].filter(Boolean).join(" ")
        : "Rapor çıktıları için gerekli bilgiler tamamlandı."
    };
  };

  const buildMetadataRows = () => getMetadata().map((item) => [item.label, item.value]);

  const buildGeneralSummaryBlock = () => {
    const summary = getSummary();
    const row = [
      summary.participatingStudentCount,
      formatNumber(summary.classAverage),
      formatNumber(summary.highestScore),
      formatNumber(summary.lowestScore),
      summary.successfulStudentCount,
      summary.unsuccessfulStudentCount,
      formatPercent(summary.classSuccessRate)
    ].map((value) => isUseful(value) ? String(value) : "Belirtilmedi");
    return {
      heading: "B. GENEL BAŞARI ÖZETİ",
      paragraphs: [
        `${summary.participatingStudentCount || 0} öğrencinin ${summary.questionCount || 0} soruya ait öğretmen onaylı puanları değerlendirilmiştir.`,
        "Başarılı/başarısız öğrenci sayıları, toplam puanın %50 eşiği esas alınarak hesaplanmıştır."
      ],
      tables: [[
        ["Analiz Edilen Öğrenci Sayısı", "Sınıf Ortalaması", "En Yüksek Puan", "En Düşük Puan", "Başarılı Öğrenci Sayısı", "Başarısız Öğrenci Sayısı", "Başarı Oranı"],
        row
      ]]
    };
  };

  const buildQuestionBlock = () => ({
    heading: "C. SORU BAZLI BAŞARI ANALİZİ",
    paragraphs: [],
    tables: [[
      ["Soru", "Öğrenme Çıktısı / Kazanım", "Soru Puanı", "Sınıf Başarı Oranı", "Başarı Düzeyi", "Kısa Değerlendirme"],
      ...getQuestionRows().map((question) => [
        `S${question.number}`,
        question.outcomeDescription,
        formatNumber(question.maxScore),
        formatPercent(question.successRate),
        question.level,
        question.evaluation
      ])
    ]]
  });

  const buildOutcomeBlock = () => {
    const outcomes = getAnalysis().outcomes || [];
    const rows = outcomes.length ? outcomes.map((outcome) => [
      normalizeText(outcome.outcomeCode || outcome.learningOutcome || "Öğrenme çıktısı belirtilmedi"),
      relatedQuestionsForOutcome(outcome.outcomeCode) || "Belirtilmedi",
      formatPercent(outcome.successRate),
      successLevel(outcome.successRate, outcome.category),
      normalizeText(outcome.decision) || "Değerlendirme öğretmen onaylı analiz verilerine dayanmaktadır."
    ]) : [["Belirtilmedi", "Belirtilmedi", "", "Belirlenmedi", "Öğrenme çıktısı bazlı analiz verisi bulunmamaktadır."]];
    return {
      heading: "D. ÖĞRENME ÇIKTILARI ANALİZİ",
      paragraphs: [],
      tables: [[["Öğrenme Çıktısı / Kazanım", "İlgili Sorular", "Başarı Oranı", "Başarı Düzeyi", "Analitik Değerlendirme"], ...rows]]
    };
  };

  const buildPedagogyBlock = () => {
    const outcomes = getAnalysis().outcomes || [];
    const strong = outcomes.filter((item) => Number(item.successRate) >= 0.70);
    const development = outcomes.filter((item) => Number(item.successRate) < 0.70);
    return {
      heading: "E. PEDAGOJİK DEĞERLENDİRME",
      paragraphs: [],
      tables: [[
        ["Değerlendirme Alanı", "Rapor Metni"],
        ["Güçlü yönler", strong.length ? strong.map((item) => `${item.outcomeCode} (${formatPercent(item.successRate)})`).join("; ") : "Güçlü düzey eşiğine ulaşan öğrenme çıktısı belirlenmemiştir."],
        ["Geliştirilmesi gereken alanlar", development.length ? development.map((item) => `${item.outcomeCode} (${formatPercent(item.successRate)})`).join("; ") : "Öncelikli gelişim alanı belirlenmemiştir."],
        ["Başarı Örüntüsü", "Değerlendirme, öğretmen tarafından onaylanan soru puanları ve öğrenme çıktısı eşleştirmeleri esas alınarak oluşturulmuştur."]
      ]]
    };
  };

  const buildSuggestionsBlock = () => {
    const outcomes = getAnalysis().outcomes || [];
    const targets = outcomes.filter((item) => Number(item.successRate) < 0.70);
    const rows = (targets.length ? targets : outcomes.slice(0, 3)).map((item, index) => [
      String(index + 1),
      `${item.outcomeCode || "Öğrenme Çıktısı"} için ${formatPercent(item.successRate) || "belirlenemeyen"} başarı düzeyi`,
      normalizeText(item.decision) || "Öğretmen, ilgili kazanıma yönelik pekiştirme ve izleme çalışması planlayabilir.",
      "Kısa uygulama sonrası öğretmen gözlemi ve soru bazlı izleme"
    ]);
    return {
      heading: "F. İYİLEŞTİRME ÖNERİLERİ",
      paragraphs: [],
      tables: [[["Öncelik", "Tespit Edilen İhtiyaç", "Önerilen Öğretim Müdahalesi", "İzleme Kanıtı / Süre"], ...(rows.length ? rows : [["1", "Öncelikli ihtiyaç verisi oluşmamıştır.", "Mevcut öğretim süreci öğretmen değerlendirmesiyle sürdürülebilir.", "Öğretmen gözlemi"]])]]
    };
  };

  const buildSourceBlock = () => {
    const context = getContext();
    const contextText = context.sourceScope.length ? context.sourceScope.join(" / ") : "Seçilen eğitim bağlamı belirtilmemiştir.";
    return {
      heading: "G. ANALİZDE ESAS ALINAN EĞİTİM BAĞLAMI VE KAYNAKLAR",
      paragraphs: ["Bu rapor; seçilen eğitim bağlamı, ilgili öğretim programı, ölçme ve değerlendirme esasları ile öğretmen tarafından onaylanan sınav verileri esas alınarak hazırlanmıştır."],
      tables: [[
        ["Dayanak", "Kapsam"],
        ["Seçilen eğitim bağlamı", contextText],
        ["Öğretmen tarafından onaylanan sınav verileri", "Soru puanları, öğrenci sonuçları ve öğrenme çıktısı eşleştirmeleri"],
        ["Doğrulanmış resmî kaynak kaydı", "Harici resmî kaynak adı kaydedilmemiştir."]
      ]]
    };
  };

  const buildDocumentInfoBlock = () => {
    const exam = getExam();
    const rows = [
      ["Düzenleyen Öğretmen", valueFrom(exam, ["teacherName", "teacher", "teacherFullName"])],
      ["Kurum Adı", valueFrom(exam, ["schoolName", "school", "institutionName"])],
      ["Rapor Tarihi", dateText()],
      ["Belge/Rapor Numarası", valueFrom(exam, ["documentNo", "reportNo", "documentPage"])]
    ].filter((row) => isUseful(row[1]));
    return {
      heading: "H. BELGE BİLGİLERİ",
      paragraphs: [],
      tables: rows.length ? [[["Alan", "Bilgi"], ...rows]] : []
    };
  };

  const getBlocks = () => [
    { heading: "A. SINAV VE EĞİTİM BAĞLAMI", paragraphs: [], tables: [[["Alan", "Bilgi"], ...buildMetadataRows()]] },
    buildGeneralSummaryBlock(),
    buildQuestionBlock(),
    buildOutcomeBlock(),
    buildPedagogyBlock(),
    buildSuggestionsBlock(),
    buildSourceBlock(),
    buildDocumentInfoBlock()
  ];

  const getReportModel = (reportElement) => {
    const model = {
      title: REPORT_TITLE,
      brand: BRAND_NAME,
      expansion: BRAND_EXPANSION,
      metadata: getMetadata(),
      blocks: getBlocks(),
      generatedAt: new Date().toISOString(),
      reportElement
    };
    model.validation = validateModel();
    return model;
  };

  const cell = (tag, text) => {
    const element = document.createElement(tag);
    element.textContent = text || "";
    return element;
  };

  const renderTable = (rows) => {
    const table = document.createElement("table");
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach((item) => tr.append(cell(rowIndex === 0 ? "th" : "td", item)));
      table.append(tr);
    });
    return table;
  };

  const renderOutputBody = (reportElement, model) => {
    const body = reportElement.querySelector("[data-output-body]");
    if (!body) return;
    body.replaceChildren();
    model.blocks.forEach((block) => {
      const section = document.createElement("section");
      section.className = "report-output-section";
      const heading = document.createElement("h3");
      heading.className = "report-output-section-title";
      heading.textContent = block.heading;
      section.append(heading);
      block.paragraphs.forEach((paragraph) => {
        if (!isUseful(paragraph)) return;
        const p = document.createElement("p");
        p.textContent = paragraph;
        section.append(p);
      });
      block.tables.forEach((tableRows) => section.append(renderTable(tableRows)));
      body.append(section);
    });
  };

  const syncOutputHeader = (reportElement) => {
    if (!reportElement) return null;
    const model = getReportModel(reportElement);
    const titleTarget = reportElement.querySelector("[data-output-title]");
    const subtitleTarget = reportElement.querySelector("[data-output-subtitle]");
    const list = reportElement.querySelector("[data-output-header] dl");
    if (titleTarget) titleTarget.textContent = model.title;
    if (subtitleTarget) subtitleTarget.textContent = `${model.brand} - ${model.expansion}`;
    if (list) {
      list.replaceChildren();
      model.metadata.forEach((item) => {
        const wrapper = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = item.label;
        dd.textContent = item.value;
        wrapper.append(dt, dd);
        list.append(wrapper);
      });
    }
    renderOutputBody(reportElement, model);
    return model;
  };

  const getOutputStatusMessage = (model) => model?.validation?.message || validateModel().message;

  window.MAHIRReportExport = {
    design,
    getReportModel,
    syncOutputHeader,
    validateModel,
    getOutputStatusMessage,
    normalizeText,
    formatNumber,
    formatPercent
  };
})();
