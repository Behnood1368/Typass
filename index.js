const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("پارامتر ?url الزامی است");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.166 Safari/537.36" }
    });

    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.set("Access-Control-Allow-Origin", "*");

    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("خطا: " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Proxy server is running");
});
