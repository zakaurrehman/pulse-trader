"use client";
import { useState, useEffect, useCallback } from "react";

type Course = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string | null;
  features: string | null;
  badge: string | null;
  popular: boolean;
  active: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string;
  badge: string;
  popular: boolean;
  sortOrder: number;
};

const BLANK: FormState = {
  name: "",
  price: 0,
  period: "one-time",
  description: "",
  features: "",
  badge: "",
  popular: false,
  sortOrder: 0,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Course | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/courses");
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openAdd() {
    setForm(BLANK);
    setEditing(null);
    setAdding(true);
  }

  function openEdit(c: Course) {
    setForm({
      name: c.name,
      price: c.price,
      period: c.period,
      description: c.description ?? "",
      features: c.features ?? "",
      badge: c.badge ?? "",
      popular: c.popular,
      sortOrder: c.sortOrder,
    });
    setEditing(c);
    setAdding(false);
  }

  function closeForm() {
    setAdding(false);
    setEditing(null);
  }

  async function save() {
    if (!form.name.trim()) { showToast("Course name is required."); return; }
    if (!form.price) { showToast("Price is required."); return; }
    setSaving(true);

    if (adding) {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Course added!");
        closeForm();
        load();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to add course.");
      }
    } else if (editing) {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      if (res.ok) {
        showToast("Course updated!");
        closeForm();
        load();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to update.");
      }
    }
    setSaving(false);
  }

  async function toggleActive(c: Course) {
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    if (res.ok) { showToast(`Course ${c.active ? "deactivated" : "activated"}.`); load(); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const res = await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) { showToast("Course deleted."); load(); }
    setDeleteId(null);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl border border-slate-700">
          {toast}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <p className="text-slate-900 font-bold text-lg mb-2">Delete this course?</p>
            <p className="text-slate-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Manage the courses shown on the order form and landing page.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Add Course
        </button>
      </div>

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-slate-900 text-lg mb-4">{adding ? "Add New Course" : `Edit: ${editing?.name}`}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Advanced Trading Strategies"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Period *</label>
              <select
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="one-time">One-time</option>
                <option value="per month">Per month</option>
                <option value="per year">Per year</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Short Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Brief course description shown on the landing page"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Features <span className="font-normal normal-case">(one per line)</span></label>
              <textarea
                rows={5}
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder={"Forex fundamentals\nChart reading basics\nRisk management guide"}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Badge <span className="font-normal normal-case">(optional)</span></label>
              <input
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Most Popular, Best Value"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
              </label>
              <span className="text-sm font-semibold text-slate-700">Highlight as popular (gold card)</span>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving…" : adding ? "Add Course" : "Save Changes"}
            </button>
            <button onClick={closeForm} className="border border-slate-300 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No courses yet. Click &quot;Add Course&quot; to get started.</div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                c.active ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{c.name}</span>
                  {c.badge && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{c.badge}</span>
                  )}
                  {c.popular && (
                    <span className="text-xs font-bold bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full">Popular</span>
                  )}
                  {!c.active && (
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-amber-600 font-black text-lg mt-0.5">
                  ${c.price.toFixed(2)} <span className="text-slate-400 font-normal text-sm">/ {c.period}</span>
                </p>
                {c.description && (
                  <p className="text-slate-500 text-sm mt-0.5 truncate">{c.description}</p>
                )}
                {c.features && (
                  <p className="text-xs text-slate-400 mt-1">
                    {c.features.split("\n").length} feature{c.features.split("\n").length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    c.active
                      ? "border-slate-300 text-slate-600 hover:bg-slate-50"
                      : "border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                >
                  {c.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => openEdit(c)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
