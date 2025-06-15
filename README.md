# 📋 Bot WhatsApp 

Selamat datang di Bot WhatsApp! Bot ini memiliki fitur-fitur menarik serta kemampuan membaca pesan yang telah dihapus.

---

## 📖 Fitur Unggulan

- **Membaca Pesan Terhapus:** Bot dapat menampilkan isi pesan yang telah dihapus oleh pengirim.

---

## 🛠️ Instalasi

Ikuti langkah-langkah berikut untuk menginstal Bot WhatsApp di perangkat Anda:

1. **Clone Repository**
   ```bash
   git clone https://github.com/fajarnas/bot-wa.git
   cd bot-wa
   ```

2. **Install Dependensi**
   Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/) minimal versi 14.
   ```bash
   npm install
   ```

3. **Konfigurasi**
   - Salin file `.env.example` menjadi `.env` dan sesuaikan nilai-nilainya sesuai kebutuhan Anda.
   - Isi konfigurasi seperti token, nomor admin, atau setting lain pada file `.env`.

4. **Jalankan Bot**
   ```bash
   npm start
   ```
   atau jika menggunakan PM2:
   ```bash
   pm2 start npm --name "bot-wa" -- start
   ```

---

## 🚀 Penggunaan

Setelah bot berjalan, Anda dapat menggunakan perintah-perintah berikut melalui chat WhatsApp:

| Perintah               | Deskripsi                                      |
|------------------------|------------------------------------------------|
| `!menu`                | Lihat daftar perintah                          |
| `!tagall [teks]`       | Tag seluruh anggota group dengan teks tertentu |
| `!joke`                | Kirim candaan lucu                             |
| `!voice [teks]`        | Kirim teks dan balas dengan suara              |
| `!ai [teks]`           | Kirim pertanyaan ke AI                         |
| `!sticker [teks]`      | Ubah teks menjadi stiker                       |
| `!profile`             | Lihat profil pengguna                          |
| `!berita`              | Lihat berita terkini                           |
| `!PDF`                 | Ubah file jadi PDF                             |
| `!limit`               | Lihat limit penggunaan bot                     |

**Contoh:**  
Kirim pesan `!joke` ke bot untuk menerima candaan lucu.

---

## 🎙️ Kirim Pesan Suara

- Cukup kirim pesan suara, bot akan otomatis men-transkrip dan membalas dengan suara juga.

---

Selamat menggunakan Bot WhatsApp pribadi Anda! 🚀
