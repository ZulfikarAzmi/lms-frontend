import React, { useState } from "react";
import { QuizService } from "../services/QuizService";

const QuizForm = ({
  quizId,
  onQuestionAdded,
  editingQuestion,
  onCancelEdit,
}) => {
  const [question, setQuestion] = useState(editingQuestion?.question || "");
  const [options, setOptions] = useState(
    editingQuestion?.options || ["", "", "", ""]
  );
  const [answer, setAnswer] = useState(editingQuestion?.answer || "");
  const [loading, setLoading] = useState(false);

  // Update form when editingQuestion changes
  React.useEffect(() => {
    if (editingQuestion) {
      setQuestion(editingQuestion.question || "");
      setOptions(editingQuestion.options || ["", "", "", ""]);
      setAnswer(editingQuestion.answer || "");
    } else {
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
    }
  }, [editingQuestion]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizId) return alert("Quiz belum aktif!");

    // Validation
    if (!question.trim()) return alert("Pertanyaan tidak boleh kosong!");
    if (options.some((opt) => !opt.trim()))
      return alert("Semua pilihan harus diisi!");
    if (!answer.trim()) return alert("Jawaban tidak boleh kosong!");
    if (!options.includes(answer))
      return alert("Jawaban harus salah satu dari pilihan yang tersedia!");

    // Check for minimum options
    if (options.filter((opt) => opt.trim()).length < 2) {
      return alert("Minimal harus ada 2 pilihan jawaban!");
    }

    // Check for duplicate options
    const uniqueOptions = [...new Set(options.map((opt) => opt.trim()))];
    if (uniqueOptions.length !== options.filter((opt) => opt.trim()).length) {
      return alert("Pilihan tidak boleh sama!");
    }

    setLoading(true);
    try {
      if (editingQuestion) {
        // Update existing question
        await QuizService.updateQuestion(quizId, editingQuestion.id, {
          question,
          options,
          answer,
        });
        alert("Pertanyaan berhasil diupdate!");
      } else {
        // Add new question
        await QuizService.addQuestion(quizId, { question, options, answer });
        alert("Pertanyaan berhasil ditambahkan!");
      }

      // Reset form
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");

      // Notify parent component
      if (onQuestionAdded) {
        onQuestionAdded();
      }
    } catch (err) {
      console.error(err);
      alert(
        editingQuestion
          ? "Gagal mengupdate pertanyaan"
          : "Gagal menambahkan pertanyaan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Pertanyaan"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Pilihan Jawaban:
          </label>
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
          >
            + Tambah Pilihan
          </button>
        </div>

        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder={`Pilihan ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              className="flex-1 border p-2 rounded"
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => {
                  const newOptions = options.filter((_, index) => index !== i);
                  setOptions(newOptions);
                  // Reset answer if it was the deleted option
                  if (answer === opt) {
                    setAnswer("");
                  }
                }}
                className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Hapus pilihan"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jawaban Benar:
        </label>
        <select
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Pilih jawaban benar</option>
          {options
            .filter((opt) => opt.trim())
            .map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? editingQuestion
            ? "Mengupdate..."
            : "Menambahkan..."
          : editingQuestion
          ? "Update Pertanyaan"
          : "Tambah Pertanyaan"}
      </button>

      {editingQuestion && (
        <button
          type="button"
          onClick={() => {
            setQuestion("");
            setOptions(["", "", "", ""]);
            setAnswer("");
            // Clear the editing state
            if (onCancelEdit) onCancelEdit();
          }}
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Batal Edit
        </button>
      )}

      {!editingQuestion && (
        <button
          type="button"
          onClick={() => {
            setQuestion("");
            setOptions(["", "", "", ""]);
            setAnswer("");
          }}
          className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Reset Form
        </button>
      )}

      <div className="text-xs text-gray-500 mt-2">
        <p>• Minimal 2 pilihan jawaban</p>
        <p>• Jawaban benar harus salah satu dari pilihan yang tersedia</p>
        <p>• Pilihan tidak boleh sama</p>
      </div>
    </form>
  );
};

export default QuizForm;
