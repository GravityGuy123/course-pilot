"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios.config";
import { Save, Loader2, AlertCircle } from "lucide-react";

type SettingValue = string | number | boolean;

interface AdminSettings {
  site_name: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  max_upload_size_mb: number;
}

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ================= FETCH SETTINGS ================= */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get<AdminSettings>("/admin/settings");
        setSettings(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /* ================= UPDATE LOCAL STATE ================= */
  const handleChange = (key: keyof AdminSettings, value: SettingValue) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  /* ================= SAVE TO BACKEND ================= */
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch("/admin/settings", settings);
      setSuccess("Settings saved successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Admin Settings
      </h2>

      {/* Feedback */}
      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30">
          {success}
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Site Name */}
        <SettingRow label="Site Name" description="Public platform name">
          <input
            type="text"
            aria-label="Site Name"
            value={settings.site_name}
            onChange={(e) => handleChange("site_name", e.target.value)}
            className="setting-input"
          />
        </SettingRow>

        {/* Maintenance Mode */}
        <SettingRow
          label="Maintenance Mode"
          description="Disable access for non-admin users"
        >
          <Toggle
            checked={settings.maintenance_mode}
            onChange={(v) => handleChange("maintenance_mode", v)}
          />
        </SettingRow>

        {/* Allow Registration */}
        <SettingRow
          label="Allow Registration"
          description="Enable new user signups"
        >
          <Toggle
            checked={settings.allow_registration}
            onChange={(v) => handleChange("allow_registration", v)}
          />
        </SettingRow>

        {/* Max Upload Size */}
        <SettingRow
          label="Max Upload Size (MB)"
          description="Maximum file upload size"
        >
          <input
            type="number"
            aria-label="Max Upload Size in MB"
            min={1}
            value={settings.max_upload_size_mb}
            onChange={(e) =>
              handleChange("max_upload_size_mb", Number(e.target.value))
            }
            className="setting-input"
          />
        </SettingRow>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <div className="sm:w-64">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      aria-label="Toggle Setting"
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}