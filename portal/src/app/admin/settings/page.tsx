"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [otp, setOtp] = useState({ ttl_minutes: 10, max_attempts: 5, length: 6 });
  const [session, setSession] = useState({ ttl_hours: 24 });
  const [committees, setCommittees] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [newCommittee, setNewCommittee] = useState("");
  const [newTopic, setNewTopic] = useState("");

  function load() {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.otp) setOtp(d.settings.otp);
        if (d.settings?.session) setSession(d.settings.session);
      });
    fetch("/api/admin/master-data", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setCommittees(d.committees ?? []);
        setTopics(d.topics ?? []);
      });
  }

  useEffect(load, []);

  async function saveSettings() {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, session }),
    });
    toast(res.ok ? "Settings saved." : "Could not save settings", res.ok ? "success" : "error");
  }

  async function addMaster(type: "committee" | "topic", name: string) {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/master-data", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name }),
    });
    if (res.ok) {
      toast("Added.", "success");
      load();
      if (type === "committee") setNewCommittee("");
      else setNewTopic("");
    } else {
      toast("Could not add entry", "error");
    }
  }

  return (
    <>
      <h1 className="admin-page-title">System settings</h1>
      <p className="admin-page-subtitle">
        OTP rules, session timeout, and committee/topic master data for publication uploads.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="admin-panel">
          <h2 className="admin-panel-title">OTP configuration</h2>
          <div className="space-y-3">
            <label className="block text-sm">
              Expiry (minutes)
              <input
                type="number"
                value={otp.ttl_minutes}
                onChange={(e) => setOtp({ ...otp, ttl_minutes: Number(e.target.value) })}
                className="icai-field-input mt-1"
              />
            </label>
            <label className="block text-sm">
              Max attempts
              <input
                type="number"
                value={otp.max_attempts}
                onChange={(e) => setOtp({ ...otp, max_attempts: Number(e.target.value) })}
                className="icai-field-input mt-1"
              />
            </label>
            <label className="block text-sm">
              Code length
              <input
                type="number"
                value={otp.length}
                onChange={(e) => setOtp({ ...otp, length: Number(e.target.value) })}
                className="icai-field-input mt-1"
              />
            </label>
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">Session timeout</h2>
          <label className="block text-sm">
            Session TTL (hours)
            <input
              type="number"
              value={session.ttl_hours}
              onChange={(e) => setSession({ ttl_hours: Number(e.target.value) })}
              className="icai-field-input mt-1"
            />
          </label>
          <button
            type="button"
            onClick={saveSettings}
            className="icai-btn-primary mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Save settings
          </button>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">Committees</h2>
          <ul className="mb-3 text-sm text-slate-700">
            {committees.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newCommittee}
              onChange={(e) => setNewCommittee(e.target.value)}
              className="icai-field-input flex-1"
              placeholder="New committee"
            />
            <button
              type="button"
              onClick={() => addMaster("committee", newCommittee)}
              className="icai-file-btn"
            >
              Add
            </button>
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="admin-panel-title">Topics / categories</h2>
          <ul className="mb-3 text-sm text-slate-700">
            {topics.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="icai-field-input flex-1"
              placeholder="New topic"
            />
            <button
              type="button"
              onClick={() => addMaster("topic", newTopic)}
              className="icai-file-btn"
            >
              Add
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
