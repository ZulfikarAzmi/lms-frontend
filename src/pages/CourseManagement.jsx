import { useEffect, useState } from "react";
import { CourseService } from "../services/CourseService";
import CourseForm from "../components/CourseForm";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus course ini?")) {
      await CourseService.deleteCourse(id);
      fetchCourses();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>
      
      <CourseForm onCourseAdded={fetchCourses} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border p-4 rounded shadow">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-xl font-semibold mt-2">{course.title}</h2>
              <p className="text-gray-600">{course.description}</p>
              <p className="text-sm text-gray-500">{course.category}</p>
              <div className="flex justify-between mt-3">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => alert("Nanti kita buat edit modal")}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(course.id)}
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
};

export default CourseManagement;
