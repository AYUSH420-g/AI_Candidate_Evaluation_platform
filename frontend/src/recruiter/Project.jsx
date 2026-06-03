import { useEffect,useState} from "react";
import RecruiterSidebar from "../components/recruiterSidebar.jsx";
import axios from "axios";
function Project()
{
    const [assignedOpenings,setAssignedOpenings]=useState([]);
    useEffect(()=>{
        const getprojects=async()=>{
            try{
                const token=localStorage.getItem("token");
                const res=await axios.get("http://localhost:5010/recruiter/getOpenings",
                    {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // console.log(res.data);
                setAssignedOpenings(res.data.tasks);
            }
            catch(err)
            {
                console.log(err);
            }
        }
        getprojects();
    },[]);

    return (
    <>
        <RecruiterSidebar />

        <div className="ml-64 min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">
                Assigned Projects
            </h1>

            <div className="space-y-4">
                {assignedOpenings.map((project) => (
                    <div
                        key={project._id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex-1">
                            <div className="mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                    Project Name
                                </p>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {project.projectName}
                                </h2>
                            </div>

                            

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                    Job Description
                                </p>
                                <p className="text-sm text-gray-900">
                                    {project.jobDescription}
                                </p>
                            </div>
                        </div>

                        <button className="ml-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                            Add Candidate
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </>
);
}
export default Project;