const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const { Telegraf } = require("telegraf");

const botToken = "YOUR_TELEGRAM_BOT_TOKEN"; // Ganti dengan token bot Telegram
const bot = new Telegraf(botToken);

const app = express();
app.use(bodyParser.json());

const dataFile = "users.json";

// Fungsi untuk membaca data dari JSON
const readData = () => {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile));
};

// Fungsi untuk menyimpan data ke JSON
const saveData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Webhook untuk menerima pembayaran dari Trakteer
app.post("/webhook/trakteer", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !data.donator_name || !data.message || !data.amount) {
      return res.status(400).send("Data tidak lengkap.");
    }

    const message = data.message.trim().split("\n");
    if (message.length < 2) {
      return res.status(400).send("Format pesan salah.");
    }

    const akses = message[0].replace("Akses: ", "").trim();
    const username = message[1].replace("Username Telegram: ", "").trim();
    const jumlah = parseInt(data.amount);

    if (!akses || !username) {
      return res.status(400).send("Format tidak valid.");
    }

    // Cek harga sesuai akses
    const harga = akses.toLowerCase() === "premium" ? 20000 : 40000;
    if (jumlah < harga) {
      return res.status(400).send("Pembayaran kurang.");
    }

    // Simpan ke JSON
    let users = readData();
    users.push({ username, akses, tanggal: new Date().toISOString() });
    saveData(users);

    // Kirim notifikasi ke pengguna
    await bot.telegram.sendMessage(username, `✅ Pembayaran sukses!\nAnda telah mendapatkan akses *${akses}* ke bot.`);
    return res.status(200).send("Akses diberikan.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error.");
  }
});

// Jalankan bot Telegram
bot.start((ctx) => ctx.reply("Halo! Gunakan /buy untuk membeli akses."));
bot.launch();

// Jalankan server webhook
const PORT = 3000;
app.listen(PORT, () => console.log(`Bot berjalan di port ${PORT}`));
