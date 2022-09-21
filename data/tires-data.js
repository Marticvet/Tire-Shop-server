import pool from "./pool.js";

const getAllManufacturers = async () => {
    const sql = "SELECT * FROM manufacturer";
    return await new Promise((resolve) => {
        pool.query(sql, (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result);
        });
    });
};

const searchedBy = async (sql, values) => {
    return await new Promise((resolve) => {
        pool.query(sql, values, (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result);
        });
    });
};

export default {
    getAllManufacturers,
    searchedBy,
};
