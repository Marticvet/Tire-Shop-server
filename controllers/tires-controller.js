import express from "express";
import tiresService from "../services/tires-service.js";
import tiresData from "../data/tires-data.js";
import serviceErrors from "../services/service-errors,.js";

const tiresController = express.Router();

tiresController
    // get all tires manufacturers
    .get("/", async (req, res) => {
        res.status(200).send(await tiresService.getAllManufacturers(tiresData));
    })

    // get manufacturer by name
    .get("/:name", async (req, res) => {
        const { name } = req.params;

        const { error, manufacturer } =
            await tiresService.getManufacturerByName(tiresData)(name);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({ message: "Manufacturer not found!" });
        } else {
            res.status(200).send(manufacturer);
        }
    })

    // get all models by manufacturer
    .get("/:name/tire-models", async (req, res) => {
        const { name } = req.params;

        const { error, models } = await tiresService.getAllModelsByManufacturer(
            tiresData
        )(name);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({
                message: `Models with manufacturer ${
                    name[0].toUpperCase() + name.slice(1)
                } not found!`,
            });
        } else {
            res.status(200).send(models);
        }
    })

    // get manufacturer model by tireId and all available sizes
    .get("/:name/tire-model/:tireId", async (req, res) => {
        const { name, tireId } = req.params;

        const { error, model } = await tiresService.getManufacturerModelById(
            tiresData
        )(name, tireId);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({
                message: `Model not found!`,
            });
        } else {
            res.status(200).send(model);

        }
    });

export default tiresController;
