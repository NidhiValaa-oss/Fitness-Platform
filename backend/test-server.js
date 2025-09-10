const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5050;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "🎉 Server and CORS working perfectly!" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});



