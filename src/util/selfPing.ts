console.log("\n⚙️  Environment:", process.env.NODE_ENV);

// Self-ping to keep the app awake on Render
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Starting self-ping loop...");
  setInterval(() => {
    fetch("https://calendar-money-api.onrender.com")
      .then(() => console.log("💚 Auto-ping exitoso"))
      .catch((err) => console.error("❌ Auto-ping fallido", err));
  }, 30000); // 30 seconds
}
