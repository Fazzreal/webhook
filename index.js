const { default: makeWASocket, fetchCodeForPairing, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const readline = require("readline");
const fs = require("fs");

// Folder penyimpanan sesi
const sessionFolder = "./session";
if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

const { state, saveState } = useSingleFileAuthState(`${sessionFolder}/auth.json`);

// Fungsi input terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi utama untuk pairing
async function startBot() {
    rl.question("Masukkan nomor WhatsApp untuk bot: ", async (nomor) => {
        rl.close();

        try {
            console.log(`Menghubungkan ke WhatsApp dengan nomor: ${nomor}...`);
            
            const sock = makeWASocket({
                auth: state
            });

            sock.ev.on("creds.update", saveState);

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, pairingCode } = update;

                if (connection === "connecting") {
                    console.log("Menghubungkan ke WhatsApp...");
                }

                if (pairingCode) {
                    console.log(`Kode Pairing untuk ${nomor}: ${pairingCode}`);
                }

                if (connection === "open") {
                    console.log("Bot WhatsApp berhasil terhubung!");
                } else if (connection === "close") {
                    console.log("Koneksi tertutup. Coba jalankan ulang.");
                }
            });

            // Ambil kode pairing dan tampilkan
            const code = await fetchCodeForPairing(sock);
            console.log(`Gunakan kode ini untuk pairing: ${code}`);

        } catch (err) {
            console.error("Error:", err);
        }
    });
}

startBot();
