const { app } = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.get(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
