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

export class CourseService {
  // Menambahkan course baru dengan Base64
  static async createCourse(courseData) {
    try {
      let imageUrl = "";
      
      // Convert gambar ke Base64
      if (courseData.image) {
        imageUrl = await this.convertImageToBase64(courseData.image);
      }

      // Simpan data course ke Firestore
      const courseDoc = {
        title: courseData.title,
        description: courseData.description || "",
        category: courseData.category,
        imageUrl: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "courses"), courseDoc);
      return { id: docRef.id, ...courseDoc };
    } catch (error) {
      throw new Error(`Gagal membuat course: ${error.message}`);
    }
  }

  // Helper function untuk convert gambar ke Base64
  static convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Mengambil semua course
  static async getAllCourses() {
    try {
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const courses = [];

      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return courses;
    } catch (error) {
      throw new Error(`Gagal mengambil courses: ${error.message}`);
    }
  }

  // Mengambil course berdasarkan ID
  static async getCourseById(courseId) {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() };
      } else {
        throw new Error("Course tidak ditemukan");
      }
    } catch (error) {
      throw new Error(`Gagal mengambil course: ${error.message}`);
    }
  }

  // Update course
  static async updateCourse(courseId, courseData) {
    try {
      let imageUrl = courseData.imageUrl;

      // Jika ada gambar baru, convert ke Base64
      if (courseData.image && courseData.image !== courseData.imageUrl) {
        imageUrl = await this.convertImageToBase64(courseData.image);
      }

      const updateData = {
        title: courseData.title,
        description: courseData.description || "",
        category: courseData.category,
        imageUrl: imageUrl,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "courses", courseId), updateData);
      return { id: courseId, ...updateData };
    } catch (error) {
      throw new Error(`Gagal update course: ${error.message}`);
    }
  }

  // Hapus course
  static async deleteCourse(courseId) {
    try {
      // Hapus dokumen dari Firestore
      await deleteDoc(doc(db, "courses", courseId));
      return true;
    } catch (error) {
      throw new Error(`Gagal menghapus course: ${error.message}`);
    }
  }
}
