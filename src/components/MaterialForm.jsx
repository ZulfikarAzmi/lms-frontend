import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const MaterialForm = ({ courseId: propCourseId }) => {
  const { courseId: urlCourseId } = useParams();
  const activeCourseId = propCourseId || urlCourseId; // fallback dari URL

  const [materials, setMaterials] = useState([]);
  const [materialData, setMaterialData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  // state edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Ambil materi by courseId (realtime)
  useEffect(() => {
    if (!activeCourseId) {
      console.warn("[MaterialForm] courseId kosong. Cek route/prop.");
      setLoadingList(false);
      return;
    }

    const q = query(
      collection(db, "materials"),
      where("courseId", "==", activeCourseId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMaterials(list);
        setLoadingList(false);
      },
      (err) => {
        console.error("[MaterialForm] onSnapshot error:", err);
        setError(err.message);
        setLoadingList(false);
      }
    );

    return () => unsub();
  }, [activeCourseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterialData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!activeCourseId) {
      setError("Course tidak valid. Muat ulang halaman dari kartu course.");
      return;
    }
    if (!materialData.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editId) {
        // UPDATE
        await updateDoc(doc(db, "materials", editId), {
          title: materialData.title,
          videoUrl: materialData.videoUrl,
          description: materialData.description || "",
          updatedAt: serverTimestamp(),
        });
        setIsEditing(false);
        setEditId(null);
      } else {
        // CREATE
        await addDoc(collection(db, "materials"), {
          title: materialData.title,
          videoUrl: materialData.videoUrl,
          description: materialData.description || "",
          courseId: activeCourseId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setMaterialData({ title: "", description: "", videoUrl: "" });
    } catch (err) {
      console.error("Gagal menyimpan materi:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "materials", id));
    } catch (err) {
      console.error("Gagal hapus materi:", err);
      alert("Gagal hapus materi: " + err.message);
    }
  };

  const handleEdit = (mat) => {
    setMaterialData({
      title: mat.title,
      description: mat.description,
      videoUrl: mat.videoUrl,
    });
    setIsEditing(true);
    setEditId(mat.id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setMaterialData({ title: "", description: "", videoUrl: "" });
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Edit Materi" : "Kelola Materi"}
      </h2>

      {/* Info courseId aktif */}
      <div className="text-xs text-gray-500 mb-3">
        courseId aktif: <code>{activeCourseId || "-"}</code>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Judul *</label>
          <input
            type="text"
            name="title"
            value={materialData.title}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Contoh: Pengenalan React"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Deskripsi</label>
          <textarea
            name="description"
            value={materialData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Ringkasan materi (opsional)"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Video URL</label>
          <input
            type="url"
            name="videoUrl"
            value={materialData.videoUrl}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            {loading
              ? "Menyimpan..."
              : isEditing
              ? "Update Materi"
              : "Tambah Materi"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* List materi */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Daftar Materi</h3>

        {loadingList ? (
          <div className="text-sm text-gray-500">Memuat materi…</div>
        ) : materials.length === 0 ? (
          <p>Belum ada materi untuk course ini.</p>
        ) : (
          <ul className="space-y-2">
            {materials.map((mat) => (
              <li
                key={mat.id}
                className="border p-3 rounded shadow-sm bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <h4 className="font-bold">{mat.title}</h4>
                  {mat.description && (
                    <p className="text-sm text-gray-600">{mat.description}</p>
                  )}
                  {mat.videoUrl && (
                    <a
                      href={mat.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Lihat Video
                    </a>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(mat)}
                    className="text-yellow-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MaterialForm;
