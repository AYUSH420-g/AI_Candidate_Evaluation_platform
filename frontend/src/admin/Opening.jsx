import axios from "axios";
import Sidebar from "../components/sidebar.jsx";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function Admin() {
  const [projName, setProjName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [receivedRecruiter, setReceivedRecruiter] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState([]);
  const [selectedRecruiterObjects, setSelectedRecruiterObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  async function handleOpening(e) {
    e.preventDefault();

    if (selectedRecruiterIds.length === 0) {
      alert("Please select at least one recruiter.");
      return;
    }
    if (!file) {
      alert("Please upload a job description PDF.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("jobDesc", file);
      formData.append("projectName", projName);
      formData.append("listOfRecruiters", JSON.stringify(selectedRecruiterIds));
      formData.append("token", token);

      await axios.post("http://localhost:5010/admin/assign-project", formData);

      setSuccessMsg("Project assigned successfully.");
      setTimeout(() => setSuccessMsg(""), 3200);

      setProjName("");
      setFile(null);
      setSearchQuery("");
      setSelectedRecruiterIds([]);
      setSelectedRecruiterObjects([]);
    } catch (err) {
      console.error(err);
      alert("Failed to submit opening.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setReceivedRecruiter([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get("http://localhost:5010/admin/getrecruiter", {
          params: { name: searchQuery },
        });
        setReceivedRecruiter(res.data.recruiters || res.data);
      } catch (e) {
        console.log(e);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const removeRecruiter = (id) => {
    setSelectedRecruiterIds((prev) => prev.filter((r) => r !== id));
    setSelectedRecruiterObjects((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 p-8">
        <h1 className="mb-1 text-2xl font-medium text-gray-900">New opening</h1>
        <p className="mb-7 text-sm text-gray-400">
          Assign a job opening to recruiters.
        </p>

        {successMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M5 8l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {successMsg}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <form className="flex flex-col gap-5" onSubmit={handleOpening}>

            {/* Project name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
                Project name
              </label>
              <input
                type="text"
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
                required
              />
            </div>

            {/* Recruiter search */}
            <div className="relative">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
                Recruiters
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />

              {receivedRecruiter.length > 0 && (
                <ul className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                  {receivedRecruiter.map((recruiter) => (
                    <li key={recruiter._id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedRecruiterIds.includes(recruiter._id)) {
                            setSelectedRecruiterIds((prev) => [
                              ...prev,
                              recruiter._id,
                            ]);
                            setSelectedRecruiterObjects((prev) => [
                              ...prev,
                              recruiter,
                            ]);
                          }
                          setSearchQuery("");
                          setReceivedRecruiter([]);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <span className="font-medium">{recruiter.Name}</span>
                        <span className="ml-1.5 text-gray-400">
                          {recruiter.Email}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Selected recruiter chips */}
              {selectedRecruiterObjects.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {selectedRecruiterObjects.map((rec) => (
                    <span
                      key={rec._id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {rec.Name}
                      <button
                        type="button"
                        onClick={() => removeRecruiter(rec._id)}
                        className="flex items-center text-gray-400 transition-colors hover:text-gray-700"
                        aria-label={`Remove ${rec.Name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Job description upload */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
                Job description
              </label>
              <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center transition-colors hover:bg-gray-100">
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <svg
                  className="mb-2 h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                {file ? (
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      Click or drag a PDF to upload
                    </p>
                    <p className="mt-1 text-xs text-gray-400">PDF only</p>
                  </>
                )}
              </label>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    Sending…
                  </>
                ) : (
                  "Send to recruiters"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Admin;