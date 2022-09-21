import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./config.js";
import tiresController from "./controllers/tires-controller.js";
import sizesController from "./controllers/sizes-controller.js";
import searchController from "./controllers/search-controller.js";
import passport from "passport";
import usersController from "./controllers/users-controller.js";

const app = express();
const cors = require('cors');

// CORS Policy and Body Parser Third-party Middleware
app.use(cors(), bodyParser.json());
app.use(passport.initialize());

app.use("/tires/manufacturers", tiresController);
app.use("/sizes", sizesController);
app.use("/searchBy", searchController);
app.use('/users', usersController);

app.use((err, req, res, next) => {
    res.status(500).send({
        message:
            "An unexpected error occurred, our developers are working hard to resolve it.",
    });
});

app.all("*", (req, res) => {
    res.status(404).send({ message: "Resource not found!" });
});

app.listen(80, () => console.log(`Listening on port 80`));
