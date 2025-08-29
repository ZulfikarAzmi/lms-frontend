// import {
//   collection,
//   addDoc,
//   getDocs,
//   doc,
//   updateDoc,
//   deleteDoc,
//   getDoc,
//   query,
//   where,
//   orderBy,
// } from "firebase/firestore";
// import { db } from "../firebase";

// export class ProgressService {
//   // Menandai materi sebagai selesai
//   static async markMaterialAsCompleted(userId, materialId, courseId) {
//     try {
//       const progressDoc = {
//         userId: userId,
//         materialId: materialId,
//         courseId: courseId,
//         completed: true,
//         completedAt: new Date(),
//         createdAt: new Date(),
//       };

//       const docRef = await addDoc(collection(db, "userProgress"), progressDoc);
//       return { id: docRef.id, ...progressDoc };
//     } catch (error) {
//       throw new Error(`Gagal menandai materi selesai: ${error.message}`);
//     }
//   }

//   // Menandai materi sebagai belum selesai
//   static async markMaterialAsIncomplete(userId, materialId) {
//     try {
//       // Cari progress yang sudah ada
//       const q = query(
//         collection(db, "userProgress"),
//         where("userId", "==", userId),
//         where("materialId", "==", materialId)
//       );
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         // Hapus progress yang sudah ada
//         const docToDelete = querySnapshot.docs[0];
//         await deleteDoc(doc(db, "userProgress", docToDelete.id));
//       }

//       return true;
//     } catch (error) {
//       throw new Error(`Gagal menandai materi belum selesai: ${error.message}`);
//     }
//   }

//   // Mengambil progress user untuk course tertentu
//   static async getUserCourseProgress(userId, courseId) {
//     try {
//       const q = query(
//         collection(db, "userProgress"),
//         where("userId", "==", userId),
//         where("courseId", "==", courseId)
//       );
//       const querySnapshot = await getDocs(q);
//       const progress = [];

//       querySnapshot.forEach((doc) => {
//         progress.push({ id: doc.id, ...doc.data() });
//       });

//       return progress;
//     } catch (error) {
//       throw new Error(`Gagal mengambil progress course: ${error.message}`);
//     }
//   }

//   // Mengambil semua progress user
//   static async getUserProgress(userId) {
//     try {
//       const q = query(
//         collection(db, "userProgress"),
//         where("userId", "==", userId),
//         orderBy("createdAt", "desc")
//       );
//       const querySnapshot = await getDocs(q);
//       const progress = [];

//       querySnapshot.forEach((doc) => {
//         progress.push({ id: doc.id, ...doc.data() });
//       });

//       return progress;
//     } catch (error) {
//       throw new Error(`Gagal mengambil progress user: ${error.message}`);
//     }
//   }

//   // Cek apakah materi sudah selesai
//   static async isMaterialCompleted(userId, materialId) {
//     try {
//       const q = query(
//         collection(db, "userProgress"),
//         where("userId", "==", userId),
//         where("materialId", "==", materialId)
//       );
//       const querySnapshot = await getDocs(q);

//       return !querySnapshot.empty;
//     } catch (error) {
//       console.error("Error checking material completion:", error);
//       return false;
//     }
//   }

//   // Hapus progress user (untuk admin)
//   static async deleteUserProgress(progressId) {
//     try {
//       await deleteDoc(doc(db, "userProgress", progressId));
//       return true;
//     } catch (error) {
//       throw new Error(`Gagal menghapus progress: ${error.message}`);
//     }
//   }
// }
