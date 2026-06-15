"use client";
import { useState, useEffect, useCallback, use } from "react";
import { upload } from "@vercel/blob/client";
import Link from "next/link";

type Video = {
  id: string;
  title: string;
  description: string | null;
  blobUrl: string;
  fileName: string;
  fileSize: number;
  sortOrder: number;
  createdAt: string;
};

export default function AdminCourseVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);

  const [videos, setVideos] = useState<Video[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", sortOrder: 0 });

  // New video form
  const [file, setFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newOrder, setNewOrder] = useState(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  // macOS screen recordings (and other files) can contain spaces and special
  // unicode characters (e.g. U+202F narrow no-break space) that break the
  // upload request. Convert the name to a safe, ASCII-only slug + extension.
  function safeFileName(name: string) {
    const lastDot = name.lastIndexOf(".");
    const ext = lastDot >= 0 ? name.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "mp4";
    const base = lastDot >= 0 ? name.slice(0, lastDot) : name;
    const slug =
      base
        .normalize("NFKD")              // decompose unicode (narrow nbsp -> space)
        .replace(/[^a-zA-Z0-9]+/g, "-") // any non-alphanumeric run -> single dash
        .replace(/-+/g, "-")            // collapse repeated dashes
        .replace(/^-|-$/g, "")          // trim leading/trailing dashes
        .toLowerCase() || "video";
    return `${slug}-${Date.now()}.${ext}`;
  }

  const load = useCallback(async () => {
    setLoading(true);
    const [vRes, cRes] = await Promise.all([
      fetch(`/api/admin/videos?courseId=${courseId}`),
      fetch("/api/admin/courses"),
    ]);
    if (vRes.ok) setVideos(await vRes.json());
    if (cRes.ok) {
      const courses: { id: string; name: string }[] = await cRes.json();
      const course = courses.find((c) => c.id === courseId);
      if (course) setCourseName(course.name);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload() {
    if (!file || !newTitle.trim()) { showToast("File and title are required."); return; }
    setUploading(true);
    setProgress(0);
    try {
      const uploadName = safeFileName(file.name);
      const blob = await upload(uploadName, file, {
        access: "public",
        handleUploadUrl: "/api/admin/videos/upload",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          blobUrl: blob.url,
          fileName: file.name,
          fileSize: file.size,
          sortOrder: newOrder,
        }),
      });

      if (res.ok) {
        showToast("Video uploaded!");
        setFile(null);
        setNewTitle("");
        setNewDesc("");
        setNewOrder(0);
        load();
      } else {
        showToast("Upload failed — could not save video.");
      }
    } catch (err) {
      showToast("Upload failed: " + String(err));
    }
    setUploading(false);
    setProgress(0);
  }

  async function saveEdit(id: string) {
    const res = await fetch("/api/admin/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) { showToast("Video updated."); setEditingId(null); load(); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const res = await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) { showToast("Video deleted."); load(); }
    setDeleteId(null);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            <p className="text-slate-900 font-bold text-lg mb-2">Delete this video?</p>
            <p className="text-slate-500 text-sm mb-6">The file will be permanently removed from storage.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-slate-400 hover:text-slate-700 text-sm font-medium">
          ← Courses
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-black text-slate-900">{courseName || "Course"} — Videos</h1>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 text-lg mb-4">Upload New Video</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Video Title *</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Introduction to Forex"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (optional)</label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief description of this lesson"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sort Order</label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Video File *</label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
              />
              {file && <p className="text-xs text-slate-400 mt-1">{file.name} ({formatSize(file.size)})</p>}
            </div>
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !newTitle.trim()}
            className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {uploading ? `Uploading ${progress}%…` : "Upload Video"}
          </button>
        </div>
      </div>

      {/* Video list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading videos…</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No videos yet. Upload your first lesson above.
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v, i) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {editingId === v.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(v.id)} className="bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold px-4 py-1.5 rounded-lg text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{v.title}</p>
                    {v.description && <p className="text-slate-500 text-sm mt-0.5">{v.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{v.fileName} · {formatSize(v.fileSize)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={v.blobUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                      Preview
                    </a>
                    <button
                      onClick={() => { setEditingId(v.id); setEditForm({ title: v.title, description: v.description ?? "", sortOrder: v.sortOrder }); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
