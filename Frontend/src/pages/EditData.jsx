import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProjectDraft, fetchProjects, updateProjectDraft } from "../store/projectThunk";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import api from "../services/api";
import invesTechyLogo from "../assets/InvesTechy.jpg";
import { usePopup } from "../components/PopupProvider";
import "./editData.css";
import "./percentRate.css";

const SECTION_NAMES = ["CAPEX", "OPEX", "Tangible Results", "Intangible Results"];

const createRow = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  item: "",
  description: "",
  nominal: "",
});

const createInitialSections = () =>
  SECTION_NAMES.map((section) => ({
    id: section.toLowerCase().replace(/\s+/g, "-"),
    title: section,
    rows: [createRow()],
  }));

const getSectionId = (sectionTitle) => sectionTitle.toLowerCase().replace(/\s+/g, "-");

const toRows = (items, title) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [createRow()];
  }

  return items.map((item, index) => {
    if (typeof item === "string" || typeof item === "number") {
      return {
        id: `${title}-${index + 1}`,
        item: String(item),
        description: "",
        nominal: "",
      };
    }

    return {
      id: item?._id || item?.id || `${title}-${index + 1}`,
      item:
        item?.item ||
        item?.name ||
        item?.title ||
        item?.label ||
        item?.description ||
        "",
      description: item?.description || "",
      nominal: String(
        item?.nominal ??
          item?.amount ??
          item?.value ??
          item?.cost ??
          item?.benefit ??
          "",
      ),
    };
  });
};

const getDraftItems = (draft, keys = []) => {
  for (const key of keys) {
    const value = draft?.[key];
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }

  return [];
};

const getLatestSimulation = (simulationHistory = []) => {
  if (!Array.isArray(simulationHistory) || simulationHistory.length === 0) {
    return null;
  }

  return [...simulationHistory].sort((a, b) => {
    const dateA = new Date(a?.calculatedAt || 0).getTime();
    const dateB = new Date(b?.calculatedAt || 0).getTime();
    return dateB - dateA;
  })[0];
};

const buildSectionsFromDraft = (draft) => {
  const latestSimulation = draft?.latestSimulation || getLatestSimulation(draft?.simulationHistory);
  const simulationData = latestSimulation?.simulatedData;
  const draftData = simulationData || draft?.draft || draft?.llmBaseDraft || draft;

  const capexItems = getDraftItems(draftData, ["capex", "capexItems", "CAPEX"]);
  const opexItems = getDraftItems(draftData, ["opex", "opexItems", "OPEX"]);
  const tangibleItems = getDraftItems(draftData, [
    "tangibleResults",
    "tangibleBenefit",
    "tangibleBenefits",
  ]);
  const intangibleItems = getDraftItems(draftData, [
    "intangibleResults",
    "intangibleBenefit",
    "intangibleBenefits",
  ]);

  return [
    {
      id: getSectionId("CAPEX"),
      title: "CAPEX",
      rows: toRows(capexItems, "capex"),
    },
    {
      id: getSectionId("OPEX"),
      title: "OPEX",
      rows: toRows(opexItems, "opex"),
    },
    {
      id: getSectionId("Tangible Results"),
      title: "Tangible Results",
      rows: toRows(tangibleItems, "tangible-results"),
    },
    {
      id: getSectionId("Intangible Results"),
      title: "Intangible Results",
      rows: toRows(intangibleItems, "intangible-results"),
    },
  ];
};

const buildSimulationForm = (draft) => {
  const latestSimulation = draft?.latestSimulation || getLatestSimulation(draft?.simulationHistory);
  const latestSimulationSettings = latestSimulation?.simulationSettings || {};

  return {
    scenarioName:
      latestSimulation?.scenarioName ||
      draft?.scenarioName ||
      "Optimistic Scenario",
    inflationRate: String(
      toNumberValue(
        (draft?.inflationRate ??
          draft?.simulationSettings?.inflationRate ??
          latestSimulationSettings?.inflationRate ??
          0.05) * 100,
      ),
    ),
    taxRate: String(
      toNumberValue(
        (draft?.taxRate ??
          draft?.simulationSettings?.taxRate ??
          latestSimulationSettings?.taxRate ??
          0.11) * 100,
      ),
    ),
    discountRate: String(
      toNumberValue(
        (draft?.discountRate ??
          draft?.simulationSettings?.discountRate ??
          latestSimulationSettings?.discountRate ??
          0.1) * 100,
      ),
    ),
    years: String(
      toNumberValue(
        draft?.years ??
          draft?.yearsExpected ??
          draft?.simulationSettings?.years ??
          draft?.simulationSettings?.yearsExpected ??
          latestSimulationSettings?.years ??
          latestSimulationSettings?.yearsExpected ??
          3,
      ),
    ),
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const toNumberValue = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalizedValue = String(value || "").replace(/[^\d.-]/g, "");
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const formatCurrencyText = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatShortNumber = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(amount);
};

const sanitizeDecimalInput = (value) => {
  const normalizedValue = String(value || "").replace(/,/g, ".");
  const sanitizedValue = normalizedValue.replace(/[^\d.]/g, "");
  const [wholePart = "", ...decimalParts] = sanitizedValue.split(".");

  if (decimalParts.length === 0) {
    return wholePart;
  }

  return `${wholePart}.${decimalParts.join("")}`;
};

const getNumericValue = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return toNumberValue(value);
  if (value && typeof value === "object") {
    return toNumberValue(
      value?.value ?? value?.score ?? value?.average ?? value?.amount ?? value?.nominal ?? 0,
    );
  }
  return 0;
};

