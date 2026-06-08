import axios from "axios";
import Sidebar from "../components/sidebar.jsx";
import { useEffect, useState } from "react";

function Admin() {
    const [projName, setptojName] = useState("");
    // const [jd, setjd] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [receivedRecruiter, setreceivedRecruiter] = useState([]);
    const [file,setfile]=useState(null);

    const [selectedRecruiterIds, setSelectedRecruiterIds] = useState([]);
    const [selectedRecruiterObjects, setSelectedRecruiterObjects] = useState([]);
    const token=localStorage.getItem("token");

    async function handleOpening(e) {
        e.preventDefault();
        
        
        try {

            if (selectedRecruiterIds.length === 0) {
                alert("Please select at least one recruiter from the search suggestions dropdown.");
                return;
            }

            if (!file) {
                alert("Please select a PDF");
                return;
            }
            const formData=new FormData();
            formData.append('jobDesc',file);
            formData.append('projectName',projName);
            formData.append('listOfRecruiters',JSON.stringify(selectedRecruiterIds));
            formData.append('token',token);

           

            await axios.post("http://localhost:5010/admin/assign-project",
                formData
                
            );

            alert("Project details sent successfully!");

            setptojName("");
            setfile(null);
            setSearchQuery("");
            setSelectedRecruiterIds([]);
            setSelectedRecruiterObjects([]);
        } catch (err) {
            console.error(err);
            alert("Failed to submit opening data.");
        }
    }

    useEffect(() => {
        if (!searchQuery.trim()) {
            setreceivedRecruiter([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const res = await axios.get("http://localhost:5010/admin/getrecruiter", {
                    params: { name: searchQuery }
                });

                setreceivedRecruiter(res.data.recruiters || res.data);
                // console.log(receivedRecruiter);
            } catch (e) {
                console.log(e);
            }
        }, 300);
        return () => clearTimeout(delayDebounce);

    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />

            <div className="ml-64 p-6">
                <div className="rounded-lg bg-white p-6 shadow">
                    <h1 className="text-3xl font-bold text-gray-800">Opening Page</h1>
                    <p className="mt-2 text-gray-600">Manage job openings here.</p>

                    <form className="mt-6 space-y-4" onSubmit={handleOpening}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                            <input
                                type="text"
                                value={projName}
                                onChange={(e) => setptojName(e.target.value)}
                                placeholder="Enter project name"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recruiters</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to search recruiters..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500"
                            />
                            
                            {receivedRecruiter.length > 0 && (
                                <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-white shadow-lg z-20">
                                    {receivedRecruiter.map((recruiter) => (
                                        <li key={recruiter._id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!selectedRecruiterIds.includes(recruiter._id)) {
                                                        setSelectedRecruiterIds([...selectedRecruiterIds, recruiter._id]);
                                                        setSelectedRecruiterObjects([...selectedRecruiterObjects, recruiter]);
                                                    }
                                                    setSearchQuery(""); 
                                                    setreceivedRecruiter([]); 
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 font-medium"
                                            >
                                                {recruiter.Name} ({recruiter.Email})
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {selectedRecruiterObjects.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedRecruiterObjects.map((rec) => (
                                    <span key={rec._id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        {rec.Name}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedRecruiterIds(selectedRecruiterIds.filter(id => id !== rec._id));
                                                setSelectedRecruiterObjects(selectedRecruiterObjects.filter(r => r._id !== rec._id));
                                            }}
                                            className="text-blue-500 hover:text-blue-800 font-bold ml-1 text-sm"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                            
                            <input type="file"
                            accept=".pdf"
                            target={file}
                                onChange={(e)=>setfile(e.target.files[0])}/>

                            
                        </div>

                        <button
                            type="submit"
                            className="w-60 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Send to Recruiters
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Admin;
