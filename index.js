const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());

const TRAKTEER_SECRET = "YOUR_TRAKTEER_SECRET"; // Ganti dengan secret dari webhook Trakteer
const PANEL_API_URL = "https://create-2024.zacky-offc.biz.id/Fazz/panel/add.php";

// Konfigurasi Email
const transporter = nodemailer.createTransport({
    service: "gmail", // Bisa diganti dengan SMTP lain
    auth: {
        user: "your-email@gmail.com", // Ganti dengan email Anda
        pass: "your-email-password"  // Ganti dengan password email Anda (gunakan App Password jika pakai Gmail)
    }
});

// Webhook Trakteer
app.post("/webhook", async (req, res) => {
    try {
        const data = req.body;

        // Validasi Secret dari Trakteer
        if (data.secret !== TRAKTEER_SECRET) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Ambil informasi pembayaran
        const status = data.status;  // Status pembayaran
        const email = data.email;    // Email pembeli
        const paket = data.message;  // Pesan di Trakteer (isi paket)

        // Validasi pembayaran sukses
        if (status !== "PAID") {
            return res.status(400).json({ message: "Pembayaran belum lunas" });
        }

        // Tambahkan email ke panel
        await axios.post(PANEL_API_URL, { email, paket });

        // Kirim email konfirmasi
        const mailOptions = {
            from: "your-email@gmail.com",
            to: email,
            subject: "Pembelian Berhasil",
            text: `Halo,\n\nPembelian paket ${paket} berhasil! Akun Anda telah aktif.\n\nTerima kasih telah membeli!`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email konfirmasi dikirim" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan" });
    }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot berjalan di port ${PORT}`));
