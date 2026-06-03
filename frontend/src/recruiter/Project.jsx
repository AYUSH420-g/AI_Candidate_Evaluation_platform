import { useEffect,useState} from "react";
import RecruiterSidebar from "../components/recruiterSidebar.jsx";
import axios from "axios";
function Project()
{
    const [assignedOpenings,setAssignedOpenings]=useState([]);
    const [ModalOpen,setModalOpen]=useState(false);
    const [name,setname]=useState("");
    const [email,setemail]=useState("");
    const [cv, setCv] = useState(null);
    const [projectId, setProjectId] = useState("");
    const [adminid, setAdminId] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
   
    const token=localStorage.getItem("token");
    

    async function handleCandidate()
    {
        try{

            if(!cv){
                alert("cv is requierd");
                return;
            }
            
                
            const formData = new FormData();

            formData.append("candidateName", name);
            formData.append("candidateEmail", email);
            formData.append("candidateCv", cv);
            formData.append("recruiterId", token);
            formData.append("adminId", adminid);
            formData.append("projectId", projectId);

            const res=await axios.post("http://localhost:5010/recruiter/addCandidate",formData);

            if (res.data) {
                setSuccessMsg("Candidate added successfully!");
                setModalOpen(false);

                setTimeout(() => {
                    setSuccessMsg("");
                }, 3000);
            }



        }
        catch(e)
        {
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
                    <div
                        key={project._id}
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                    Job Description
                                </p>
                                <p className="text-sm text-gray-900">
                                    {project.jobDescription}
                                </p>
                            </div>
                        </div>

                        <button className="ml-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                            onClick={()=>{
                                setProjectId(project._id);
                                setAdminId(project.adminId);
                                setModalOpen(true)}}>
                            Add Candidate
                        </button>
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
                type="text"
                placeholder="Candidate Name"
                className="mb-3 w-full rounded-lg border p-3"
                value={name}
                onChange={(e)=>setname(e.target.value)}
            />

            <input
                type="email"
                placeholder="Candidate Email"
                className="mb-3 w-full rounded-lg border p-3"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
            />

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