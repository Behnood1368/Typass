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
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/15.8.3 Safari/9537.53 VLC for iOS/3.6.4" }
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
