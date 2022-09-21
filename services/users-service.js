import pool from "../data/pool.js";
import bcrypt from "bcrypt";
import serviceErrors from "../services/service-errors,.js";

const getAllUsers = async () => {
    const sql = "SELECT * FROM USER";
    return await new Promise((resolve) => {
        pool.query(sql, (error, result) => {
            if (error) {
                throw error;
            }
            resolve(result);
        });
    });
};

const getUserCartItems = (usersData) => {
    return async (userId) => {
        const getUserById = "SELECT user_id FROM USER where user.user_id = ?";

        const user_id = await usersData.getBy(getUserById, userId);

        if (!user_id) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                user: null,
            };
        }

        const sql = `SELECT 
        user_basket.id,
        user_basket.user_id,
        user_basket.quantity,
        user_basket.tire_id,
        user.email,
        user.first_name,
        user.last_name,
        t.id AS tire_id,
        t.loudness_level AS tire_loudness_level,
        t.price AS tire_price,
        t.quantity AS tire_quantity,
        t.load_index AS tire_load_index,
        t.speed_rating AS tire_speed_rating,
        t.model_id AS tire_model_id,
        s.season AS tire_season,
        tm.name AS model_name,
        tm.image_url AS model_imageUrl,
        tm.description AS model_description,
        m.name AS manufacturer_name,
        d.width AS dimention_width,
        d.height AS dimention_height,
        d.diameter AS dimention_diameter,
        fe.class AS fuel_efficiency,
        g.rating AS grip_rating,
        ct.name AS car_type
    FROM
        tires_shop_idea2.user_basket AS user_basket
            LEFT JOIN
        user ON user.user_id = user_basket.user_id
            LEFT JOIN
        tire AS t ON t.id = user_basket.tire_id
            LEFT JOIN
        season AS s ON s.id = t.season_id
            LEFT JOIN
        model AS tm ON tm.id = t.model_id
            LEFT JOIN
        manufacturer AS m ON m.id = tm.manufacturer_id
            LEFT JOIN
        dimension AS d ON d.id = t.dimention_id
            LEFT JOIN
        fuel_efficiency AS fe ON fe.id = t.fuel_efficiency_id
            LEFT JOIN
        grip AS g ON g.id = t.wet_traction_rating
            LEFT JOIN
        car_type AS ct ON ct.id = t.car_type
        
        where user.user_id = ?`;
        const models = await new Promise((resolve) => {
            pool.query(sql, [userId], (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
        });

        if (models && models.length === 0) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                models: null,
            };
        } else if (!models) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                models: null,
            };
        }

        return { error: null, models: models };
    };
};

