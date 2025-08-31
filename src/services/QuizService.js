// src/services/QuizService.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const QUIZ_COLLECTION = "quizzes";

export const QuizService = {
  // ---------------- QUIZ CRUD ----------------

  // Create quiz with courseId and title
  createQuiz: async (courseId, title) => {
    const quizData = {
      courseId,
      title,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await addDoc(collection(db, QUIZ_COLLECTION), quizData);
  },

  // Toggle quiz active status
  toggleQuiz: async (courseId, status) => {
    const q = query(
      collection(db, QUIZ_COLLECTION),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Create new quiz if none exists
      return await QuizService.createQuiz(
        courseId,
        `Quiz for Course ${courseId}`
      );
    }

    const quizDoc = snapshot.docs[0];
    const quizRef = doc(db, QUIZ_COLLECTION, quizDoc.id);

    if (status) {
      // Activate quiz
      await updateDoc(quizRef, {
        isActive: true,
        updatedAt: new Date(),
      });
      return { id: quizDoc.id, ...quizDoc.data(), isActive: true };
    } else {
      // Deactivate quiz
      await updateDoc(quizRef, {
        isActive: false,
        updatedAt: new Date(),
      });
      return { id: quizDoc.id, ...quizDoc.data(), isActive: false };
    }
  },

  // Add quiz (legacy function - kept for compatibility)
  addQuiz: async (quizData) => {
    return await addDoc(collection(db, QUIZ_COLLECTION), quizData);
  },

  // Get single quiz
  getQuiz: async (id) => {
    const docRef = doc(db, QUIZ_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() };
  },

  // Get quizzes by courseId
  getQuizzes: async (courseId) => {
    const q = query(
      collection(db, QUIZ_COLLECTION),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    const docRef = doc(db, QUIZ_COLLECTION, id);
    return await updateDoc(docRef, quizData);
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    const docRef = doc(db, QUIZ_COLLECTION, id);
    return await deleteDoc(docRef);
  },

  // ---------------- QUESTION CRUD ----------------

  // Add question to quiz
  addQuestion: async (quizId, questionData) => {
    const questionsRef = collection(db, QUIZ_COLLECTION, quizId, "questions");
    const questionWithTimestamp = {
      ...questionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await addDoc(questionsRef, questionWithTimestamp);
  },

  // Get all questions from quiz
  getQuestions: async (quizId) => {
    const questionsRef = collection(db, QUIZ_COLLECTION, quizId, "questions");
    const snapshot = await getDocs(questionsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Update question
  updateQuestion: async (quizId, questionId, questionData) => {
    const questionRef = doc(
      db,
      QUIZ_COLLECTION,
      quizId,
      "questions",
      questionId
    );
    const updateData = {
      ...questionData,
      updatedAt: new Date(),
    };
    return await updateDoc(questionRef, updateData);
  },

  // Delete question
  deleteQuestion: async (quizId, questionId) => {
    const questionRef = doc(
      db,
      QUIZ_COLLECTION,
      quizId,
      "questions",
      questionId
    );
    return await deleteDoc(questionRef);
  },

  // ---------------- QUIZ RESULTS ----------------

  // Get active quiz for a course
  getActiveQuiz: async (courseId) => {
    const q = query(
      collection(db, QUIZ_COLLECTION),
      where("courseId", "==", courseId),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const quizDoc = snapshot.docs[0];
    return { id: quizDoc.id, ...quizDoc.data() };
  },

  // Submit quiz result
  submitResult: async (
    courseId,
    userId,
    quizId,
    score,
    totalQuestions,
    answers
  ) => {
    const resultsRef = collection(db, "quiz_results");
    const resultData = {
      courseId,
      userId,
      quizId,
      score,
      totalQuestions,
      answers,
      submittedAt: new Date(),
      percentage: Math.round((score / totalQuestions) * 100),
    };
    return await addDoc(resultsRef, resultData);
  },

  // Get user's quiz results for a course
  getUserQuizResults: async (userId, courseId) => {
    const q = query(
      collection(db, "quiz_results"),
      where("userId", "==", userId),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};
