import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";

function Status() {
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const getStatus = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5010/admin/getstatus"
                );

                const projects = res.data.message;

                const details = await Promise.all(
                    projects.map((project) =>
                        axios.get(
                            "http://localhost:5010/admin/displaystatus",
                            {
                                params: {
                                    id: project._id,
                                },
                            }
                        )
                    )
                );

                const allCandidates = details.flatMap(
                    (item) => item.data.response
                );

                setCandidates(allCandidates);

            } catch (err) {
                console.log(err);
            }
        };

        getStatus();
    }, []);

    // console.log(candidates);
    return (
        <>
            <Sidebar />

            <div className="ml-64 p-6">
                <h1 className="mb-6 text-3xl font-normal">
                    Candidate Status
                </h1>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((candidate, index) => (
                        <div
                            key={candidate._id || index}
                            className="rounded-xl border bg-white p-5 shadow-md"
                        >
                            
                            <p className="text-sm font-medium text-gray-500 mb-1">
                                Name:
                            </p>

                            
                             <p className="text-sm text-gray-700 mb-3">
                                {candidate.candidateName}
                            </p>

                            <p className="font-medium text-green-700">
                                Matched Skills
                            </p>
                            

                            <p className="text-sm text-gray-700 mb-3">
                                {candidate.matchedSkills?.length > 0
                                    ? candidate.matchedSkills.join(", ")
                                    : "No matched skills"}
                            </p>

                            <p className="font-medium text-red-700">
                                Missing Skills
                            </p>

                            <p className="text-sm text-gray-700 mb-3">
                                {candidate.missingSkills?.length > 0
                                    ? candidate.missingSkills.join(", ")
                                    : "No missing skills"}
                            </p>

                             <p className="font-medium text-green-700">
                                Score: {Math.round(candidate.overallScore)}%
                            </p>

                            <div className="mt-4 flex gap-3">
                        <button
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            Accept
                        </button>

                        <button
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Reject
                        </button>
                    </div>
                            
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Status;