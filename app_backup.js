const express = require('express');
const cors = require('cors')
const fs = require('fs').promises; // Menggunakan versi Promise
const app = express();
const PORT = 3000;
const DB_FILE = './data.json';

app.use(cors())

// Middleware untuk membaca JSON body
app.use(express.json());

// --- HELPER FUNCTIONS (Fungsi Pembantu) ---
// Supaya kita tidak menulis ulang kode baca/tulis berkali-kali

// Fungsi membaca file
const getBooks = async () => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // Jika file belum ada, kembalikan array kosong
        return []; 
    }
};

// Fungsi menulis file
const saveBooks = async (data) => {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 4));
};

// --- ROUTES / ENDPOINTS ---

// 1. READ (GET) - Ambil semua data buku
app.get('/api/books', async (req, res) => {
    const books = await getBooks();
    res.json(books);
});

// 2. READ ONE (GET) - Ambil 1 buku berdasarkan Judul
app.get('/api/books/:judul', async (req, res) => {
    const books = await getBooks();
    const judulDicari = req.params.judul;
    
    const book = books.find(b => b.Judul === judulDicari);
    
    if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' });
    
    res.json(book);
});

// 3. CREATE (POST) - Tambah buku baru
app.post('/api/books', async (req, res) => {
    const books = await getBooks();
    const newBook = req.body;

    // Validasi sederhana: Cek apakah Judul sudah ada
    const exist = books.find(b => b.Judul === newBook.Judul);
    if (exist) {
        return res.status(400).json({ message: 'Judul buku sudah ada!' });
    }

    // Tambahkan ke array dan simpan
    books.push(newBook);
    await saveBooks(books);

    res.status(201).json({ message: 'Buku berhasil ditambahkan', data: newBook });
});

// 4. UPDATE (PUT) - Ubah data buku berdasarkan Judul
app.put('/api/books/:judul', async (req, res) => {
    const books = await getBooks();
    const judulTarget = req.params.judul;
    const updateData = req.body;

    // Cari index buku di dalam array
    const index = books.findIndex(b => b.Judul === judulTarget);

    if (index === -1) {
        return res.status(404).json({ message: 'Buku tidak ditemukan untuk diupdate' });
    }

    // Update data: Gabungkan data lama dengan data baru
    // Kita gunakan spread operator (...) agar field yang tidak dikirim tetap aman
    books[index] = { ...books[index], ...updateData };

    // Pastikan Judul di dalam objek tetap konsisten dengan URL (opsional, untuk keamanan)
    books[index].Judul = judulTarget; 

    await saveBooks(books);
    res.json({ message: 'Buku berhasil diupdate', data: books[index] });
});

// 5. DELETE (DELETE) - Hapus buku berdasarkan Judul
app.delete('/api/books/:judul', async (req, res) => {
    let books = await getBooks();
    const judulTarget = req.params.judul;

    // Cek apakah buku ada
    const exist = books.find(b => b.Judul === judulTarget);
    if (!exist) return res.status(404).json({ message: 'Buku tidak ditemukan' });

    // Filter array: Ambil semua buku KECUALI yang judulnya target
    const newBooksList = books.filter(b => b.Judul !== judulTarget);

    await saveBooks(newBooksList);
    res.json({ message: `Buku '${judulTarget}' berhasil dihapus` });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});