const express = require("express");
const router = express.Router();
const City = require("../models/City");

// ŞEHİR KAYDET
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    // ✅ Aynı şehir daha önce eklenmiş mi?
    const existing = await City.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "Bu şehir zaten kaydedilmiş." });
          }

    const newCity = new City(req.body);
    const savedCity = await newCity.save();
    res.status(201).json(savedCity);
  } catch (error) {
    console.error("❌ Kayıt hatası:", error.message, error);
    res.status(500).json({ message: "Kayıt hatası", error: error.message });
  }
});

// TÜM ŞEHİRLERİ GETİR
router.get("/", async (req, res) => {
    try {
        console.log("City:", City);           // tipine bakalım
console.log("City.find:", City.find); // undefined mi?

      const cities = await City.find().sort({ createdAt: -1 });
      console.log("📄 Kayıtlı şehirler getirildi:", cities.length);
      res.json(cities);
    } catch (error) {
      console.error("❌ GET /api/cities hatası:", error.message, error);
      res.status(500).json({ message: "Veri alınamadı", error: error.message });
    }
  });
  

module.exports = router;
