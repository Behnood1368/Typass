// index.js
const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", async (req, res) => {
  const inputUrl = req.query.url;

  if (!inputUrl || !inputUrl.startsWith("http")) {
    return res.status(400).send("پارامتر ?url الزامی است");
  }

  try {
    // مرحله 1: دریافت ریدایرکت از tvpass
    const redirectRes = await fetch(inputUrl, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const finalUrl = redirectRes.headers.get("location");
    if (!finalUrl || !finalUrl.includes("thetvapp.to")) {
      return res.status(500).send("لینک نهایی پیدا نشد");
    }

    // مرحله 2: دریافت فایل M3U8 یا استریم
    const streamRes = await fetch(finalUrl, {
      headers: {
        "Origin": "https://tvpass.org",
        "Referer": "https://tvpass.org/",
        "User-Agent": "Mozilla/5.0"
      }
    });

    res.set("Content-Type", streamRes.headers.get("Content-Type") || "application/vnd.apple.mpegurl");
    res.set("Access-Control-Allow-Origin", "*");

    streamRes.body.pipe(res);
  } catch (err) {
    res.status(500).send("خطا: " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Proxy server running...");
});
