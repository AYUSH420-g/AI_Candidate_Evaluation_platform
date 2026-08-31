import { useState, useRef } from "react";
import axios from "axios";
import RecruiterSidebar from "../components/recruiterSidebar";
import {
  FileCheck,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  SpellCheck,
  LayoutTemplate,
  Target,
  Zap
} from "lucide-react";

function AtsChecker() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("improvements"); // improvements, spelling, checklist, skills
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== "application/pdf" && !selected.name.endsWith(".pdf")) {
        setErrorMsg("Please select a valid PDF file.");
        return;
      }
      setFile(selected);
      setErrorMsg("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type !== "application/pdf" && !dropped.name.endsWith(".pdf")) {
        setErrorMsg("Only PDF resumes are supported.");
        return;
      }
      setFile(dropped);
      setErrorMsg("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMsg("Please upload a PDF resume first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setLoadingStep("Extracting text and structure...");

    const stepTimer1 = setTimeout(() => {
      setLoadingStep("Analyzing spelling, grammar & style...");
    }, 800);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep("Evaluating ATS compliance & suggestions...");
    }, 1600);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }

      const res = await axios.post("http://localhost:5010/recruiter/ats-check", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.analysis) {
        setResult(res.data.analysis);
      } else {
        setErrorMsg("Unexpected response format from server.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
        "Failed to analyze resume. Please ensure the backend server is running."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
    setErrorMsg("");
    setJobDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 stroke-emerald-500 bg-emerald-50 border-emerald-200";
    if (score >= 65) return "text-blue-600 stroke-blue-500 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-amber-600 stroke-amber-500 bg-amber-50 border-amber-200";
    return "text-rose-600 stroke-rose-500 bg-rose-50 border-rose-200";
  };

  return (
    <>
      <RecruiterSidebar />

      <div className="ml-64 min-h-screen bg-gray-50 p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                <FileCheck size={18} />
              </span>
              <h1 className="text-2xl font-semibold text-gray-900">ATS Resume Checker</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Audit candidate resumes for ATS readability, spelling & grammar accuracy, section structure, and impact.
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={resetAnalysis}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <RefreshCw size={14} />
                Scan Another
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
              >
                <Printer size={14} />
                Print Report
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-medium">Error evaluating resume</p>
              <p className="mt-0.5 text-rose-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Upload Card (When no result yet) */}
        {!result && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-10 text-center transition hover:border-gray-900 hover:bg-gray-50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 group-hover:scale-105 transition">
                  <UploadCloud className="h-7 w-7 text-gray-700" />
                </div>

                <p className="mt-4 text-base font-medium text-gray-900">
                  {file ? file.name : "Click to upload or drag & drop resume"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • PDF`
                    : "Supported format: PDF (Standard text-based PDF recommended)"}
                </p>

                {file && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} />
                    Ready for analysis
                  </span>
                )}
              </div>

              {/* Optional Job Description Toggle */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  {showJdInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>Target job description / context (Optional)</span>
                </button>

                {showJdInput && (
                  <div className="mt-2.5">
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job title, required skills, or job description to tailor the ATS audit..."
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{loadingStep || "Scanning resume..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Scan & Calculate ATS Score</span>
                    </>
                  )}
                </button>
              </div>

              {/* ATS Feature Highlights */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <SpellCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">Spelling & Grammar</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Detects typos, passive voice, and phrasing issues.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <LayoutTemplate size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">ATS Structure & Format</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Checks contact info, section headers, and bulleting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">Impact & Keywords</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Extracts skills, metrics (%, $), and power verbs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6">
            {/* Top Score Summary Banner */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  {/* Circular Score Gauge */}
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-gray-100"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={getScoreColor(result.overallScore).split(" ")[1]}
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * result.overallScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold tracking-tight text-gray-900">
                        {result.overallScore}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                        out of 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {result.candidateName}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          result.overallScore >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : result.overallScore >= 65
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : result.overallScore >= 50
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {result.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Word Count: <span className="font-medium text-gray-700">{result.wordCount} words</span> •{" "}
                      Spelling & Grammar Issues:{" "}
                      <span className="font-medium text-gray-700">
                        {result.scores.spellingGrammar.errorsCount}
                      </span>{" "}
                      • Skills Extracted:{" "}
                      <span className="font-medium text-gray-700">
                        {result.scores.skillsKeywords.skillsCount}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Evaluated for modern ATS platforms (Workday, Greenhouse, Lever, Taleo, iCIMS).
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <button
                    onClick={resetAnalysis}
                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition"
                  >
                    <UploadCloud size={16} />
                    Upload Different Resume
                  </button>
                </div>
              </div>

              {/* AI Executive Feedback Quote */}
              {result.aiExecutiveFeedback && (
                <div className="mt-6 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/60 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-amber-400">
                      <Sparkles size={14} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Executive ATS Reviewer Insight
                      </p>
                      <p className="mt-1 text-sm text-gray-800 leading-relaxed">
                        {result.aiExecutiveFeedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Score Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Spelling & Grammar */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Spelling & Grammar
                  </span>
                  <SpellCheck size={16} className="text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {result.scores.spellingGrammar.score}
                  </span>
                  <span className="text-xs text-gray-400">/ 25 pts</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.scores.spellingGrammar.score >= 20 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.scores.spellingGrammar.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span>{result.scores.spellingGrammar.status}</span>
                  <span>{result.scores.spellingGrammar.errorsCount} issues found</span>
                </p>
              </div>

              {/* 2. ATS Structure */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    ATS Structure
                  </span>
                  <LayoutTemplate size={16} className="text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {result.scores.structureFormatting.score}
                  </span>
                  <span className="text-xs text-gray-400">/ 25 pts</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.scores.structureFormatting.score >= 20 ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${result.scores.structureFormatting.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span>{result.scores.structureFormatting.status}</span>
                  <span>
                    {result.scores.structureFormatting.missingSections.length === 0
                      ? "All sections present"
                      : `${result.scores.structureFormatting.missingSections.length} missing`}
                  </span>
                </p>
              </div>

              {/* 3. Content & Impact */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Impact & Verbs
                  </span>
                  <Zap size={16} className="text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {result.scores.impactAction.score}
                  </span>
                  <span className="text-xs text-gray-400">/ 25 pts</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.scores.impactAction.score >= 18 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.scores.impactAction.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span>{result.scores.impactAction.status}</span>
                  <span>{result.scores.impactAction.metricsCount} metrics detected</span>
                </p>
              </div>

              {/* 4. Skills & Keywords */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Skills & Keywords
                  </span>
                  <Target size={16} className="text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {result.scores.skillsKeywords.score}
                  </span>
                  <span className="text-xs text-gray-400">/ 25 pts</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.scores.skillsKeywords.score >= 18 ? "bg-emerald-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${result.scores.skillsKeywords.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span>{result.scores.skillsKeywords.status}</span>
                  <span>{result.scores.skillsKeywords.skillsCount} skills recognized</span>
                </p>
              </div>
            </div>

            {/* In-Depth Tabs */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-gray-200 bg-gray-50/70 px-4">
                <button
                  onClick={() => setActiveTab("improvements")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    activeTab === "improvements"
                      ? "border-gray-900 text-gray-900 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Sparkles size={16} />
                  <span>Improvement Suggestions</span>
                  <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {(result.suggestions.critical?.length || 0) +
                      (result.suggestions.recommended?.length || 0) +
                      (result.suggestions.optimization?.length || 0)}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("spelling")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    activeTab === "spelling"
                      ? "border-gray-900 text-gray-900 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <SpellCheck size={16} />
                  <span>Spelling & Grammar</span>
                  {result.scores.spellingGrammar.errorsCount > 0 && (
                    <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      {result.scores.spellingGrammar.errorsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    activeTab === "checklist"
                      ? "border-gray-900 text-gray-900 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutTemplate size={16} />
                  <span>ATS Essentials Checklist</span>
                </button>

                <button
                  onClick={() => setActiveTab("skills")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    activeTab === "skills"
                      ? "border-gray-900 text-gray-900 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Target size={16} />
                  <span>Extracted Skills & Verbs</span>
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="p-6">
                {/* 1. Improvements Tab */}
                {activeTab === "improvements" && (
                  <div className="space-y-6">
                    {/* Critical Priorities */}
                    {result.suggestions.critical?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <XCircle size={14} />
                          </span>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-800">
                            Critical Fixes (High ATS Filter Risk)
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {result.suggestions.critical.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-rose-900">{item.title}</p>
                                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                                  {item.category}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-rose-700 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Improvements */}
                    {result.suggestions.recommended?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertTriangle size={14} />
                          </span>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800">
                            Recommended Improvements (Boost Competitiveness)
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {result.suggestions.recommended.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-amber-900">{item.title}</p>
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                  {item.category}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optimization Tips */}
                    {result.suggestions.optimization?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <HelpCircle size={14} />
                          </span>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-800">
                            Optimization & Polish Tips
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {result.suggestions.optimization.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-blue-900">{item.title}</p>
                                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  {item.category}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!result.suggestions.critical?.length &&
                      !result.suggestions.recommended?.length &&
                      !result.suggestions.optimization?.length) && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                        <p className="text-base font-medium text-emerald-900">
                          Excellent! No major ATS issues detected.
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          This resume adheres to standard ATS structure, clear formatting, and strong keyword density.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Spelling & Grammar Tab */}
                {activeTab === "spelling" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Detected Spelling & Typographical Errors
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Misspellings undermine professional credibility and prevent keyword recognition by ATS parsers.
                      </p>

                      {result.issues?.spellingAndGrammar?.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Mistake Found</th>
                                <th className="px-4 py-3">Recommended Fix</th>
                                <th className="px-4 py-3">Resume Context</th>
                                <th className="px-4 py-3">Explanation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {result.issues.spellingAndGrammar.map((issue, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3">
                                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-medium text-rose-700 border border-rose-200">
                                      {issue.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-rose-600 line-through">
                                    {issue.found}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-emerald-600">
                                    {issue.fix}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-gray-600 max-w-xs truncate">
                                    {issue.context}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500">
                                    {issue.explanation}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>No critical spelling errors detected!</span>
                        </div>
                      )}
                    </div>

                    {/* Passive Voice / Weak Phrasing Section */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Passive Voice & Weak Phrasing
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Replacing passive phrases with strong action verbs dramatically increases impact.
                      </p>

                      {result.issues?.passivePhrases?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.issues.passivePhrases.map((phrase, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-gray-200 bg-white p-3.5 text-xs shadow-sm"
                            >
                              <div className="flex items-center justify-between text-gray-400 mb-1.5">
                                <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  "{phrase.found}"
                                </span>
                                <ArrowRight size={12} />
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {phrase.fix}
                                </span>
                              </div>
                              <p className="text-gray-500 mt-1">{phrase.explanation}</p>
                              <p className="mt-1 font-mono text-[11px] text-gray-400 truncate">
                                {phrase.context}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">
                          No excessive passive voice patterns detected.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. ATS Essentials Checklist Tab */}
                {activeTab === "checklist" && (
                  <div className="space-y-6">
                    {/* Contact Checklist */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Header & Contact Information Checklist
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        ATS platforms require standard, accessible contact data to populate candidate profiles automatically.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.checklist?.contacts?.map((c, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
                              c.passed
                                ? "border-emerald-200 bg-emerald-50/40"
                                : "border-rose-200 bg-rose-50/40"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {c.passed ? (
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle size={16} className="text-rose-600 shrink-0" />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">{c.item}</p>
                                <p className="text-gray-500 text-[11px] truncate max-w-xs">{c.value}</p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                c.passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {c.passed ? "Detected" : "Missing"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standard Section Headers Checklist */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Standard Section Headers Checklist
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        ATS software searches for standard headings. Non-standard titles (e.g. "Where I've Been") can cause data loss.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {result.checklist?.sections?.map((sec, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                              sec.found
                                ? "border-emerald-200 bg-emerald-50/40"
                                : "border-amber-200 bg-amber-50/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {sec.found ? (
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                              )}
                              <span className="font-medium text-gray-900">{sec.section}</span>
                            </div>
                            <span
                              className={`text-[10px] font-medium ${
                                sec.found ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {sec.found ? "Found" : "Not Found"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Extracted Skills & Verbs Tab */}
                {activeTab === "skills" && (
                  <div className="space-y-6">
                    {/* Technical Skills Extracted */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Identified Technical Keywords ({result.extracted?.techSkills?.length || 0})
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        These are the exact skills that an ATS parser indexed from the resume text.
                      </p>

                      {result.extracted?.techSkills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.extracted.techSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No common technical skills recognized.</p>
                      )}
                    </div>

                    {/* Soft Skills */}
                    {result.extracted?.softSkills?.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Recognized Competencies & Methodologies ({result.extracted.softSkills.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.extracted.softSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Verbs Used */}
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Strong Power Action Verbs Identified ({result.extracted?.actionVerbsUsed?.length || 0})
                      </h3>
                      {result.extracted?.actionVerbsUsed?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.extracted.actionVerbsUsed.map((verb, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize"
                            >
                              {verb}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700">
                          Low count of high-impact action verbs. Recommend starting experience bullets with active verbs like 'Architected', 'Spearheaded', 'Optimized'.
                        </p>
                      )}
                    </div>

                    {/* Sample Metrics Extracted */}
                    {result.extracted?.metricsFound?.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Quantifiable Impact Indicators Detected ({result.extracted.metricsFound.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.extracted.metricsFound.map((m, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-800"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AtsChecker;
