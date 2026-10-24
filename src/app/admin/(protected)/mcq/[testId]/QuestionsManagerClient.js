"use client";

import { useState, useEffect, use as usePromise } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "../../../adminFetch";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  normalizeType,
  parseMsqAnswer,
  formatCorrectAnswer,
  totalMarks,
  round2,
} from "../../../../lib/questionTypes";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// Default marking per question type (admin can change these anywhere).
const DEFAULT_MARKING = {
  MCQ: { marks: 1, negative_marks: 0.33 },
  MSQ: { marks: 2, negative_marks: 0 },
  NAT: { marks: 1, negative_marks: 0 },
};

const TYPE_BADGE_CLASSES = {
  MCQ: "bg-blue-100 text-blue-800",
  MSQ: "bg-green-100 text-green-800",
  NAT: "bg-orange-100 text-orange-800",
};

const emptyOption = () => ({ option_text: "", option_image: null, is_correct: false });
const emptyOptions = () => [emptyOption(), emptyOption(), emptyOption(), emptyOption()];

export default function QuestionsManager({ params }) {
  const { testId } = usePromise(params); // dynamic route param
  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState(null);
  const [questionType, setQuestionType] = useState("MCQ");
  const [marks, setMarks] = useState(DEFAULT_MARKING.MCQ.marks);
  const [negativeMarks, setNegativeMarks] = useState(DEFAULT_MARKING.MCQ.negative_marks);
  const [options, setOptions] = useState(emptyOptions);
  const [natAnswer, setNatAnswer] = useState("");
  const [natTolerance, setNatTolerance] = useState(0);
  const [aboutAnswer, setAboutAnswer] = useState("");
  const [aboutAnswerImage, setAboutAnswerImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null); // stores question object being edited
  const [formKey, setFormKey] = useState(0); // remounts file inputs after reset

  // ------------------------------
  // AI generation
  // ------------------------------
  const [mode, setMode] = useState("manual"); // "manual" | "ai"
  const [aiExamDetails, setAiExamDetails] = useState("");
  const [aiFiles, setAiFiles] = useState([]);
  const [aiNumOptions, setAiNumOptions] = useState(4);
  const [aiLanguage, setAiLanguage] = useState("English");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiLevel, setAiLevel] = useState(5);
  const [aiTypeConfig, setAiTypeConfig] = useState({
    MCQ: { count: 10, ...DEFAULT_MARKING.MCQ },
    MSQ: { count: 0, ...DEFAULT_MARKING.MSQ },
    NAT: { count: 0, ...DEFAULT_MARKING.NAT },
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [aiProgress, setAiProgress] = useState({ done: 0, total: 0 });
  const [aiError, setAiError] = useState("");

  // Bulk marks update for existing questions
  const [bulkFrom, setBulkFrom] = useState(1);
  const [bulkTo, setBulkTo] = useState(1);
  const [bulkType, setBulkType] = useState("ALL");
  const [bulkMarks, setBulkMarks] = useState("");
  const [bulkNegative, setBulkNegative] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const AI_BATCH_SIZE = 10;

  const aiTotalQuestions = QUESTION_TYPES.reduce(
    (sum, t) => sum + (parseInt(aiTypeConfig[t].count, 10) || 0),
    0
  );
  const aiTotalMarks = round2(
    QUESTION_TYPES.reduce(
      (sum, t) => sum + (parseInt(aiTypeConfig[t].count, 10) || 0) * (Number(aiTypeConfig[t].marks) || 0),
      0
    )
  );

  const updateAiType = (type, field, value) => {
    setAiTypeConfig((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const handleAiFilesChange = (fileList) => {
    const picked = Array.from(fileList || []).filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    );
    if (picked.length < (fileList?.length || 0)) {
      toast.error("Sirf images aur PDF files allowed hain");
    }
    setAiFiles((prev) => [...prev, ...picked].slice(0, 10));
  };

  const handleGenerateWithAI = async () => {
    if (!aiExamDetails.trim() && aiFiles.length === 0) {
      toast.error("Exam/topic details likho ya image/PDF upload karo");
      return;
    }
    if (aiTotalQuestions < 1) {
      toast.error("Kam se kam ek type ke questions ki count do");
      return;
    }

    setAiGenerating(true);
    setAiError("");
    setAiProgress({ done: 0, total: aiTotalQuestions });

    const generatedTitles = [];
    let doneCount = 0;

    try {
      // 1. Upload reference files once; batches reuse the returned references.
      let attachments = [];
      if (aiFiles.length > 0) {
        setAiStatus("Files upload ho rahi hain...");
        const fd = new FormData();
        aiFiles.forEach((f) => fd.append("files", f));
        const upRes = await adminFetch("/api/admin/ai-upload", { method: "POST", body: fd });
        const upData = await upRes.json().catch(() => ({}));
        if (!upRes.ok || !upData.success) {
          throw new Error(upData.message || "File upload failed");
        }
        attachments = upData.attachments;
      }

      // 2. Generate each question type in batches.
      for (const type of QUESTION_TYPES) {
        const cfg = aiTypeConfig[type];
        const typeTotal = parseInt(cfg.count, 10) || 0;
        let typeDone = 0;

        while (typeDone < typeTotal) {
          const batchCount = Math.min(AI_BATCH_SIZE, typeTotal - typeDone);
          setAiStatus(`${type} questions generate ho rahe hain...`);

          const res = await adminFetch("/api/admin/generate-mcq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              test_id: testId,
              exam_details: aiExamDetails,
              attachments,
              question_type: type,
              marks: cfg.marks,
              negative_marks: cfg.negative_marks,
              num_options: aiNumOptions,
              language: aiLanguage,
              difficulty: aiDifficulty,
              level: aiLevel,
              count: batchCount,
              avoid_titles: generatedTitles,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.message || `${type} generation failed`);
          }

          generatedTitles.push(...data.titles);
          typeDone += data.inserted;
          doneCount += data.inserted;
          setAiProgress({ done: doneCount, total: aiTotalQuestions });

          if (data.inserted === 0) {
            // Avoid an infinite loop if the AI keeps returning nothing usable.
            throw new Error("AI stopped returning usable questions. Try adjusting the details.");
          }
        }
      }

      toast.success(`${doneCount} question${doneCount !== 1 ? "s" : ""} generated and saved!`);
    } catch (err) {
      console.error(err);
      setAiError(err.message || "Error generating questions");
      toast.error(err.message || "Error generating questions");
    } finally {
      if (doneCount > 0) fetchQuestions();
      setAiGenerating(false);
      setAiStatus("");
    }
  };

  // ------------------------------
  // Fetch existing questions
  // ------------------------------
  const fetchQuestions = async () => {
    try {
      setFetchingQuestions(true);
      const res = await adminFetch(`/api/admin/mcq-with-answers/${testId}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        setBulkTo(data.data.length || 1);
      } else {
        alert("Failed to fetch questions");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching questions");
    } finally {
      setFetchingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  // ------------------------------
  // Form helpers
  // ------------------------------
  const resetForm = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionImage(null);
    setQuestionType("MCQ");
    setMarks(DEFAULT_MARKING.MCQ.marks);
    setNegativeMarks(DEFAULT_MARKING.MCQ.negative_marks);
    setOptions(emptyOptions());
    setNatAnswer("");
    setNatTolerance(0);
    setAboutAnswer("");
    setAboutAnswerImage(null);
    setFormKey((k) => k + 1);
  };

  const handleTypeChange = (type) => {
    setQuestionType(type);
    setMarks(DEFAULT_MARKING[type].marks);
    setNegativeMarks(DEFAULT_MARKING[type].negative_marks);
    if (type === "MCQ") {
      // Only one option can stay correct.
      let seen = false;
      setOptions((prev) =>
        prev.map((o) => {
          const keep = o.is_correct && !seen;
          if (o.is_correct) seen = true;
          return { ...o, is_correct: keep };
        })
      );
    }
  };

  const startEditing = (q) => {
    const type = normalizeType(q.question_type);
    const correctList =
      type === "MSQ" ? parseMsqAnswer(q.answer?.correct_answer) : [q.answer?.correct_answer];

    setEditingQuestion(q);
    setQuestionText(q.question_text || "");
    setQuestionImage(null); // optionally allow re-upload
    setQuestionType(type);
    setMarks(q.marks ?? 1);
    setNegativeMarks(q.negative_marks ?? 0);
    setAboutAnswer(q.answer?.about_answer || "");
    setAboutAnswerImage(null); // optionally re-upload
    setNatAnswer(type === "NAT" ? q.answer?.correct_answer ?? "" : "");
    setNatTolerance(type === "NAT" ? q.answer?.answer_tolerance ?? 0 : 0);
    setOptions(
      q.options.length
        ? q.options.map((opt) => ({
            id: opt.id, // important for PATCH
            option_text: opt.option_text || "",
            option_image: null, // for re-upload
            existing_image: opt.option_image,
            is_correct: type !== "NAT" && correctList.includes(opt.option_text),
          }))
        : emptyOptions()
    );
    setFormKey((k) => k + 1);
    setMode("manual");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------
  // Submit (Add or Update) question
  // ------------------------------
  const handleSubmit = async () => {
    if (!questionText) {
      toast.error("Question text required hai");
      return;
    }

    let correctAnswer;
    if (questionType === "NAT") {
      if (natAnswer === "" || !Number.isFinite(Number(natAnswer))) {
        toast.error("NAT ke liye sahi numerical answer daalo");
        return;
      }
      correctAnswer = String(Number(natAnswer));
    } else {
      const filled = options.filter((o) => o.option_text.trim() || o.option_image || o.existing_image);
      if (filled.length < 2) {
        toast.error("Kam se kam 2 options chahiye");
        return;
      }
      const correctOpts = options.filter((o) => o.is_correct && o.option_text.trim());
      if (questionType === "MCQ" && correctOpts.length !== 1) {
        toast.error("MCQ mein ek correct option select karo");
        return;
      }
      if (questionType === "MSQ" && correctOpts.length < 1) {
        toast.error("MSQ mein kam se kam ek correct option select karo");
        return;
      }
      correctAnswer =
        questionType === "MCQ"
          ? correctOpts[0].option_text
          : JSON.stringify(correctOpts.map((o) => o.option_text));
    }

    setLoading(true);
    const formData = new FormData();

    formData.append("test_id", testId);
    formData.append("question_text", questionText);
    formData.append("question_type", questionType);
    formData.append("marks", marks);
    formData.append("negative_marks", negativeMarks);
    if (questionType === "NAT") formData.append("answer_tolerance", natTolerance || 0);
    if (questionImage) formData.append("question_image", questionImage);
    formData.append("correct_answer", correctAnswer);
    formData.append("about_answer", aboutAnswer);
    if (aboutAnswerImage) formData.append("about_answer_img", aboutAnswerImage);

    // Add question_id for PATCH requests
    if (editingQuestion) {
      formData.append("question_id", editingQuestion.id);
    }

    // Append options
    if (questionType !== "NAT") {
      options.forEach((opt, idx) => {
        const i = idx + 1;
        if (opt.id) formData.append(`option_id_${i}`, opt.id); // existing option
        if (opt.option_text || opt.id) formData.append(`option_text_${i}`, opt.option_text);
        if (opt.option_image) formData.append(`option_image_${i}`, opt.option_image);
      });
    }

    try {
      const url = editingQuestion
        ? `/api/admin/mcq-with-answers/${editingQuestion.id}` // PATCH endpoint
        : "/api/admin/questions"; // POST endpoint

      const method = editingQuestion ? "PATCH" : "POST";

      const res = await adminFetch(url, { method, body: formData });
      const data = await res.json();

      if (data.success === true || data.message?.toLowerCase().includes("success")) {
        toast.success(editingQuestion ? "Question updated successfully!" : "Question added successfully!");
        fetchQuestions();
        resetForm();
      } else {
        toast.error("Failed: " + (data.message || data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting question");
    }

    setLoading(false);
  };

  // ------------------------------
  // Add / Remove Options
  // ------------------------------
  const addOption = () => setOptions([...options, emptyOption()]);
  const removeOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
  const handleOptionTextChange = (idx, value) => {
    setOptions(options.map((o, i) => (i === idx ? { ...o, option_text: value } : o)));
  };
  const handleOptionImageChange = (idx, file) => {
    setOptions(options.map((o, i) => (i === idx ? { ...o, option_image: file } : o)));
  };
  const toggleCorrect = (idx) => {
    setOptions(
      options.map((o, i) => {
        if (questionType === "MCQ") return { ...o, is_correct: i === idx };
        return i === idx ? { ...o, is_correct: !o.is_correct } : o;
      })
    );
  };

  // ------------------------------
  // Bulk marks update
  // ------------------------------
  const handleBulkUpdate = async () => {
    const from = Math.max(1, parseInt(bulkFrom, 10) || 1);
    const to = Math.min(questions.length, parseInt(bulkTo, 10) || questions.length);
    if (from > to) {
      toast.error("'From' number 'To' se chhota hona chahiye");
      return;
    }
    if (bulkMarks === "" && bulkNegative === "") {
      toast.error("Marks ya negative marks mein se kuch to daalo");
      return;
    }

    const ids = questions
      .slice(from - 1, to)
      .filter((q) => bulkType === "ALL" || normalizeType(q.question_type) === bulkType)
      .map((q) => q.id);

    if (ids.length === 0) {
      toast.error("Is range mein is type ka koi question nahi hai");
      return;
    }

    setBulkSaving(true);
    try {
      const res = await adminFetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          marks: bulkMarks === "" ? undefined : bulkMarks,
          negative_marks: bulkNegative === "" ? undefined : bulkNegative,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.updated} questions update ho gaye`);
        fetchQuestions();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating marks");
    } finally {
      setBulkSaving(false);
    }
  };

  // ------------------------------
  // Jodit Editor Config
  // ------------------------------
  const editorConfig = {
    readonly: false,
    height: 400,
    toolbarAdaptive: false,
    placeholder: "Write your question here...",
    buttons: [
      "paragraph", "|",
      "bold", "italic", "underline", "|",
      "ul", "ol", "|",
      "font", "fontsize", "|",
      "image", "link", "|",
      "align", "|",
      "undo", "redo", "|",
      "hr", "table", "|",
      "fullsize", "preview"
    ],
    controls: {
      paragraph: {
        list: {
          Normal: "p",
          "Heading 1": "h1",
          "Heading 2": "h2",
          "Heading 3": "h3",
          "Heading 4": "h4",
          "Heading 5": "h5",
          "Heading 6": "h6",
          Preformatted: "pre",
          Quote: "blockquote"
        }
      }
    },
    uploader: { insertImageAsBase64URI: false },
    removeButtons: ["brush", "file"],
    showXPathInStatusbar: false,
    showCharsCounter: true,
    showWordsCounter: true
  };

  const typeCounts = QUESTION_TYPES.reduce((acc, t) => {
    acc[t] = questions.filter((q) => normalizeType(q.question_type) === t).length;
    return acc;
  }, {});

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div><Toaster position="top-right" reverseOrder={false} /></div>

      {/* ---------------- Manual / AI mode toggle ---------------- */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setMode("manual")}
          className={`px-5 py-2.5 font-semibold border-b-2 transition-colors ${
            mode === "manual"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`px-5 py-2.5 font-semibold border-b-2 transition-colors ${
            mode === "ai"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          AI
        </button>
      </div>

      {/* ---------------- AI Generation Panel ---------------- */}
      {mode === "ai" && (
        <div className="p-4 border rounded shadow bg-purple-50/40 space-y-4">
          <h2 className="text-xl font-bold">Generate MCQs with AI</h2>
          <p className="text-sm text-gray-600">
            Exam ke details do ya image/PDF upload karo, AI khud questions, options, correct answer aur
            explanation generate karke seedha is test ke andar database mein save kar dega.
          </p>

          <div>
            <label className="font-semibold block mb-1">Exam / Topic Details</label>
            <textarea
              value={aiExamDetails}
              onChange={(e) => setAiExamDetails(e.target.value)}
              placeholder="e.g. DGMS Mining Foreman exam - Mines Act 1952, Mine Rules 1955, safety regulations"
              rows={3}
              className="border p-2 rounded w-full"
              disabled={aiGenerating}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-sm">
              Image / PDF upload (optional) — AI inhi se questions banayega
            </label>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded p-4 text-sm text-gray-600 bg-white ${
                aiGenerating ? "opacity-50" : "cursor-pointer hover:border-purple-400"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!aiGenerating) handleAiFilesChange(e.dataTransfer.files);
              }}
            >
              <span>Click karke ya drag karke images / PDF daalo (max 10 files, 20 MB each)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="hidden"
                disabled={aiGenerating}
                onChange={(e) => {
                  handleAiFilesChange(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {aiFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {aiFiles.map((f, idx) => (
                  <li key={`${f.name}-${idx}`} className="flex items-center justify-between bg-white border rounded px-3 py-1.5 text-sm">
                    <span className="truncate">
                      {f.type === "application/pdf" ? "📄" : "🖼️"} {f.name}{" "}
                      <span className="text-gray-400">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </span>
                    <button
                      onClick={() => setAiFiles(aiFiles.filter((_, i) => i !== idx))}
                      disabled={aiGenerating}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-sm">Options (MCQ/MSQ)</label>
              <select
                value={aiNumOptions}
                onChange={(e) => setAiNumOptions(Number(e.target.value))}
                className="border p-2 rounded w-full"
                disabled={aiGenerating}
              >
                <option value={4}>4 options</option>
                <option value={5}>5 options</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-sm">Language</label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={aiGenerating}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-sm">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="border p-2 rounded w-full"
                disabled={aiGenerating}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-sm">Level (1-10)</label>
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(Number(e.target.value))}
                className="border p-2 rounded w-full"
                disabled={aiGenerating}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-sm">Question types, marks & negative marking</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Kitne questions</th>
                    <th className="text-left p-2">Marks / question</th>
                    <th className="text-left p-2">Negative / question</th>
                  </tr>
                </thead>
                <tbody>
                  {QUESTION_TYPES.map((type) => (
                    <tr key={type} className="border-t">
                      <td className="p-2 font-medium whitespace-nowrap">{QUESTION_TYPE_LABELS[type]}</td>
                      {["count", "marks", "negative_marks"].map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type="number"
                            min={0}
                            max={field === "count" ? 200 : undefined}
                            step={field === "count" ? 1 : 0.01}
                            value={aiTypeConfig[type][field]}
                            onChange={(e) => updateAiType(type, field, e.target.value)}
                            className="border p-1.5 rounded w-24"
                            disabled={aiGenerating}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr className="border-t">
                    <td className="p-2">Total</td>
                    <td className="p-2">{aiTotalQuestions} questions</td>
                    <td className="p-2" colSpan={2}>{aiTotalMarks} marks</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate hone ke baad bhi har question ke marks / negative marks neeche se badal sakte ho.
            </p>
          </div>

          {aiError && <p className="text-red-600 text-sm">{aiError}</p>}

          {aiGenerating && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-3 transition-all"
                  style={{ width: `${aiProgress.total ? (aiProgress.done / aiProgress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {aiStatus} {aiProgress.done} / {aiProgress.total} questions generated...
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateWithAI}
            disabled={aiGenerating}
            className="bg-purple-600 text-white px-5 py-2.5 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {aiGenerating ? "Generating..." : "Generate MCQ"}
          </button>
        </div>
      )}

      {/* ---------------- Add/Edit Question Form (Manual) ---------------- */}
      {mode === "manual" && (
      <div className="p-4 border rounded shadow" key={formKey}>
        <h2 className="text-xl font-bold mb-4">
          {editingQuestion ? `Edit Question ${editingQuestion.id}` : `Add Question for Test ${testId}`}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="font-semibold block mb-1 text-sm">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1 text-sm">Marks</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1 text-sm">Negative Marks</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <h3 className="font-semibold mb-2">Question Text</h3>
        <JoditEditor
          value={questionText}
          config={editorConfig}
          onBlur={(newContent) => setQuestionText(newContent)}
          onChange={() => {}} // prevent uncontrolled issues
          tabIndex={1}
        />

        <label className="font-semibold block mt-4 mb-1">Question Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setQuestionImage(e.target.files[0])}
          className="mb-2"
        />

        {questionType === "NAT" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-4">
            <div>
              <label className="font-semibold block mb-1">Correct Numerical Answer</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 12.5"
                value={natAnswer}
                onChange={(e) => setNatAnswer(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tolerance (±)</label>
              <input
                type="number"
                min={0}
                step="any"
                value={natTolerance}
                onChange={(e) => setNatTolerance(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <p className="text-xs text-gray-500 mt-1">0 = exact answer. e.g. 0.1 rakhoge to 12.4 se 12.6 tak sahi maana jayega.</p>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold mt-4">Options</h3>
            <p className="text-xs text-gray-500 mb-2">
              {questionType === "MCQ"
                ? "Sahi option ke aage wala radio button select karo (sirf ek)."
                : "Jitne bhi options sahi hain, sab ke checkbox tick karo."}
            </p>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <input
                  type={questionType === "MCQ" ? "radio" : "checkbox"}
                  name="correct-option"
                  checked={opt.is_correct}
                  onChange={() => toggleCorrect(idx)}
                  title="Correct answer"
                  className="w-5 h-5 accent-green-600"
                />
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt.option_text}
                  onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                  className={`border p-2 rounded flex-1 ${opt.is_correct ? "border-green-500 bg-green-50" : ""}`}
                />
                {opt.existing_image && !opt.option_image && (
                  <img src={opt.existing_image} alt="" className="h-8 rounded" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleOptionImageChange(idx, e.target.files[0])}
                  className="w-44 text-xs"
                />
                <button
                  onClick={() => removeOption(idx)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  disabled={options.length === 1}
                >
                  X
                </button>
              </div>
            ))}

            <button
              onClick={addOption}
              className="bg-green-500 text-white px-3 py-1 rounded mb-4"
            >
              Add Option
            </button>
          </>
        )}

        <textarea
          placeholder="About Answer / Explanation"
          value={aboutAnswer}
          onChange={(e) => setAboutAnswer(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          rows={4}
        />

        <label className="font-semibold block mb-1">About Answer Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAboutAnswerImage(e.target.files[0])}
          className="mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
            disabled={loading}
          >
            {loading ? "Submitting..." : editingQuestion ? "Update Question" : "Add Question"}
          </button>

          {editingQuestion && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
      )}

      {/* ---------------- Questions List ---------------- */}
      <div className="p-4 border rounded shadow space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">Existing Questions</h2>
          {questions.length > 0 && (
            <p className="text-sm text-gray-700">
              <strong>{questions.length}</strong> questions · <strong>{totalMarks(questions)}</strong> total marks
              <span className="text-gray-500">
                {" "}(MCQ {typeCounts.MCQ}, MSQ {typeCounts.MSQ}, NAT {typeCounts.NAT})
              </span>
            </p>
          )}
        </div>

        {questions.length > 0 && (
          <div className="border rounded p-3 bg-yellow-50/60">
            <p className="font-semibold text-sm mb-2">Marks / negative marks ek saath badlo</p>
            <div className="flex flex-wrap items-end gap-2 text-sm">
              <label>
                <span className="block text-xs text-gray-600">Question no. se</span>
                <input type="number" min={1} max={questions.length} value={bulkFrom}
                  onChange={(e) => setBulkFrom(e.target.value)} className="border p-1.5 rounded w-20" />
              </label>
              <label>
                <span className="block text-xs text-gray-600">tak</span>
                <input type="number" min={1} max={questions.length} value={bulkTo}
                  onChange={(e) => setBulkTo(e.target.value)} className="border p-1.5 rounded w-20" />
              </label>
              <label>
                <span className="block text-xs text-gray-600">Type</span>
                <select value={bulkType} onChange={(e) => setBulkType(e.target.value)} className="border p-1.5 rounded">
                  <option value="ALL">All</option>
                  {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                <span className="block text-xs text-gray-600">Marks</span>
                <input type="number" min={0} step={0.01} placeholder="same" value={bulkMarks}
                  onChange={(e) => setBulkMarks(e.target.value)} className="border p-1.5 rounded w-24" />
              </label>
              <label>
                <span className="block text-xs text-gray-600">Negative</span>
                <input type="number" min={0} step={0.01} placeholder="same" value={bulkNegative}
                  onChange={(e) => setBulkNegative(e.target.value)} className="border p-1.5 rounded w-24" />
              </label>
              <button
                onClick={handleBulkUpdate}
                disabled={bulkSaving}
                className="bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {bulkSaving ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>
        )}

        {fetchingQuestions ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          questions.map((q, index) => {
            const type = normalizeType(q.question_type);
            const correctList = type === "MSQ" ? parseMsqAnswer(q.answer?.correct_answer) : [q.answer?.correct_answer];
            return (
            <div key={q.id} className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold flex flex-1">
                  <span className="mr-2">{index + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: q.question_text }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(q)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this question?")) return;
                      try {
                        const res = await adminFetch(`/api/admin/questions/${q.id}`, { method: "DELETE" });
                        const data = await res.json();
                        if (data.success) {
                          alert("Question deleted!");
                          fetchQuestions();
                        } else {
                          alert("Delete failed: " + data.message);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Error deleting question");
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2 text-xs font-semibold">
                <span className={`px-2 py-0.5 rounded ${TYPE_BADGE_CLASSES[type]}`}>{type}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">+{q.marks ?? 1} marks</span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800">−{q.negative_marks ?? 0} negative</span>
              </div>

              {q.question_image && (
                <img src={q.question_image} alt="Question" className="mb-2 max-h-48 rounded" />
              )}

              {type !== "NAT" && (
                <div className="mb-2">
                  <p className="font-semibold">Options:</p>
                  <ul className="list-disc list-inside">
                    {q.options.map((opt) => (
                      <li key={opt.id} className={correctList.includes(opt.option_text) ? "text-green-700 font-medium" : ""}>
                        {opt.option_text}{" "}
                        {correctList.includes(opt.option_text) && "✓"}
                        {opt.option_image && (
                          <img
                            src={opt.option_image}
                            alt="Option"
                            className="inline max-h-10 ml-2 rounded"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {q.answer && (
                <div className="bg-gray-100 p-2 rounded">
                  <p>
                    <strong>Correct Answer:</strong> {formatCorrectAnswer(q)}
                  </p>
                  <p>
                    <strong>About Answer:</strong> {q.answer.about_answer}
                  </p>
                  {q.answer.about_answer_img && (
                    <div className="mt-2">
                      <Image
                        src={q.answer.about_answer_img}
                        alt="About Answer Image"
                        width={400}
                        height={300}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
