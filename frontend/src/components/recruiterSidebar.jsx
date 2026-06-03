import { useNavigate ,useLocation} from "react-router-dom";
function RecruiterSidebar() {

    function handleProject() {
        navigate("/Project");
    }

    const navigate = useNavigate();
    const location=useLocation();

    return (
        <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-gray-100 border p-4 text-black">

            <h1 className="mb-8 text-2xl font-bold">
                Recruiter Dashboard
            </h1>

            <button
                onClick={handleProject}
                className={`mb-3 rounded-lg px-4 py-3 text-left hover:bg-gray-300 ${
                    location.pathname==="/Project" ?"bg-gray-300 text-black"
                    :"hover:bg-gray-100 text-black"
                }`}
            >
                Project
            </button>

            <button className="mb-3 rounded-lg px-4 py-3 text-left hover:bg-gray-300">
                A
            </button>

            <button className="mb-3 rounded-lg px-4 py-3 text-left hover:bg-gray-300">
                B
            </button>

            <button className="mb-3 rounded-lg px-4 py-3 text-left hover:bg-gray-300">
                C
            </button>

            <button className="rounded-lg px-4 py-3 text-left hover:bg-gray-300">
                D
            </button>

        </div>
    );
}
export default RecruiterSidebar;