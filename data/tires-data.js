import pool from "./pool.js";

// Reject the promise on query failure instead of throwing inside a callback.
// A callback throw can terminate the Node.js process and produce a Render 502.
const query = (sql, values = []) => new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
        if (error) {
            return reject(error);
        }
        resolve(results);
    });
});

const getAllManufacturers = () => query("SELECT * FROM manufacturer");

const searchedBy = (sql, values) => query(sql, values);

export default {
    getAllManufacturers,
    searchedBy,
};
