import express from 'express';
import collectionRouter from './routers/collectionRouter.js';

const app = express();

app.use(express.json());

// Routes
app.use('/collections', collectionRouter);

const PORT = process.env.PORT || 3000;
const ADDRESS = process.env.ADDRESS || "localhost";

app.listen(PORT, () => {
    console.log(`Server is running on port https://${ADDRESS}:${PORT}`);
});