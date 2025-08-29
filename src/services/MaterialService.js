import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export class MaterialService {
  // Menambahkan materi baru
  static async createMaterial(materialData) {
    try {
      const materialDoc = {
        title: materialData.title,
        videoUrl: materialData.videoUrl,
        description: materialData.description || "",
        courseId: materialData.courseId || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "materials"), materialDoc);
      return { id: docRef.id, ...materialDoc };
    } catch (error) {
      throw new Error(`Gagal membuat materi: ${error.message}`);
    }
  }

  // Mengambil semua materi
  static async getAllMaterials() {
    try {
      const q = query(
        collection(db, "materials"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const materials = [];

      querySnapshot.forEach((doc) => {
        materials.push({ id: doc.id, ...doc.data() });
      });

      return materials;
    } catch (error) {
      throw new Error(`Gagal mengambil materi: ${error.message}`);
    }
  }

  // Mengambil materi berdasarkan ID
  static async getMaterialById(materialId) {
    try {
      const materialDoc = await getDoc(doc(db, "materials", materialId));
      if (materialDoc.exists()) {
        return { id: materialDoc.id, ...materialDoc.data() };
      } else {
        throw new Error("Materi tidak ditemukan");
      }
    } catch (error) {
      throw new Error(`Gagal mengambil materi: ${error.message}`);
    }
  }

  // Mengambil materi berdasarkan course ID
  static async getMaterialsByCourseId(courseId) {
    try {
      const q = query(collection(db, "materials"), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const materials = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.courseId === courseId) {
          materials.push({ id: doc.id, ...data });
        }
      });

      return materials;
    } catch (error) {
      throw new Error(`Gagal mengambil materi course: ${error.message}`);
    }
  }

  // Update materi
  static async updateMaterial(materialId, materialData) {
    try {
      const updateData = {
        title: materialData.title,
        videoUrl: materialData.videoUrl,
        description: materialData.description || "",
        courseId: materialData.courseId || "",
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "materials", materialId), updateData);
      return { id: materialId, ...updateData };
    } catch (error) {
      throw new Error(`Gagal update materi: ${error.message}`);
    }
  }

  // Hapus materi
  static async deleteMaterial(materialId) {
    try {
      await deleteDoc(doc(db, "materials", materialId));
      return true;
    } catch (error) {
      throw new Error(`Gagal menghapus materi: ${error.message}`);
    }
  }
}

