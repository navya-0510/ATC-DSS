import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="panel p-8 w-80">

        <h1 className="mb-4 text-green-400">ATC SYSTEM</h1>

        <button
          className="border px-4 py-2 w-full"
          onClick={() => navigate("/dashboard")}
        >
          ENTER SYSTEM
        </button>

      </div>
    </div>
  );
}