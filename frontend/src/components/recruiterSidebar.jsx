import { useNavigate, useLocation } from "react-router-dom";
import { FolderOpen, FileCheck } from "lucide-react";

function RecruiterSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Projects", path: "/Project", icon: FolderOpen },
    { label: "ATS Checker", path: "/ats", icon: FileCheck },
  ];

  return (
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-3 py-5">
      <div className="mb-8 px-3">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Recruiter
        </p>
        <h1 className="mt-0.5 text-base font-medium text-gray-900">
          Dashboard
        </h1>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} className={active ? "text-gray-900" : "text-gray-400"} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default RecruiterSidebar;