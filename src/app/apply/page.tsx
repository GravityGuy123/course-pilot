"use client";

import { useState, useContext } from "react";
import { api, bootstrapCsrf } from "@/lib/axios.config";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import { AuthContext } from "@/context/auth-context";

export default function ApplyPage() {
  const [role, setRole] = useState("tutor");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  const submit = async () => {
    try {
      await bootstrapCsrf();

      const res = await api.post("/admin/applications/apply/", { role, bio });

      if (res.status === 201) setStatus("Application submitted");
      else setStatus("Unexpected response");
    } catch (err: unknown) {
      let msg = "Error";

      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if ("response" in e && typeof e.response === "object" && e.response !== null) {
          const r = e.response as Record<string, unknown>;
          if (r.data && typeof r.data === "object") {
            const d = r.data as Record<string, unknown>;
            if ("detail" in d) msg = String(d.detail);
          }
        }

        const maybeMessage = (e as Record<string, unknown>)["message"];
        if (typeof maybeMessage === "string") msg = maybeMessage;
      } else if (typeof err === "string") msg = err;

      setStatus(msg);
    }
  };

  const handleVerified = async () => {
    if (auth && typeof auth.checkAuth === "function") {
      try {
        await auth.checkAuth();
        setStatus("Email verified — profile updated");
      } catch {
        setStatus("Email verified");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Apply for a role</h1>

      <div className="mb-3">
        <label className="block mb-1">Role</label>
        <select
          aria-label="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="tutor">Tutor</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Short bio / why you should be approved</label>
        <textarea
          aria-label="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded"
          rows={6}
        />
      </div>

      <div>
        <button
          onClick={submit}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded"
        >
          Submit Application
        </button>
      </div>

      {status && <div className="mt-3">{status}</div>}

      <div className="mt-6">
        {auth?.user?.email ? (
          <EmailVerificationForm email={auth.user.email} onVerified={handleVerified} />
        ) : (
          <div className="mt-2 text-sm text-gray-600">Sign in to verify your email</div>
        )}
      </div>
    </div>
  );
}