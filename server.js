import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./Database/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path from "path";

dotenv.config();

//Database Config
connectDB();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use(express.static(path.join(__dirname, "../client/dist")));

//rest api
app.use("*", function (req, resp) {
  resp.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.get("/about", (Req, resp) => {
  resp.send("Hello from About Page");
});

//PORT
const PORT = process.env.PORT;
app.listen(PORT, (req, resp) => {
  console.log(
    `Server running on ${process.env.DEV_MODE} mode:- http://localhost:${PORT}`
      .bgCyan.white
  );
});
