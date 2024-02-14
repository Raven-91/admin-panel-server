const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRouter);

const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://igorkarchinskiy:5Jm6L8eNnNm8p8iY@cluster0.mssnxm3.mongodb.net/`)
        app.listen(PORT, () => {
            console.log(`server started on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
}

start();