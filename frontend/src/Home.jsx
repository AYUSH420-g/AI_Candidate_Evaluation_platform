import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">

        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-400">
            AI-powered hiring
          </p>
          <h1 className="text-3xl font-medium text-gray-900">
            Candidate Evaluator
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Streamline your recruitment pipeline with intelligent CV screening,
            automated scoring, and structured interviews.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <button
            onClick={() => navigate("/Signup")}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Get started
          </button>

          <p className="mt-4 text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/Login"
              className="font-medium text-gray-700 underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Home;