const addItemInShoppingCart = () => {
    return async ({ quantity, user_id, tire_id }) => {
        const sql = `insert into user_basket (quantity, user_id, tire_id)
        values (?, ?, ?)`;
        const item = await new Promise((resolve) => {
            pool.query(sql, [quantity, user_id, tire_id], (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
        });

        if (Object.keys(item).length === 0) {
            return {
                error: serviceErrors.OPERATION_NOT_PERMITTED,
                item: null,
            };
        }

        return { error: null, item: item };
    };
};

const editItemQuantity = () => {
    return async (id, quantity) => {
        const updateSql = `update user_basket set quantity= ? where id = ?`;
        const updatedItem = await new Promise((resolve) => {
            pool.query(updateSql, [quantity, id], (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
        });

        if (Object.keys(updatedItem).length === 0) {
            return {
                error: serviceErrors.OPERATION_NOT_PERMITTED,
                item: null,
            };
        }

        const getSql = `SELECT 
        user_basket.id,
        user_basket.user_id,
        user_basket.quantity,
        user_basket.tire_id,
        user.email,
        user.first_name,
        user.last_name,
        t.id AS tire_id,
        t.loudness_level AS tire_loudness_level,
        t.price AS tire_price,
        t.quantity AS tire_quantity,
        t.load_index AS tire_load_index,
        t.speed_rating AS tire_speed_rating,
        t.model_id AS tire_model_id,
        s.season AS tire_season,
        tm.name AS model_name,
        tm.image_url AS model_imageUrl,
        tm.description AS model_description,
        m.name AS manufacturer_name,
        d.width AS dimention_width,
        d.height AS dimention_height,
        d.diameter AS dimention_diameter,
        fe.class AS fuel_efficiency,
        g.rating AS grip_rating,
        ct.name AS car_type
    FROM
        tires_shop_idea2.user_basket AS user_basket
            LEFT JOIN
        user ON user.user_id = user_basket.user_id
            LEFT JOIN
        tire AS t ON t.id = user_basket.tire_id
            LEFT JOIN
        season AS s ON s.id = t.season_id
            LEFT JOIN
        model AS tm ON tm.id = t.model_id
            LEFT JOIN
        manufacturer AS m ON m.id = tm.manufacturer_id
            LEFT JOIN
        dimension AS d ON d.id = t.dimention_id
            LEFT JOIN
        fuel_efficiency AS fe ON fe.id = t.fuel_efficiency_id
            LEFT JOIN
        grip AS g ON g.id = t.wet_traction_rating
            LEFT JOIN
        car_type AS ct ON ct.id = t.car_type
        
        where user_basket.id = ?`;

        const getUpdatedItem = await new Promise((resolve) => {
            pool.query(getSql, [id], (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
        });

        if (getUpdatedItem.length === 0) {
            return {
                error: serviceErrors.OPERATION_NOT_PERMITTED,
                item: null,
            };
        }

        return { error: null, item: getUpdatedItem[0] };
    };
};

const deleteItem = () => {
    return async (id) => {
        const deleteSql = `delete from user_basket where id = ?`;
        const deletedItem = await new Promise((resolve) => {
            pool.query(deleteSql, id, (error, result) => {
                if (error) {
                    throw error;
                }
                resolve(result);
            });
        });

        if (deletedItem.affectedRows === 0) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
            };
        }

        return { error: null };
    };
};

const signInUser = (usersData) => {
    return async (loginData) => {
        const { email, password } = loginData;
        const sql = `SELECT * FROM user where user.email = ?`;
        const user = await usersData.getBy(sql, email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return {
                error: serviceErrors.INVALID_SIGNIN,
                user: null,
            };
        }

        return {
            error: null,
            user: user,
        };
    };
};

const createUser = (usersData) => {
    return async (userCreate) => {
        const { email, password, first_name, last_name } = userCreate;
        const sql = "SELECT user_id, email FROM USER where user.email = ?";

        const existingUser = await usersData.getBy(sql, email);

        if (existingUser) {
            return {
                error: serviceErrors.DUPLICATE_RECORD,
                user: null,
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await usersData.create(
            email,
            passwordHash,
            first_name,
            last_name
        );

        return { error: null, user: user };
    };
};

const updateUser = (usersData) => {
    return async (id, userUpdate) => {
        const { email, password, first_name, last_name } = userUpdate;
        const getUserById =
            "SELECT user_id, email FROM USER where user.user_id = ?";

        const getUser = await usersData.getBy(getUserById, id);

        if (!getUser) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                user: null,
            };
        }

        const getUserByEmail = "SELECT * FROM USER where user.email = ?";

        if (!email && !!(await usersData.getBy(getUserByEmail, email))) {
            return {
                error: serviceErrors.DUPLICATE_RECORD,
                user: null,
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const updated = {
            ...getUser,
            email,
            passwordHash,
            first_name,
            last_name,
        };
        const _ = await usersData.update(updated, getUser.user_id);

        return { error: null, user: updated };
    };
};
// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getAllUsers,
    getUserCartItems,
    addItemInShoppingCart,
    editItemQuantity,
    deleteItem,
    createUser,
    updateUser,
    signInUser,
};
