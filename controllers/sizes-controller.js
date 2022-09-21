import express from "express";
import sizesData from "../data/sizes-data.js";
import serviceErrors from "../services/service-errors,.js";
import sizesService from "../services/sizes-service.js";

const sizesController = express.Router();

sizesController
    // get models with specific sizes and criterias
    .get("/", async (req, res) => {
        const { error, models } = await sizesService.getModelsWithSizes(
            sizesData
        )(req.query);

        if (error === serviceErrors.RECORD_NOT_FOUND) {
            res.status(404).send({
                message: "Models with such sizes not found!",
            });
        } else {
            res.status(200).send(models);
        }
    })

    // get all sizes by modelId
    .get("/model-sizes/:modelId", async (req, res) => {
        const modelId = req.params.modelId

        res.status(200).send(await sizesService.getSizesByModelId(
            sizesData
        )(modelId));
    });

export default sizesController;
