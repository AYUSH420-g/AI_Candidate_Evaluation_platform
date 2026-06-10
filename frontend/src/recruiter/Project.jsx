import { useEffect,useState} from "react";
import RecruiterSidebar from "../components/recruiterSidebar.jsx";
import axios from "axios";
import { Eye } from "lucide-react";

function Project()
{
    const [assignedOpenings,setAssignedOpenings]=useState([]);
    const [ModalOpen,setModalOpen]=useState(false);
    const [cv, setCv] = useState(null);
    const [projectId, setProjectId] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [openProject, setOpenProject] = useState(null);
    const [candidateMap, setCandidateMap] = useState({});
   
    const token=localStorage.getItem("token");

    const handleViewCandidates = async (projectId) => {
    try {
        if (openProject === projectId) {
            setOpenProject(null);
            return;
        }

        const res = await axios.get(
            "http://localhost:5010/recruiter/getCandidates",
            {
                params: {
                    projectId,
                },
            }
        );

        setCandidateMap((prev) => ({
            ...prev,
            [projectId]: res.data.candidates,
        }));

        setOpenProject(projectId);
    } catch (err) {
        console.log(err);
    }
};
    

    async function analyseCandidate(c_id) {
        
        try{
            
            const res=await axios.post("http://localhost:5010/recruiter/analyse",{
                id:c_id,
                projectId:projectId

            });
            if(res.data)
                alert("success");
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async function handleCandidate() {
    try {

        if (!cv) {
            alert("CV is required");
            return;
        }

        const formData = new FormData();

        formData.append("candidateCv", cv);
        formData.append("projectId", projectId);

        const res = await axios.post(
            "http://localhost:5010/recruiter/addCandidate",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (res.data) {
            setSuccessMsg("Candidate added successfully!");
            setModalOpen(false);
            // console.log(res.data);
            analyseCandidate(res.data.candidate._id);

            setTimeout(() => {
                setSuccessMsg("");
            }, 3000);
        }

    }
    catch (e) {
        console.log(e);
    }
}

    useEffect(()=>{
        const getprojects=async()=>{
            try{
                const res=await axios.get("http://localhost:5010/recruiter/getOpenings",
                    {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setAssignedOpenings(res.data.tasks);
            }
            catch(err)
            {
                console.log(err);
            }
        }
        getprojects();
    },[token]);

    return (
    <>
        <RecruiterSidebar />

        <div className="ml-64 min-h-screen bg-gray-50 p-6">
            <h1 className="mb-6 text-3xl font-bold text-gray-600">
                Assigned Projects
            </h1>
            {successMsg && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
                    {successMsg}
                </div>
            )}
            <div className="space-y-4">
                {assignedOpenings.map((project) => (
    <div key={project._id}>

        <div
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
        >
            

            <div className="flex-1">
                <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                        Project Name
                    </p>
                    <h2 className="text-xl font-bold text-gray-600">
                        {project.projectName}
                    </h2>
                </div>

                <div>
                    <p className="text-sm text-gray-900">
                        {project.jobDescription}
                    </p>
                </div>
            </div>

            <div className="ml-6 flex gap-2">
                <button
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={() => {
                        setProjectId(project._id);
                        setModalOpen(true);
                    }}
                >
                    Add Candidate
                </button>

                <button
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
                    onClick={() => handleViewCandidates(project._id)}
                >
                    <Eye size={20} />
                </button>
            </div>
        </div>

        {openProject === project._id && (
            <div className="ml-10 mt-3 space-y-3">
                {candidateMap[project._id]?.length > 0 ? (
                    candidateMap[project._id].map((candidate) => (
                        <div
                            key={candidate._id}
                            className="rounded-lg border bg-[#f0f0f2] pt-2 pb-2 pl-4 shadow"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-normal">
                                        {candidate.candidateName}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        Status: 
                                    </p>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg bg-white p-4 shadow">
                        No candidates found
                    </div>
                )}
            </div>
        )}

    </div>
))}
            </div>
</div>
        
        

        {ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    Add Candidate
                </h2>

                <button
                    onClick={() => setModalOpen(false)}
                    className="text-2xl text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>


            <input
                type="file"
                className="mb-4 w-full rounded-lg border p-3"
                onChange={(e)=>setCv(e.target.files[0])}
            />

            <div className="flex justify-end gap-3">
                <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border px-4 py-2"
                >
                    Cancel
                </button>

                <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                    onClick={handleCandidate}
                >
                    Save
                </button>
                    </div>
                </div>
            </div>
        )}

       
    </>
);

            
}
export default Project;