import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PORT } from "./config.js";
import tiresController from "./controllers/tires-controller.js";
import sizesController from "./controllers/sizes-controller.js";
import searchController from "./controllers/search-controller.js";
import passport from "passport";
import usersController from "./controllers/users-controller.js";

const app = express();

// CORS Policy and Body Parser Third-party Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

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

app.listen(process.env.PORT || PORT, () => console.log(`App's working`));
