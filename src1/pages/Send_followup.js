"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import api from "@/utills/api";

export default function SendFollowup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lead_id = searchParams.get("lead_id");
  const follow_up_id = searchParams.get("follow_up_id");

  const [formData, setFormData] = useState({
    method: "email",
    send_date: new Date().toISOString().slice(0, 10),
    send_time: new Date().toTimeString().slice(0, 5),
    response: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSend = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.post(
        `/nodesetup/leads/${lead_id}/followups/${follow_up_id}/send`,
        formData
      );
      if (res.data.status === 200) {
        setStatusMessage({ type: "success", text: res.data.message });
      } else {
        setStatusMessage({ type: "error", text: res.data.message || "Failed to send" });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: err?.response?.data?.data || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-semibold mb-4">Send Follow-Up</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Method</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="email">Email</option>
            <option value="whatsapp" disabled>WhatsApp (Coming Soon)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Send Date</label>
          <input
            type="date"
            name="send_date"
            value={formData.send_date}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Send Time</label>
          <input
            type="time"
            name="send_time"
            value={formData.send_time}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Response</label>
          <textarea
            name="response"
            value={formData.response}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            rows={4}
          />
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Send size={18} />
          {loading ? "Sending..." : "Send Follow-Up"}
        </button>
      </div>
    </div>
  );
}
