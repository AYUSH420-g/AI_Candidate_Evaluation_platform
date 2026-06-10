import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";

function Status() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5010/admin/getstatus"
                );

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
            setSelectedProject(project);

            const res = await axios.get(
                "http://localhost:5010/admin/displaystatus",
                {
                    params: {
                        id: project._id,
                    },
                }
            );

            setCandidates(res.data.response || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (candidate) => {
        console.log("Accepted:", candidate);
        // API call here
    };

    const handleReject = (candidate) => {
        console.log("Rejected:", candidate);
        // API call here
    };

    return (
        <>
            <Sidebar />

            <div className="ml-64 min-h-screen bg-gray-100 p-6">
                <h1 className="mb-6 text-3xl font-semibold">
                    Recruitment Dashboard
                </h1>

                <div className="grid grid-cols-12 gap-6">
                    {/* LEFT SIDE PROJECTS */}
                    <div className="col-span-4">
                        <div className="rounded-xl bg-white p-5 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold">
                                Projects
                            </h2>

                            {projects.length === 0 ? (
                                <p>No projects found</p>
                            ) : (
                                projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="mb-3 flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {project.projectName}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                handleView(project)
                                            }
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE CANDIDATES */}
                    <div className="col-span-8">
                        {!selectedProject ? (
                            <div className="rounded-xl bg-white p-10 text-center shadow-md">
                                <h2 className="text-xl text-gray-500">
                                    Select a project to view candidates
                                </h2>
                            </div>
                        ) : (
                            <>
                                <div className="mb-5 rounded-xl bg-white p-5 shadow-md">
                                    <h2 className="text-2xl font-semibold">
                                        {selectedProject.projectName}
                                    </h2>
                                </div>

                                {loading ? (
                                    <div className="rounded-xl bg-white p-10 text-center shadow-md">
                                        Loading candidates...
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {candidates.length === 0 ? (
                                            <div className="rounded-xl bg-white p-6 shadow-md">
                                                No candidates found
                                            </div>
                                        ) : (
                                            candidates.map((candidate) => (
                                                <div
                                                    key={candidate._id}
                                                    className="rounded-xl bg-white p-5 shadow-md"
                                                >
                                                    <h3 className="mb-3 text-lg font-semibold">
                                                        {
                                                            candidate.candidateName
                                                        }
                                                    </h3>

                                                    <div className="mb-3">
                                                        <p className="font-medium text-green-700">
                                                            Matched Skills
                                                        </p>

                                                        <p className="text-sm text-gray-700">
                                                            {candidate.matchedSkills
                                                                ?.length > 0
                                                                ? candidate.matchedSkills.join(
                                                                      ", "
                                                                  )
                                                                : "No matched skills"}
                                                        </p>
                                                    </div>

                                                    <div className="mb-3">
                                                        <p className="font-medium text-red-700">
                                                            Missing Skills
                                                        </p>

                                                        <p className="text-sm text-gray-700">
                                                            {candidate.missingSkills
                                                                ?.length > 0
                                                                ? candidate.missingSkills.join(
                                                                      ", "
                                                                  )
                                                                : "No missing skills"}
                                                        </p>
                                                    </div>

                                                    <p className="mb-4 text-lg font-bold text-blue-600">
                                                        Score:{" "}
                                                        {Math.round(
                                                            candidate.overallScore
                                                        )}
                                                        %
                                                    </p>

                                                    <div className="flex gap-3">
                                                        {candidate.overallScore >=
                                                            35 && (
                                                            <button
                                                                onClick={() =>
                                                                    handleAccept(
                                                                        candidate
                                                                    )
                                                                }
                                                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                                            >
                                                                Accept
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    candidate
                                                                )
                                                            }
                                                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Status;