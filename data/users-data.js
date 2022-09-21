import pool from "./pool.js";

const getBy = async (sql, value) => {
    return await new Promise((resolve) => {
        pool.query(sql, [value], (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result[0]);
        });
    });
};

const create = async (email, password, first_name, last_name) => {
    const sql = `INSERT INTO USER (email, password, first_name, last_name) values(? , ?, ?, ?)`;

    await new Promise((resolve) => {
        pool.query(
            sql,
            [email, password, first_name, last_name],
            (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            }
        );
    });

    const getLastId = await new Promise((resolve) => {
        pool.query("SELECT LAST_INSERT_ID()", (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result[0]);
        });
    });

    return {
        userId: getLastId["LAST_INSERT_ID()"],
        email: email,
        first_name: first_name,
        last_name: last_name,
    };
};

const update = async (
    { email, passwordHash, first_name, last_name },
    userId
) => {
    const sql = `UPDATE USER SET email = ?, password = ?, first_name = ?, last_name = ? where user.user_id = ?`;

    await new Promise((resolve) => {
        pool.query(
            sql,
            [email, passwordHash, first_name, last_name, userId],
            (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            }
        );
    });

    return {
        email: email,
    };
};

export default {
    getBy,
    create,
    update,
};
