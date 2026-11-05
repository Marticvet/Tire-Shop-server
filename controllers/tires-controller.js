import express from "express";
import tiresService from "../services/tires-service.js";
import tiresData from "../data/tires-data.js";
import serviceErrors from "../services/service-errors,.js";

const tiresController = express.Router();

// Express 4 does not automatically forward rejected async handlers to error middleware.
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve()
        .then(() => handler(req, res, next))
        .catch(next);
};

tiresController
    // Get all tire manufacturers.
    .get("/", asyncHandler(async (req, res) => {
        const manufacturers = await tiresService.getAllManufacturers(tiresData);
        res.status(200).send(manufacturers);
    }))

    // Get manufacturer by name.
    .get("/:name", asyncHandler(async (req, res) => {
        const { name } = req.params;
        const { error, manufacturer } =
            await tiresService.getManufacturerByName(tiresData)(name);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            return res.status(404).send({ message: "Manufacturer not found!" });
        }

        return res.status(200).send(manufacturer);
    }))

    // Get all models by manufacturer.
    .get("/:name/tire-models", asyncHandler(async (req, res) => {
        const { name } = req.params;
        const { error, models } =
            await tiresService.getAllModelsByManufacturer(tiresData)(name);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            return res.status(404).send({
                message: `Models with manufacturer ${name[0].toUpperCase() + name.slice(1)} not found!`,
            });
        }

        return res.status(200).send(models);
    }))

    // Get one tire model by ID and all available sizes.
    .get("/:name/tire-model/:tireId", asyncHandler(async (req, res) => {
        const { name, tireId } = req.params;
        const { error, model } =
            await tiresService.getManufacturerModelById(tiresData)(name, tireId);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            return res.status(404).send({ message: "Model not found!" });
        }

        return res.status(200).send(model);
    }));

export default tiresController;
