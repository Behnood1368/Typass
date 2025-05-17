const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || !targetUrl.startsWith("http")) {
    return res.status(400).send("پارامتر ?url الزامی است");
  }

  try {
    const response = await fetch(targetUrl)
      

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
