import express, { type Express } from "express";
import dotenv from "dotenv";
import mainRouter from "./routes/app.js";
import cors from 'cors';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000

app.use(cors());
app.use(express.json());
app.use("/api", mainRouter);

export { app };
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
