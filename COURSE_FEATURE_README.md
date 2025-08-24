# Fitur Course Management - Mini LMS

## Deskripsi

Fitur ini memungkinkan admin untuk membuat, mengedit, dan menghapus course, serta user biasa untuk melihat daftar course yang tersedia.

## Fitur yang Tersedia

### 1. Admin Dashboard

- **Tambah Course Baru**: Admin dapat membuat course dengan judul, deskripsi, kategori, dan thumbnail
- **Edit Course**: Admin dapat mengubah informasi course yang sudah ada
- **Hapus Course**: Admin dapat menghapus course yang tidak diperlukan
- **Upload Thumbnail**: Mendukung upload gambar untuk thumbnail course

### 2. User Dashboard

- **Lihat Course**: User dapat melihat semua course yang tersedia
- **Filter Kategori**: Course dikelompokkan berdasarkan kategori
- **Informasi Lengkap**: Setiap course menampilkan judul, deskripsi, kategori, dan tanggal pembuatan

## Struktur Data Course

```javascript
{
  id: "auto-generated-id",
  title: "Judul Course",
  description: "Deskripsi course",
  category: "Programming",
  imageUrl: "https://firebase-storage-url",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Kategori Course yang Tersedia

- Programming
- Design
- Business
- Marketing
- Finance
- Health
- Education
- Technology
- Other

## File yang Dibuat/Dimodifikasi

### File Baru

- `src/services/CourseService.js` - Service untuk operasi CRUD course
- `src/components/CourseForm.jsx` - Form untuk tambah/edit course
- `src/components/CourseList.jsx` - Komponen untuk menampilkan daftar course

### File yang Dimodifikasi

- `src/pages/AdminDashboard.jsx` - Menambahkan section course management
- `src/pages/Dashboard.jsx` - Menambahkan section available courses
- `src/index.css` - Menambahkan CSS untuk line-clamp

## Cara Penggunaan

### Untuk Admin

1. Login sebagai admin
2. Buka Admin Dashboard
3. Scroll ke section "Course Management"
4. Klik "Tambah Course Baru"
5. Isi form dengan informasi course
6. Upload thumbnail (opsional)
7. Klik "Tambah Course"

### Untuk User

1. Login sebagai user biasa
2. Buka User Dashboard
3. Scroll ke section "Course yang Tersedia"
4. Lihat daftar course yang tersedia

## Teknologi yang Digunakan

- **Firebase Firestore**: Database untuk menyimpan data course
- **Firebase Storage**: Penyimpanan file thumbnail
- **React Hooks**: State management
- **Tailwind CSS**: Styling

## Keamanan

- Hanya admin yang dapat membuat, mengedit, dan menghapus course
- User biasa hanya dapat melihat course
- Validasi input pada form
- Konfirmasi sebelum menghapus course

## Error Handling

- Loading state saat operasi async
- Error message yang informatif
- Fallback UI untuk data kosong
- Validasi form yang robust
