
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    try {
        console.log("Menerima request:", req.body);

        const { TRAKTEER_SECRET, email, paket } = req.body;

        if (!TRAKTEER_SECRET || TRAKTEER_SECRET !== process.env.TRAKTEER_SECRET) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!email || !paket) {
            return res.status(400).json({ message: 'Email dan paket diperlukan' });
        }

        console.log("Mengirim data ke panel:", email, paket);
        
        // Kirim data ke panel API
        await axios.post(process.env.PANEL_API_URL, { email, paket });

        res.status(200).json({ message: 'Sukses' });
    } catch (error) {
        console.error("Error di webhook:", error);
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
});

app.listen(PORT, () => {
    console.log(`Bot berjalan di port ${PORT}`);
});
