import express from "express";
import searchData from "../data/search-data.js";
import searchService from "../services/search-service.js";
import serviceErrors from "../services/service-errors,.js";

const searchController = express.Router();

// search model by name
searchController.get("/", async (req, res) => {
    const {manufacturer, modelName } = req.query;

    const { error, models } = await searchService.searchedBy(searchData)(
        manufacturer, modelName
    )

    if (error === serviceErrors.RECORD_NOT_FOUND) {
        res.status(404).send({
            message: "Models with such name not found!",
        });
    } else {
        res.status(200).send(models);
    }
});

export default searchController;
