import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";

function Status() {
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const getStatus = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "http://localhost:5010/admin/getstatus",
                    {
                        headers: {
                            Authorization: `bearer ${token}`,
                        },
                    }
                );

                console.log("Full Response:", res.data);
                console.log("Data:", res.data.data);        
                // console.log(res.data.data);
                setCandidates(res.data.message);
            } catch (err) {
                console.log(err);
            }
        };

        getStatus();
    }, []);

    return (
        <>
            <Sidebar />

            <div className="ml-64 p-6">
                <h1 className="mb-6 text-3xl font-normal">
                    Candidate Status
                </h1>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates?.map((candidate, index) => (
                    <div
                        key={index}
                        className="rounded-xl border bg-white p-5 shadow-md"
                        >
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Candidate Name
                        </p>

                        <h2 className="text-xl font-semibold text-gray-700">
                            {candidate.candidateName}
                        </h2>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Status;