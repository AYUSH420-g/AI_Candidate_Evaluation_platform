import express from "express"
import userRoute from "./routes/auth.route.js"
import adminRoute from "./routes/admin.route.js"
import recruiterRoute from "./routes/recruiter.route.js"
import InterviewRoute from "./routes/interview.route.js"
import connectDB from "./db.js";
import cors from "cors";
import fs from "fs";

// Load environment variables (.env) natively
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (e) {}
} else if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = (match[2] || "").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  });
}
connectDB();

const app=express();

app.use(cors());
app.use(express.json());


app.use("/auth",userRoute);
app.use("/interview",InterviewRoute);
app.use("/admin",adminRoute);
app.use("/recruiter",recruiterRoute);

const PORT=process.env.PORT || 5010
app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})