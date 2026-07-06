import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar.jsx";
import { Bot, Send, Check, X } from "lucide-react";

function AIOpening() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setError("");
      setAiData(null);
      setSuccessMsg("");

      const res = await axios.post("http://localhost:5010/admin/ai-generate-opening", {
        prompt,
        token
      });

      setAiData(res.data.jobData);
    } catch (err) {
      console.error(err);
      setError("Failed to generate opening from prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!aiData) return;

    try {
      setCreatingLoading(true);
      setError("");
      
      await axios.post("http://localhost:5010/admin/ai-create-opening", {
        jobData: aiData,
        token
      });

      setSuccessMsg("Opening created and assigned to all recruiters successfully.");
      setAiData(null);
      setPrompt("");
      
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create opening. Please try again.");
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleCancel = () => {
    setAiData(null);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <h1 className="mb-1 text-2xl font-medium text-gray-900 flex items-center gap-2">
          {/* <Bot size={28} className="text-indigo-600" /> */}
          AI Opening Generator
        </h1>
        <p className="mb-7 text-sm text-gray-400">
          Describe the job role in natural language and our AI will instantly generate and assign the opening.
        </p>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            <Check size={16} className="shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="flex flex-col gap-6 max-w-4xl">
          {/* Prompt Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                What kind of opening do you want to create?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. We need a Senior React Developer with 5 years of experience. Must know Next.js, Tailwind, and Node. Good to have Docker."
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                required
                disabled={loading || creatingLoading || aiData !== null}
              />
              {!aiData && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Generate Opening
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {aiData && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center gap-2 text-indigo-700">
                <Bot size={20} />
                <h2 className="text-lg font-semibold">Generated Structured Opening</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">Job Title</p>
                    <p className="text-base font-medium text-gray-900">{aiData.job_title || "N/A"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">Seniority</p>
                    <p className="text-base font-medium text-gray-900">{aiData.seniority_level}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">Experience</p>
                    <p className="text-base font-medium text-gray-900">
                      {aiData.experience_required_years !== null ? `${aiData.experience_required_years} years` : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">Summary</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{aiData.brief_summary || "No summary generated."}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-indigo-100 pt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Mandatory Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiData.mandatory_skills?.length ? (
                      aiData.mandatory_skills.map((skill, i) => (
                        <span key={i} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Preferred Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiData.preferred_skills?.length ? (
                      aiData.preferred_skills.map((skill, i) => (
                        <span key={i} className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Soft Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiData.soft_skills?.length ? (
                      aiData.soft_skills.map((skill, i) => (
                        <span key={i} className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg bg-white p-5 border border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-900">
                  Do you want to continue with creating this opening?
                </p>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={handleCancel}
                    disabled={creatingLoading}
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creatingLoading}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingLoading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Yes, Create
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIOpening;