const buildScoreEntries = (scores, preferredKeys = []) => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    return [];
  }

  const entries = Object.entries(scores);
  const usedKeys = new Set();
  const orderedEntries = [];

  preferredKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(scores, key)) {
      usedKeys.add(key);
      orderedEntries.push([key, scores[key]]);
    }
  });

  entries.forEach(([key, value]) => {
    if (!usedKeys.has(key)) {
      orderedEntries.push([key, value]);
    }
  });

  return orderedEntries
    .map(([label, rawValue]) => ({
      label,
      value: getNumericValue(rawValue),
    }))
    .filter((entry) => entry.label);
};

const normalizeBreakEvenRows = (rows = []) =>
  Array.isArray(rows)
    ? rows.map((row) => ({
        year: row?.year,
        netCashFlow: row?.netCashFlow ?? row?.net ?? row?.cashFlow ?? 0,
        cumulativeCashFlow:
          row?.cumulativeCashFlow ??
          row?.cumulativeNetCashFlow ??
          ((Number(row?.cumulativeBenefit) || 0) - (Number(row?.cumulativeCost) || 0)) ??
          0,
      }))
    : [];

const stripMarkdown = (value) =>
  String(value || "")
    .replace(/```([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/[*_#`~]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const cleanChatMessage = (value) => stripMarkdown(value).replace(/[ \t]+\n/g, "\n").trim();

const CHATBOT_ENDPOINT = (projectId) => `/projects/${projectId}/chatbot`;
const AI_HELPY_HISTORY_KEY = "investechy_ai_helpy_history";
const AI_HELPY_MAX_HISTORY = 40;

