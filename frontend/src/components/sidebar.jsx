import { useNavigate ,useLocation} from "react-router-dom";
function Sidebar() {
    function handleOpening() {
        navigate("/Opening");
    }

    const navigate = useNavigate();
    const location=useLocation();

    return (
        <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-gray-100 border p-4 text-black">

            <h1 className="mb-8 text-2xl font-bold">
                Dashboard
            </h1>

            <button
                onClick={handleOpening}
                className={`mb-3 rounded-lg px-4 py-3 text-left hover:bg-gray-300 ${
                    location.pathname==="/Opening" ?"bg-gray-300 text-black"
                    :"hover:bg-gray-100 text-black"
                }`}
            >
                Openings
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
export default Sidebar;