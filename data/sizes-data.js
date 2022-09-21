import pool from "./pool.js";

const getModelsWithSizes = async (data, sql) => {
    const { width, height, diameter, season, manufacturer } = data;
    
    return await new Promise((resolve) => {
        pool.query(
            sql,
            [width, height, diameter, season, manufacturer],
            (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            }
        );
    });
};

const getSizesByModelId = async (modelId, sql) => {
    return await new Promise((resolve) => {
        pool.query(sql, modelId, (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result);
        });
    });
};

export default {
    getModelsWithSizes,
    getSizesByModelId,
};
