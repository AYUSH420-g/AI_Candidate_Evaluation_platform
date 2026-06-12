import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";

function Status() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedProject, setExpandedProject] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
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
            // console.log(res.data.response[0].recommendation);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (candidate) => {
        const id=candidate.candidateId;
        // console.log("from fe",id);
        try{

            const res=await axios.post("http://localhost:5010/admin/genquestion",
                {
                    candidateId:id
                }

            );
            console.log(res.data);
        }
        catch(err)
        {
            console.log(err);
        }
    };

    const handleReject = async(candidate) => {

        try{
            const res=await axios.patch(`http://localhost:5010/admin/rejectcandidate/${candidate.candidateId}`);
                
             alert("Candidate Rejected");
             console.log(res.data);
            
        }
        catch(err)
        {
            console.log(err);
        }

    };

    return (
        <>
            <Sidebar />

            <div className="ml-64 min-h-screen bg-gray-100 p-6">
    <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Recruitment Dashboard
    </h1>

    <div className="grid grid-cols-12 gap-6">

            <div className="col-span-10">
    <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Job Openings
        </h2>

        {projects.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                No projects found
            </div>
        ) : (
            projects.map((project) => (
                <div
                    key={project._id}
                    className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all"
                >
                    {/* Project Header */}
                    <button
                        className="flex w-full items-center justify-between px-6 py-5 transition hover:bg-gray-100"
                        onClick={() => {
                            setExpandedProject(
                                expandedProject === project._id
                                    ? null
                                    : project._id
                            );

                            if (
                                expandedProject !== project._id
                            ) {
                                handleView(project);
                            }
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                                💼
                            </div>

                            <div className="text-left">
                                <p className="text-lg font-semibold text-gray-800">
                                    {project.projectName}
                                </p>

                                <p className="text-sm text-gray-400">
                                    Click to view candidates
                                </p>
                            </div>
                        </div>

                        <div className="text-xl font-bold text-gray-500">
                            {expandedProject === project._id
                                ? "−"
                                : "+"}
                        </div>
                    </button>

                    {/* Candidates */}
                    {expandedProject === project._id && (
                        <div className="border-t bg-white">
                            {loading ? (
                                <div className="p-6 text-center text-gray-500">
                                    Loading candidates...
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No candidates found
                                </div>
                            ) : (
                                candidates.map((candidate) => (
                                    <div
                                        key={candidate._id}
                                        className="flex items-center justify-between border-b px-6 py-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
                                                {candidate.candidateName
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {
                                                        candidate.candidateName
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                          
                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                        candidate.status === "Rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-green-100 text-green-700"
                                                    }`}
                                                    >
                                                    {candidate.status}
                                                </span>
                                             
                                            
                                            <button
                                                onClick={() =>
                                                    setSelectedCandidate(
                                                        candidate
                                                    )
                                                }
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                            >
                                                 View
                                            </button>
                                        </div>
                                    </div>
                                 ))
                                 )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

            {selectedCandidate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-[650px] rounded-3xl bg-white p-8 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-3xl font-bold text-gray-800">
                            {selectedCandidate.candidateName}
                        </h2>

                        <button
                            onClick={() =>
                                setSelectedCandidate(null)
                            }
                            className="text-3xl text-gray-400 hover:text-red-500"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-6 rounded-xl bg-blue-50 p-5">
                        <p className="text-lg font-semibold text-blue-400">
                            Resume Match Score
                        </p>

                        <p className="mt-2 text-4xl font-bold text-blue-500">
                            {Math.round(
                                selectedCandidate.overallScore
                            )}
                            %
                        </p>
                    </div>

                    <div className="mb-5">
                        <h3 className="mb-3 text-lg font-semibold text-green-700">
                            Matched Skills
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {selectedCandidate.matchedSkills?.map(
                                (skill, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-green-100 px-3 py-2 text-sm text-green-700"
                                    >
                                        {skill}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="mb-3 text-lg font-semibold text-red-700">
                            Missing Skills
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {selectedCandidate.missingSkills?.map(
                                (skill, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-red-50 px-3 py-2 text-sm text-red-500"
                                    >
                                        {skill}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {selectedCandidate.recommendation !== "Reject" && selectedCandidate.status !== "Rejected" ? (
                    <div className="flex gap-4">
                        <button
                            onClick={() =>
                                handleAccept(selectedCandidate)
                            }
                            className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
                        >
                            ✓ Accept
                        </button>

                        <button
                            onClick={() =>
                                handleReject(selectedCandidate)
                            }
                            className="rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
                        >
                            ✕ Reject
                        </button>

                        
                    </div>
                    ):(
                             <span className="rounded-xl bg-red-200 px-4 py-2 font-medium text-red-700">
                                Rejected
                            </span>
                    )}
                </div>
            </div>
        )}
                </div>
            </div>
        </>
    );
}

export default Status;