const readAiHelpyHistory = () => {
  try {
    const raw = localStorage.getItem(AI_HELPY_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAiHelpyHistory = (entries) => {
  try {
    localStorage.setItem(AI_HELPY_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage write errors.
  }
};

const buildHistoryPreview = (text) => {
  const cleaned = cleanChatMessage(text).replace(/\s+/g, " ").trim();
  if (cleaned.length <= 68) return cleaned;
  return `${cleaned.slice(0, 68).trim()}...`;
};

const formatHistoryDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const saveAiHelpyHistoryEntry = (entry) => {
  if (!entry?.preview) return readAiHelpyHistory();

  const nextEntries = [
    {
      id: entry.id || `history-${Date.now()}`,
      projectId: entry.projectId || "",
      projectName: entry.projectName || "Untitled Project",
      preview: entry.preview,
      prompt: entry.prompt || "",
      response: entry.response || "",
      updatedAt: entry.updatedAt || new Date().toISOString(),
    },
    ...readAiHelpyHistory(),
  ]
    .filter((item, index, array) => {
      const duplicateIndex = array.findIndex(
        (candidate) =>
          candidate.projectId === item.projectId &&
          candidate.preview === item.preview &&
          candidate.updatedAt === item.updatedAt,
      );
      return duplicateIndex === index;
    })
    .slice(0, AI_HELPY_MAX_HISTORY);

  writeAiHelpyHistory(nextEntries);
  return nextEntries;
};

export default function EditData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popup = usePopup();
  const pdfExportRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [sections, setSections] = useState(createInitialSections);
  const [simulationForm, setSimulationForm] = useState(() => buildSimulationForm());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistoryEntries, setChatHistoryEntries] = useState(() => readAiHelpyHistory());
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const { currentDraft, loading, error } = useSelector((state) => state.project);
  const latestSimulation = useMemo(
    () => currentDraft?.latestSimulation || getLatestSimulation(currentDraft?.simulationHistory),
    [currentDraft],
  );
  const exportProjectName = currentDraft?.projectName || "Digital Transformation";
  const exportIndustry = currentDraft?.industry || "-";
  const exportScale = currentDraft?.calculatedScale || currentDraft?.scale || "-";
  const exportPlan = currentDraft?.plan || "-";
  const exportLocation = currentDraft?.location || "-";
  const exportQuadrant = currentDraft?.mcfarlan?.quadrant || "-";
  const exportCoordinates = currentDraft?.mcfarlan?.coordinates || {};
  const activeProjectName = currentDraft?.projectName || "Untitled Project";

  useEffect(() => {
    document.body.classList.remove("page-exit");
    dispatch(fetchProjectDraft(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!currentDraft) return;
    setSections(buildSectionsFromDraft(currentDraft));
    setSimulationForm(buildSimulationForm(currentDraft));
  }, [currentDraft]);

  const loadChatHistory = useCallback(async () => {
    setChatLoading(true);
    setChatError("");

    try {
      const response = await api.get(CHATBOT_ENDPOINT(id));
      const payload = response?.data || [];

      const normalizedMessages = Array.isArray(payload)
        ? payload
            .filter((item) => item?.role !== "system")
            .map((item, index) => ({
              id: `${item?.role || "message"}-${index}`,
              role: item?.role || "assistant",
              content: cleanChatMessage(item?.content || ""),
            }))
        : [];

      setChatMessages(
        normalizedMessages.length > 0
          ? normalizedMessages
          : [
              {
                id: "assistant-welcome",
                role: "assistant",
                content:
                  "Halo, saya AI Helpy. Ada yang ingin ditanyakan tentang proyek ini?",
              },
            ],
      );

      if (normalizedMessages.length > 0) {
        const latestUserMessage = [...normalizedMessages].reverse().find((item) => item.role === "user");
        const latestAssistantMessage = [...normalizedMessages]
          .reverse()
          .find((item) => item.role === "assistant");

        if (latestUserMessage || latestAssistantMessage) {
          setChatHistoryEntries(
            saveAiHelpyHistoryEntry({
              projectId: id,
              projectName: activeProjectName,
              preview: buildHistoryPreview(
                latestUserMessage?.content || latestAssistantMessage?.content || "",
              ),
              prompt: latestUserMessage?.content || "",
              response: latestAssistantMessage?.content || "",
              updatedAt: new Date().toISOString(),
            }),
          );
        }
      }
    } catch (error) {
      setChatMessages([]);
      const backendError = error?.data?.message || error?.message || "";
      setChatError(
        /fetch failed/i.test(backendError)
          ? "Koneksi ke AI Helpy belum tersedia."
          : backendError || "Chat history belum berhasil dimuat.",
      );
    } finally {
      setChatLoading(false);
    }
  }, [activeProjectName, id]);

  useEffect(() => {
    if (!isChatOpen) return;
    loadChatHistory();
  }, [isChatOpen, loadChatHistory]);

  const summary = useMemo(() => {
    const getSectionTotal = (title) =>
      sections
        .find((section) => section.title === title)
        ?.rows.reduce((total, row) => total + Number(row.nominal || 0), 0) || 0;

    const capex = getSectionTotal("CAPEX");
    const opex = getSectionTotal("OPEX");
    const tangible = getSectionTotal("Tangible Results");
    const intangible = getSectionTotal("Intangible Results");
    const benefit = tangible + intangible;
    const investment = capex + opex;
    const total = investment + benefit;

    return {
      capex,
      opex,
      tangible,
      intangible,
      benefit,
      investment,
      total,
      status: benefit >= investment ? "Ready For Report" : "Need Review",
    };
  }, [sections]);

  const handleFieldChange = (sectionId, rowId, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : {
                      ...row,
                      [field]: field === "nominal" ? value.replace(/[^\d]/g, "") : value,
                    },
              ),
            },
      ),
    );
  };

  const handleAddRow = (sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              rows: [...section.rows, createRow()],
            },
      ),
    );
  };

  const handleSimulationFieldChange = (field, value) => {
    setSimulationForm((prev) => ({
      ...prev,
      [field]:
        field === "scenarioName"
          ? value
          : field === "years"
            ? value.replace(/[^\d]/g, "")
            : sanitizeDecimalInput(value),
    }));
  };

  const handleDeleteRow = (sectionId, rowId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const nextRows = section.rows.filter((row) => row.id !== rowId);
        return {
          ...section,
          rows: nextRows.length > 0 ? nextRows : [createRow()],
        };
      }),
    );
  };

  const filledRows = useMemo(
    () =>
      sections.flatMap((section) =>
        section.rows
          .filter((row) => row.item.trim() || row.nominal)
          .map((row) => ({
            ...row,
            title: section.title,
          })),
      ),
    [sections],
  );
  const capexRows = useMemo(
    () => sections.find((section) => section.title === "CAPEX")?.rows.filter((row) => row.item || row.nominal) || [],
    [sections],
  );
  const opexRows = useMemo(
    () => sections.find((section) => section.title === "OPEX")?.rows.filter((row) => row.item || row.nominal) || [],
    [sections],
  );
  const tangibleRows = useMemo(
    () =>
      sections.find((section) => section.title === "Tangible Results")?.rows.filter((row) => row.item || row.nominal) || [],
    [sections],
  );
  const intangibleRows = useMemo(
    () =>
      sections.find((section) => section.title === "Intangible Results")?.rows.filter((row) => row.item || row.nominal) || [],
    [sections],
  );
  const financialResults = latestSimulation?.financialResults || {};
  const previewScenarioName =
    simulationForm.scenarioName?.trim() ||
    latestSimulation?.scenarioName ||
    currentDraft?.scenarioName ||
    "Current Scenario";
  const previewSimulationSettings = useMemo(
    () => ({
      inflationRate: toNumberValue(simulationForm.inflationRate || 5) / 100,
      taxRate: toNumberValue(simulationForm.taxRate || 11) / 100,
      discountRate: toNumberValue(simulationForm.discountRate || 10) / 100,
      years: toNumberValue(simulationForm.years || 3),
    }),
    [simulationForm.discountRate, simulationForm.inflationRate, simulationForm.taxRate, simulationForm.years],
  );
  const breakEvenRows = normalizeBreakEvenRows(financialResults?.breakEvenAnalysisDetail);
  const exportFeasibility =
    financialResults?.feasibilityStatus ||
    (financialResults?.isFeasible === true
      ? "Highly Recommended"
      : financialResults?.isFeasible === false
        ? "Need Review"
        : summary.status);
  const exportInsight =
    intangibleRows.find((row) => row.description?.trim())?.description ||
    intangibleRows.find((row) => row.item?.trim())?.item ||
    "The project is positioned to create measurable business impact with clear operational benefits.";
  const businessScoreEntries = useMemo(
    () => buildScoreEntries(currentDraft?.businessDomain, ["SM", "CA", "MI", "CR", "OR"]),
    [currentDraft?.businessDomain],
  );
  const technologyScoreEntries = useMemo(
    () => buildScoreEntries(currentDraft?.technologyDomain, ["SA", "DU", "TU", "IR"]),
    [currentDraft?.technologyDomain],
  );

  const buildDraftPayload = () => {
    const mapRows = (title) =>
      sections
        .find((section) => section.title === title)
        ?.rows.map((row) => ({
          item: row.item?.trim() || "",
          description: row.description?.trim() || "",
          nominal: toNumberValue(row.nominal),
        }))
        .filter((row) => row.item || row.description || row.nominal) || [];

    const latestSimulationSettings = latestSimulation?.simulationSettings || {};

    return {
      scenarioName:
        simulationForm.scenarioName.trim() ||
        latestSimulation?.scenarioName ||
        currentDraft?.scenarioName ||
        "Optimistic Scenario",
      capex: mapRows("CAPEX"),
      opex: mapRows("OPEX"),
      tangibleBenefits: mapRows("Tangible Results"),
      intangibleBenefits: mapRows("Intangible Results"),
      inflationRate:
        toNumberValue(
          simulationForm.inflationRate !== ""
            ? simulationForm.inflationRate
            : (currentDraft?.inflationRate ??
              currentDraft?.simulationSettings?.inflationRate ??
              latestSimulationSettings?.inflationRate ??
              0.05) * 100,
        ) / 100,
      taxRate:
        toNumberValue(
          simulationForm.taxRate !== ""
            ? simulationForm.taxRate
            : (currentDraft?.taxRate ??
              currentDraft?.simulationSettings?.taxRate ??
              latestSimulationSettings?.taxRate ??
              0.11) * 100,
        ) / 100,
      discountRate:
        toNumberValue(
          simulationForm.discountRate !== ""
            ? simulationForm.discountRate
            : (currentDraft?.discountRate ??
              currentDraft?.simulationSettings?.discountRate ??
              latestSimulationSettings?.discountRate ??
              0.1) * 100,
        ) / 100,
      years: toNumberValue(
        simulationForm.years !== ""
          ? simulationForm.years
          : (currentDraft?.years ??
            currentDraft?.yearsExpected ??
            currentDraft?.simulationSettings?.years ??
            currentDraft?.simulationSettings?.yearsExpected ??
            latestSimulationSettings?.years ??
            latestSimulationSettings?.yearsExpected ??
            3),
      ),
    };
  };

  const handleSave = () => {
    if (filledRows.length === 0) {
      popup.alert({
        title: { id: "Data Belum Lengkap", en: "Incomplete Data" },
        message: {
          id: "Isi minimal satu data dulu sebelum menyimpan.",
          en: "Please fill in at least one item before saving.",
        },
        tone: "danger",
      });
      return;
    }

    setShowResultCard(true);
  };

  const getLatestSimulationIndex = useCallback(() => {
    const history = Array.isArray(currentDraft?.simulationHistory)
      ? currentDraft.simulationHistory
      : [];

    if (history.length === 0) {
      return -1;
    }

    const latestTimestamp = new Date(latestSimulation?.calculatedAt || 0).getTime();
    const matchedIndex = history.findIndex(
      (item) => new Date(item?.calculatedAt || 0).getTime() === latestTimestamp,
    );

    return matchedIndex >= 0 ? matchedIndex : history.length - 1;
  }, [currentDraft?.simulationHistory, latestSimulation?.calculatedAt]);

  const buildPdfBlob = async () => {
    const exportElement = pdfExportRef.current;
    if (!exportElement) {
      await popup.alert({
        title: { id: "Template Belum Siap", en: "Template Not Ready" },
        message: { id: "Template PDF belum siap.", en: "The PDF template is not ready yet." },
        tone: "danger",
      });
      return null;
    }

    const pages = [...exportElement.querySelectorAll(".pdf-export-page")];
    if (pages.length === 0) {
      await popup.alert({
        title: { id: "Template Belum Siap", en: "Template Not Ready" },
        message: { id: "Halaman PDF belum siap.", en: "PDF pages are not ready yet." },
        tone: "danger",
      });
      return null;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const canvases = await Promise.all(
      pages.map((page) =>
        html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }),
      ),
    );

    canvases.forEach((canvas, index) => {
      const imageData = canvas.toDataURL("image/png");

      if (index > 0) {
        pdf.addPage();
      }

      pdf.addImage(imageData, "PNG", 0, 0, 297, 210);
    });

    return pdf.output("blob");
  };

  const handleExportPdf = async () => {
    try {
      const pdfBlob = await buildPdfBlob();
      if (!pdfBlob) {
        return;
      }

      const fileName = `project-${id}-executive-summary.pdf`;
      const localDownloadUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = localDownloadUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      URL.revokeObjectURL(localDownloadUrl);

      const latestSimulationIndex = getLatestSimulationIndex();
      if (latestSimulationIndex < 0) {
        popup.notify({
          title: { id: "PDF Tersimpan Lokal", en: "PDF Saved Locally" },
          message: {
            id: "PDF berhasil diunduh. Simpan project dulu agar PDF juga tersimpan di storage.",
            en: "PDF was downloaded. Save the project first so it can also be uploaded to storage.",
          },
        });
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("pdf", new File([pdfBlob], fileName, { type: "application/pdf" }));
      await api.post(`/projects/${id}/reports/${latestSimulationIndex}/pdf`, uploadFormData);

      popup.notify({
        title: { id: "PDF Berhasil Diunggah", en: "PDF Uploaded Successfully" },
        message: {
          id: "PDF sudah tersimpan ke storage dan siap diakses dari laporan.",
          en: "PDF has been uploaded to storage and is ready from reports.",
        },
      });
    } catch {
      popup.alert({
        title: { id: "Export Gagal", en: "Export Failed" },
        message: { id: "Gagal membuat atau mengunggah PDF.", en: "Failed to generate or upload the PDF." },
        tone: "danger",
      });
    }
  };

  const handleSaveProject = async () => {
    const isConfirmed = await popup.confirm({
      title: { id: "Simpan Project", en: "Save Project" },
      message: {
        id: "Yakin ingin menyimpan project ini? Setelah disimpan, kamu akan lanjut ke Report List.",
        en: "Are you sure you want to save this project? After saving, you will be redirected to Report List.",
      },
      confirmText: { id: "Simpan Project", en: "Save Project" },
      cancelText: { id: "Cek Lagi", en: "Review Again" },
    });

    if (!isConfirmed) {
      return;
    }

    const resultAction = await dispatch(
      updateProjectDraft({
        projectId: id,
        payload: buildDraftPayload(),
      }),
    );

    if (updateProjectDraft.rejected.match(resultAction)) {
      await popup.alert({
        title: { id: "Penyimpanan Gagal", en: "Save Failed" },
        message: resultAction.payload || { id: "Gagal menyimpan project.", en: "Failed to save the project." },
        tone: "danger",
      });
      return;
    }

    await dispatch(fetchProjects());
    setShowResultCard(false);
    popup.notify({
      title: { id: "Project Tersimpan", en: "Project Saved" },
      message: {
        id: "Perubahan sudah disimpan dan siap dilihat di Report List.",
        en: "Your changes have been saved and are ready to view in Report List.",
      },
    });
    navigate("/report-list");
  };

  const handleSendChat = async (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || chatSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatSending(true);
    setChatError("");

    try {
      const response = await api.post(CHATBOT_ENDPOINT(id), { message: trimmedMessage });
      const replyText =
        response?.data?.text ||
        response?.text ||
        response?.data?.content ||
        "AI Helpy belum memberikan jawaban.";
      const cleanedReply = cleanChatMessage(replyText);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: cleanedReply,
        },
      ]);
      setChatHistoryEntries(
        saveAiHelpyHistoryEntry({
          projectId: id,
          projectName: activeProjectName,
          preview: buildHistoryPreview(trimmedMessage),
          prompt: trimmedMessage,
          response: cleanedReply,
          updatedAt: new Date().toISOString(),
        }),
      );
      await loadChatHistory();
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "Maaf, AI Helpy belum bisa merespons sekarang.",
        },
      ]);
      setChatHistoryEntries(
        saveAiHelpyHistoryEntry({
          projectId: id,
          projectName: activeProjectName,
          preview: buildHistoryPreview(trimmedMessage),
          prompt: trimmedMessage,
          response: "Maaf, AI Helpy belum bisa merespons sekarang.",
          updatedAt: new Date().toISOString(),
        }),
      );
      const backendError = error?.data?.message || error?.message || "";
      setChatError(
        /fetch failed/i.test(backendError)
          ? "Koneksi ke AI Helpy belum tersedia."
          : backendError || "Pesan belum berhasil dikirim ke backend.",
      );
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="Project List" />

      <main className={`main-content ${isChatOpen ? "shrink" : ""}`}>
        <div className="header">
          <div>
            <h1>Edit Data</h1>
            <p>
              Edit hasil generate AI untuk {currentDraft?.projectName || "project ini"}, lalu simpan perubahan
              sesuai kebutuhanmu.
            </p>
          </div>
        </div>

        {loading && <p>Loading project draft...</p>}
        {error && <p className="edit-data-error">{error}</p>}

        {!loading && (
        <>
        {currentDraft && (
          <div className="draft-overview-grid">
            <div className="draft-overview-card">
              <span>Status</span>
              <strong>{String(currentDraft?.status || "-").replaceAll("_", " ")}</strong>
            </div>
            <div className="draft-overview-card">
              <span>Calculated Scale</span>
              <strong>{currentDraft?.calculatedScale || "-"}</strong>
            </div>
            <div className="draft-overview-card">
              <span>McFarlan Quadrant</span>
              <strong>{currentDraft?.mcfarlan?.quadrant || "-"}</strong>
            </div>
            <div className="draft-overview-card">
              <span>Expires At</span>
              <strong>
                {currentDraft?.expiresAt
                  ? new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(currentDraft.expiresAt))
                  : "-"}
              </strong>
            </div>
          </div>
        )}

        <div className="input-card meta-card">
          <div className="card-header">
            <div>
              <h3>Scenario Name</h3>
              <p className="card-subtitle">Gunakan nama skenario yang paling sesuai untuk simulasi ini.</p>
            </div>
          </div>

          <div className="input-group">
            <label>Scenario Name</label>
            <input
              type="text"
              placeholder="Contoh: Optimistic Scenario"
              value={simulationForm.scenarioName}
              onChange={(event) => handleSimulationFieldChange("scenarioName", event.target.value)}
            />
          </div>
        </div>

        <div className="edit-grid">
          {sections.map((section) => (
            <div className="input-card" key={section.id}>
              <div className="card-header">
                <div>
                  <h3>{section.title}</h3>
                  <p className="card-subtitle">Tambahkan item yang benar-benar ingin dihitung.</p>
                </div>
                <button type="button" className="add-row-btn" onClick={() => handleAddRow(section.id)}>
                  Add Item
                </button>
              </div>

              <div className="section-rows">
                {section.rows.map((row, index) => (
                  <div className="section-row" key={row.id}>
                    <div className="row-head">
                      <span>{section.title} Item {index + 1}</span>
                      <button
                        type="button"
                        className="delete-row-btn"
                        onClick={() => handleDeleteRow(section.id, row.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="input-group">
                      <label>Item</label>
                      <input
                        type="text"
                        placeholder={`Contoh ${section.title} item`}
                        value={row.item}
                        onChange={(event) => handleFieldChange(section.id, row.id, "item", event.target.value)}
                      />

                      <label>Description</label>
                      <textarea
                        rows="3"
                        placeholder="Tambahkan deskripsi item"
                        value={row.description}
                        onChange={(event) => handleFieldChange(section.id, row.id, "description", event.target.value)}
                      />

                      <label>Nominal</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Masukkan nominal"
                        value={row.nominal}
                        onChange={(event) => handleFieldChange(section.id, row.id, "nominal", event.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="input-card meta-card simulation-settings-card">
          <div className="card-header">
            <div>
              <h3>Simulation Settings</h3>
              <p className="card-subtitle">Masukkan nilai rate dalam format persen, misalnya 5 berarti 5%.</p>
            </div>
          </div>

          <div className="meta-field-grid">
            <div className="input-group meta-field">
              <label>Inflation Rate</label>
              <div className="percent-input-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="5"
                  value={simulationForm.inflationRate}
                  onChange={(event) => handleSimulationFieldChange("inflationRate", event.target.value)}
                />
                <span className="percent-suffix">%</span>
              </div>
            </div>

            <div className="input-group meta-field">
              <label>Tax Rate</label>
              <div className="percent-input-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="11"
                  value={simulationForm.taxRate}
                  onChange={(event) => handleSimulationFieldChange("taxRate", event.target.value)}
                />
                <span className="percent-suffix">%</span>
              </div>
            </div>

            <div className="input-group meta-field">
              <label>Discount Rate</label>
              <div className="percent-input-wrapper">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="10"
                  value={simulationForm.discountRate}
                  onChange={(event) => handleSimulationFieldChange("discountRate", event.target.value)}
                />
                <span className="percent-suffix">%</span>
              </div>
            </div>

            <div className="input-group meta-field">
              <label>Years Expected</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="3"
                value={simulationForm.years}
                onChange={(event) => handleSimulationFieldChange("years", event.target.value)}
              />
            </div>
          </div>
        </div>
        </>
        )}

        {!loading && (
        <div className="footer-actions">
          <button className="btn-save" onClick={handleSave}>
            Save Changes
          </button>

          <div className="ai-trigger" onClick={() => setIsChatOpen(true)}>
            <div className="ai-icon">AI</div>
            <span>AI Helpy</span>
          </div>
        </div>
        )}
      </main>

    <div className={`ai-chat ${isChatOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="chat-title-wrap">
            <div className="chat-title">
              AI <span>Helpy</span>
            </div>
            <button type="button" className="chat-open-pill">
              Open AI Helpy Chat
            </button>
          </div>
          <div className="chat-header-actions">
            <button type="button" className="chat-refresh-btn" onClick={loadChatHistory} disabled={chatLoading}>
              {chatLoading ? "..." : "Refresh"}
            </button>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close AI Helpy"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-history-panel">
            <div className="chat-history-title">Chat history</div>
            <div className="chat-history-list">
              {chatHistoryEntries.length === 0 ? (
                <p className="chat-state">Belum ada riwayat yang tersimpan.</p>
              ) : (
                chatHistoryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`chat-history-item ${entry.projectId === id ? "active" : ""}`}
                  >
                    <div className="chat-history-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 6v6l4 2" />
                        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                      </svg>
                    </div>
                    <div className="chat-history-copy">
                      <strong>{entry.preview}</strong>
                      <span>{entry.projectName}</span>
                    </div>
                    <time>{formatHistoryDate(entry.updatedAt)}</time>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chat-conversation-head">Current conversation</div>
          {chatLoading ? <p className="chat-state">Loading chat history...</p> : null}
          {!chatLoading && chatMessages.length === 0 ? (
            <p className="chat-state">Belum ada chat history. Coba mulai pertanyaan baru.</p>
          ) : null}
          {chatMessages.map((message) => (
            <div key={message.id} className={`chat-message ${message.role}`}>
              <span className="chat-role">{message.role === "user" ? "You" : "AI Helpy"}</span>
              <p>{cleanChatMessage(message.content)}</p>
            </div>
          ))}
          {chatError ? <p className="chat-error">{chatError}</p> : null}
        </div>

        <form className="chat-footer" onSubmit={handleSendChat}>
          <input
            type="text"
            placeholder="Ask anything you need..."
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            disabled={chatSending}
          />
          <button type="submit" className="chat-send-btn" disabled={chatSending || !chatInput.trim()}>
            {chatSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      <div className="pdf-export-stage" aria-hidden="true">
        <div className="pdf-export-pages" ref={pdfExportRef}>
          <div className="pdf-export-page portrait">
            <section className="pdf-export-column full">
              <div className="pdf-export-hero">
                <img src={invesTechyLogo} alt="InvesTechy" className="pdf-export-logo" />
                <h1>{String(exportProjectName).toUpperCase()}</h1>
                <p>Executive Summary</p>
              </div>

              <div className="pdf-card pdf-overview-card">
                <h3>Project Overview</h3>
                <div className="pdf-kv-list">
                  <div><span>Project Name</span><strong>{exportProjectName}</strong></div>
                  <div><span>Industry</span><strong>{exportIndustry}</strong></div>
                  <div><span>Scale</span><strong>{exportScale}</strong></div>
                  <div><span>Plan</span><strong>{exportPlan}</strong></div>
                  <div><span>Location</span><strong>{exportLocation}</strong></div>
                </div>
              </div>

              <div className="pdf-page-grid pdf-page-grid-two">
                <div className="pdf-card">
                  <h3>McFarlan Matrix</h3>
                  <div className="pdf-matrix-box">
                    <div className="pdf-matrix-grid">
                      <span>Factory</span>
                      <span>Strategic</span>
                      <span>Support</span>
                      <span>Turnaround</span>
                      <div
                        className="pdf-matrix-point"
                        style={{
                          left: `${Math.min((Number(exportCoordinates?.x) || 0) * 20, 100)}%`,
                          top: `${100 - Math.min((Number(exportCoordinates?.y) || 0) * 20, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="pdf-matrix-footer">
                      <strong>{exportQuadrant}</strong>
                      <span>
                        Coordinate: ({formatShortNumber(exportCoordinates?.x || 0)}, {formatShortNumber(exportCoordinates?.y || 0)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pdf-stack">
                  <div className="pdf-card pdf-scores-card">
                    <h3>Business Domain Scores</h3>
                    {businessScoreEntries.length > 0 ? (
                      <div className="pdf-score-list">
                        {businessScoreEntries.slice(0, 5).map(({ label, value }) => (
                          <div key={label} className="pdf-score-row">
                            <span>{label}</span>
                            <div className="pdf-score-bar"><i style={{ width: `${(value / 5) * 100}%` }} /></div>
                            <strong>{formatShortNumber(value)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pdf-empty-state">No business domain score data available.</p>
                    )}
                  </div>

                  <div className="pdf-card pdf-scores-card">
                    <h3>Technology Domain Scores</h3>
                    {technologyScoreEntries.length > 0 ? (
                      <div className="pdf-score-list">
                        {technologyScoreEntries.slice(0, 4).map(({ label, value }) => (
                          <div key={label} className="pdf-score-row">
                            <span>{label}</span>
                            <div className="pdf-score-bar"><i style={{ width: `${(value / 5) * 100}%` }} /></div>
                            <strong>{formatShortNumber(value)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pdf-empty-state">No technology domain score data available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pdf-card pdf-insight-card">
                <h3>Key Insight</h3>
                <p>{exportInsight}</p>
              </div>
            </section>
          </div>

          <div className="pdf-export-page portrait">
            <section className="pdf-export-column full">
              <div className="pdf-section-head">
                <img src={invesTechyLogo} alt="InvesTechy" className="pdf-export-logo small" />
                <div>
                  <h2>FINANCIAL BREAKDOWN</h2>
                  <p>Investment & Benefit Analysis</p>
                </div>
              </div>

              <div className="pdf-page-grid pdf-page-grid-breakdown">
                <div className="pdf-card">
                  <h3>CAPEX (Capital Expenditure)</h3>
                  <table className="pdf-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Nominal</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capexRows.slice(0, 5).map((row) => (
                        <tr key={row.id}>
                          <td>{row.item || "-"}</td>
                          <td>{formatCurrencyText(row.nominal)}</td>
                          <td>{row.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {capexRows.length > 6 ? <p className="pdf-note">+ {capexRows.length - 6} item lain tetap dihitung di total.</p> : null}
                  <div className="pdf-total-row">
                    <span>Total CAPEX</span>
                    <strong>{formatCurrencyText(summary.capex)}</strong>
                  </div>
                </div>

                <div className="pdf-card">
                  <h3>OPEX (Operational Expenditure)</h3>
                  <table className="pdf-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Nominal</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opexRows.slice(0, 5).map((row) => (
                        <tr key={row.id}>
                          <td>{row.item || "-"}</td>
                          <td>{formatCurrencyText(row.nominal)}</td>
                          <td>{row.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {opexRows.length > 6 ? <p className="pdf-note">+ {opexRows.length - 6} item lain tetap dihitung di total.</p> : null}
                  <div className="pdf-total-row">
                    <span>Total OPEX</span>
                    <strong>{formatCurrencyText(summary.opex)}</strong>
                  </div>
                </div>
              </div>

              <div className="pdf-card">
                <h3>Benefits Overview</h3>
                <div className="pdf-benefit-grid">
                  <div className="pdf-benefit-card">
                    <span>Tangible Benefits</span>
                    <strong>{formatCurrencyText(summary.tangible)}</strong>
                    <small>{tangibleRows[0]?.item || "Operational gains"}</small>
                  </div>
                  <div className="pdf-benefit-card">
                    <span>Intangible Benefits</span>
                    <strong>{formatCurrencyText(summary.intangible)}</strong>
                    <small>{intangibleRows[0]?.item || "Strategic value"}</small>
                  </div>
                </div>
                <div className="pdf-total-row">
                  <span>Total Benefits</span>
                  <strong>{formatCurrencyText(summary.benefit)}</strong>
                </div>
              </div>
            </section>
          </div>

          <div className="pdf-export-page portrait">
            <section className="pdf-export-column full">
              <div className="pdf-section-head">
                <img src={invesTechyLogo} alt="InvesTechy" className="pdf-export-logo small" />
                <div>
                  <h2>SIMULATION & FEASIBILITY</h2>
                  <p>{previewScenarioName}</p>
                </div>
              </div>

              <div className="pdf-page-grid pdf-page-grid-two">
                <div className="pdf-stack">
                  <div className="pdf-card">
                    <h3>Financial Results</h3>
                    <div className="pdf-metric-list">
                      <div className="pdf-metric-row"><span>NPV</span><strong>{formatCurrencyText(financialResults?.npv || summary.total)}</strong></div>
                      <div className="pdf-metric-row"><span>ROI</span><strong>{formatShortNumber(financialResults?.roi || 0)}%</strong></div>
                      <div className="pdf-metric-row"><span>Payback Period</span><strong>{formatShortNumber(financialResults?.paybackPeriod || 0)} Years</strong></div>
                      <div className="pdf-metric-row"><span>Break Even</span><strong>Year {formatShortNumber(financialResults?.breakEvenYear || 0)}</strong></div>
                      <div className="pdf-metric-row"><span>IE Score</span><strong>{formatShortNumber(financialResults?.ieScore || 0)}</strong></div>
                      <div className="pdf-metric-row"><span>Feasibility</span><strong>{exportFeasibility}</strong></div>
                    </div>
                  </div>

                  <div className="pdf-card">
                    <h3>Simulation Settings</h3>
                    <div className="pdf-kv-list compact">
                      <div><span>Inflation Rate</span><strong>{formatShortNumber((previewSimulationSettings.inflationRate || 0) * 100)}%</strong></div>
                      <div><span>Tax Rate</span><strong>{formatShortNumber((previewSimulationSettings.taxRate || 0) * 100)}%</strong></div>
                      <div><span>Discount Rate</span><strong>{formatShortNumber((previewSimulationSettings.discountRate || 0) * 100)}%</strong></div>
                      <div><span>Projection Years</span><strong>{formatShortNumber(previewSimulationSettings.years || 3)}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="pdf-stack">
                  <div className="pdf-card">
                    <h3>Break-Even Table</h3>
                    <table className="pdf-table small">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Net Cash Flow</th>
                          <th>Cumulative Cash Flow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakEvenRows.length > 0 ? (
                          breakEvenRows.slice(0, 5).map((row, index) => (
                            <tr key={`${row?.year || index}`}>
                              <td>Year {row?.year || index + 1}</td>
                              <td>{formatCurrencyText(row?.netCashFlow)}</td>
                              <td>{formatCurrencyText(row?.cumulativeCashFlow)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="pdf-empty-table">
                              No break-even analysis data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="pdf-card pdf-conclusion-card">
                    <h3>Conclusion</h3>
                    <p>
                      {String(exportFeasibility).toLowerCase().includes("need")
                        ? "Project masih perlu penyesuaian tambahan sebelum implementasi penuh."
                        : `Project menunjukkan hasil yang baik dengan ROI ${formatShortNumber(financialResults?.roi || 0)}% dan payback period ${formatShortNumber(financialResults?.paybackPeriod || 0)} tahun.`}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showResultCard && (
        <div className="result-overlay" onClick={() => setShowResultCard(false)}>
          <div className="result-card" onClick={(event) => event.stopPropagation()}>
            <span className="result-badge">{summary.status}</span>
            <h2>Result Summary</h2>
            <p>Hasil ini langsung dihitung dari data yang baru saja kamu isi di halaman edit.</p>

            <div className="result-grid">
              <div className="result-item">
                <span>CAPEX</span>
                <strong>{formatCurrency(summary.capex)}</strong>
              </div>
              <div className="result-item">
                <span>OPEX</span>
                <strong>{formatCurrency(summary.opex)}</strong>
              </div>
              <div className="result-item">
                <span>Tangible Results</span>
                <strong>{formatCurrency(summary.tangible)}</strong>
              </div>
              <div className="result-item">
                <span>Intangible Results</span>
                <strong>{formatCurrency(summary.intangible)}</strong>
              </div>
            </div>

            <div className="result-detail-list">
              {filledRows.map((row) => (
                <div className="result-detail-row" key={`${row.title}-${row.id}`}>
                  <div>
                    <span>{row.title}</span>
                    <strong>{row.item || "Untitled Item"}</strong>
                    {row.description ? <small>{row.description}</small> : null}
                  </div>
                  <b>{formatCurrency(row.nominal)}</b>
                </div>
              ))}
            </div>

            <div className="result-actions">
              <button
                type="button"
                className="btn-result secondary"
                onClick={() => setShowResultCard(false)}
              >
                Back
              </button>
              <button type="button" className="btn-result muted" onClick={handleSaveProject}>
                {loading ? "Saving..." : "Save Project"}
              </button>
              <button type="button" className="btn-result primary" onClick={handleExportPdf}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
