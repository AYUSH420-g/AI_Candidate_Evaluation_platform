import { useEffect, useState } from "react";
import RecruiterSidebar from "../components/recruiterSidebar.jsx";
import axios from "axios";
import { Users } from "lucide-react";

function Project() {
  const [assignedOpenings, setAssignedOpenings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [cv, setCv] = useState(null);
  const [projectId, setProjectId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openProject, setOpenProject] = useState(null);
  const [candidateMap, setCandidateMap] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleViewCandidates = async (pid) => {
    if (openProject === pid) {
      setOpenProject(null);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5010/recruiter/getCandidates", {
        params: { projectId: pid },
      });
      setCandidateMap((prev) => ({ ...prev, [pid]: res.data.candidates }));
      setOpenProject(pid);
    } catch (err) {
      console.log(err);
    }
  };

  async function analyseCandidate(c_id) {
    try {
      const res = await axios.post("http://localhost:5010/recruiter/analyse", {
        id: c_id,
        projectId,
      });
      if (res.data) alert("success");
    } catch (err) {
      console.log(err);
    }
  }

  async function handleCandidate() {
    if (!cv) {
      alert("CV is required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("candidateCv", cv);
      formData.append("projectId", projectId);

      const res = await axios.post(
        "http://localhost:5010/recruiter/addCandidate",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setSuccessMsg("Candidate added successfully.");
        setModalOpen(false);
        setCv(null);
        analyseCandidate(res.data.candidate._id);
        setTimeout(() => setSuccessMsg(""), 3200);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5010/recruiter/getOpenings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignedOpenings(res.data.tasks);
      } catch (err) {
        console.log(err);
      }
    };
    getProjects();
  }, [token]);

  return (
    <>
      <RecruiterSidebar />

      <div className="ml-64 min-h-screen bg-gray-50 p-8">
        <h1 className="mb-6 text-2xl font-medium text-gray-900">Assigned projects</h1>

        {successMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {successMsg}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {assignedOpenings.map((project) => (
            <div
              key={project._id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
            >
              {/* Project row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
                    Project
                  </p>
                  <h2 className="mb-1 text-base font-medium text-gray-900">
                    {project.projectName}
                  </h2>
                  <p className="truncate text-sm text-gray-500 max-w-lg">
                    {project.jobDescription}
                  </p>
                </div>

                <div className="ml-6 flex shrink-0 items-center gap-2">
                  <button
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                    onClick={() => {
                      setProjectId(project._id);
                      setModalOpen(true);
                    }}
                  >
                    Add candidate
                  </button>

                  <button
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                      openProject === project._id
                        ? "border-gray-400 bg-gray-100 text-gray-900"
                        : "border-gray-200 bg-transparent text-gray-400 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => handleViewCandidates(project._id)}
                    aria-label="View candidates"
                  >
                    <Users size={16} />
                  </button>
                </div>
              </div>

              {/* Candidates panel */}
              {openProject === project._id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-400">
                    Candidates
                  </p>

                  {candidateMap[project._id]?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {candidateMap[project._id].map((candidate) => (
                        <div
                          key={candidate._id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {candidate.candidateName}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {candidate.link
                                ? `Interview: localhost:3000/interview/${candidate.link_url}`
                                : "Interview link pending"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              candidate.status === "Screening" ||
                              candidate.status === "Interview"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {candidate.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-400">
                      No candidates added yet
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Add candidate</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                ×
              </button>
            </div>

            {/* File drop zone */}
            <label className="group relative mb-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center transition-colors hover:bg-gray-100">
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setCv(e.target.files[0])}
                accept=".pdf"
              />
              <svg className="mb-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {cv ? (
                <p className="text-sm font-medium text-gray-700">{cv.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Click or drag a CV to upload</p>
                  <p className="mt-1 text-xs text-gray-400">PDF</p>
                </>
              )}
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCandidate}
                disabled={loading || !cv}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save candidate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Project;