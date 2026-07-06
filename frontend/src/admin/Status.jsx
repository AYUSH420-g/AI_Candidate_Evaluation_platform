import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";


function Status() {
  let count=1;
  const [projects, setProjects] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5010/admin/getstatus");
        setProjects(res.data.message || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProjects();
  }, []);

  const handleView = async (project) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5010/admin/displaystatus", {
        params: { id: project._id },
      });
      setCandidates(res.data.response || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (candidate) => {
    try {
      setAcceptLoading(true);
      const res = await axios.post("http://localhost:5010/admin/genquestion", {
        candidateId: candidate.candidateId,
      });
      console.log(res.data);
      setSelectedCandidate(null);
    } catch (err) {
      console.log(err);
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async (candidate) => {
    try {
      const res = await axios.patch(
        `http://localhost:5010/admin/rejectcandidate/${candidate.candidateId}`
      );
      alert("Candidate rejected");
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggle = (project) => {
    if (expandedProject === project._id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(project._id);
      handleView(project);
    }
  };

  const isRejected =
    selectedCandidate?.recommendation === "Reject" ||
    selectedCandidate?.status === "Rejected";

  const difficultyLabel = { easy: "Easy", medium: "Medium", hard: "Hard" };

  return (
    <>
      <Sidebar />

      <div className="ml-64 min-h-screen bg-gray-50 p-8">
        <h1 className="mb-7 text-2xl font-medium text-gray-900">
          Recruitment dashboard
        </h1>

        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No projects found
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  onClick={() => toggle(project)}
                >
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-gray-400">
                      Opening
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {project.projectName}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {expandedProject === project._id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </span>
                </button>

                {expandedProject === project._id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {loading ? (
                      <p className="py-6 text-center text-sm text-gray-400">
                        Loading candidates…
                      </p>
                    ) : candidates.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-400">
                        No candidates found
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 p-4">
                        {candidates.map((candidate) => (
                          <div
                            key={candidate._id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                {candidate.candidateName?.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {candidate.candidateName}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                  candidate.status === "Rejected"
                                    ? "border-red-200 bg-red-50 text-red-600"
                                    : "border-green-200 bg-green-50 text-green-700"
                                }`}
                              >
                                {candidate.status}
                              </span>
                              <button
                                onClick={() => setSelectedCandidate(candidate)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCandidate(null);
          }}
        >
          <div
            className="flex w-full max-w-lg flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
            style={{ maxHeight: "90vh" }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-gray-400">
                  Candidate
                </p>
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedCandidate.candidateName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">

              <div
                className={`mb-5 grid gap-3 ${
                  selectedCandidate.testSubmitted ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
                    Resume match
                  </p>
                  <p className="text-3xl font-medium text-gray-900">
                    {Math.round(selectedCandidate.overallScore)}
                    <span className="text-lg text-gray-400">%</span>
                  </p>
                </div>

                {selectedCandidate.testSubmitted && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
                      Interview score
                    </p>
                    <p className="text-3xl font-medium text-gray-900">
                      {selectedCandidate.testScore}
                      <span className="text-lg text-gray-400">
                        /{selectedCandidate.totalQuestions}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {Math.round(
                        (selectedCandidate.testScore /
                          selectedCandidate.totalQuestions) *
                          100
                      )}
                      % correct
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-400">
                  Matched skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.matchedSkills?.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-400">
                  Missing skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.missingSkills?.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs text-red-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {
                selectedCandidate.testSubmitted && (
                  <div className="mb-5">
                    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-400">
                      Interview review
                    </p>
                    <div className="flex flex-col gap-3">
                      {["easy", "medium", "hard"].map((level) =>
                        selectedCandidate.Questions?.[level]?.map((q) => (
                          <div
                            key={q._id}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-gray-900">
                                {count++}. {q.question}
                              </p>
                              <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-400">
                                {difficultyLabel[level]}
                              </span>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col gap-1.5">
                              {Object.entries(q.options || {}).map(([key, value]) => {
                                const isCorrect = key === q.correctAnswer;
                                const isSelected = key === q.selectedAnswer;
                                const isWrong = isSelected && !isCorrect;

                                return (
                                  <div
                                    key={key}
                                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs ${
                                      isCorrect
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : isWrong
                                        ? "border-red-200 bg-red-50 text-red-600"
                                        : "border-gray-200 bg-white text-gray-500"
                                    }`}
                                  >
                                    <span
                                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${
                                        isCorrect
                                          ? "border-green-400 bg-green-100 text-green-700"
                                          : isWrong
                                          ? "border-red-400 bg-red-100 text-red-600"
                                          : "border-gray-300 bg-white text-gray-400"
                                      }`}
                                    >
                                      {key}
                                    </span>
                                    {value}
                                    {isCorrect && (
                                      <span className="ml-auto text-[10px] font-medium text-green-600">
                                        Correct
                                      </span>
                                    )}
                                    {isWrong && (
                                      <span className="ml-auto text-[10px] font-medium text-red-500">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {!q.selectedAnswer && (
                              <p className="mt-2 text-xs text-gray-400">
                                No answer selected
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="shrink-0 border-t border-gray-100 px-6 py-4">
              {isRejected ? (
                <span className="inline-block rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-600">
                  Rejected
                </span>
              ) : (
                <>
                  {selectedCandidate.link && (
                    <p className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-xs font-medium text-yellow-700">
                      Interview questions already generated for this candidate.
                    </p>
                  )}

                  <div
                    className={`flex gap-2 ${
                      selectedCandidate.link
                        ? "pointer-events-none opacity-40"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => handleAccept(selectedCandidate)}
                      disabled={selectedCandidate.link || acceptLoading}
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {acceptLoading ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Accepting…
                        </>
                      ) : (
                        "Accept"
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(selectedCandidate)}
                      disabled={selectedCandidate.link}
                      className="rounded-lg border border-red-200 bg-red-50 px-5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Status;