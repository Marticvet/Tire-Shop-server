import pool from "./pool.js";

export const searchedBy = async (modelName, sql) => {
    return await new Promise((resolve) => {
            pool.query(sql, modelName, (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
    });
};

export default {
    searchedBy,
};
