import pool from "../data/pool.js";
import serviceErrors from "./service-errors,.js";

const getAllManufacturers = async (tiresData) => {
    const sql = "SELECT * FROM manufacturer";
    return await new Promise((resolve) => {
        pool.query(sql, async (error, results) => {
            if (error) {
                throw error;
            }
            resolve(results);
        });
    });
};

const getManufacturerByName = (tiresData) => {
    return async (name) => {
        const sql = "SELECT * FROM manufacturer where name = ?";
        const manufacturer = await tiresData.searchedBy(sql, name);

        if (!manufacturer[0]) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                manufacturer: null,
            };
        }

        return { error: null, manufacturer: manufacturer };
    };
};

const getAllModelsByManufacturer = (tiresData) => {
    return async (name) => {
        const sql = `SELECT 
        t.id,
        t.model_id AS tire_model_id,
        t.loudness_level AS tire_loudness_level,
        t.price AS tire_price,
        t.quantity AS tire_quantity,
        t.load_index AS tire_load_index,
        t.speed_rating AS tire_speed_rating,
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
        tire AS t
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
    WHERE
        m.name = ?
        group by tire_model_id`;

        const models = await tiresData.searchedBy(sql, name);

        if (models.length === 0) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                models: null,
            };
        }

        return { error: null, models: models };
    };
};

const getManufacturerModelById = (tiresData) => {
    return async (name, tireId) => {
        const sql = `SELECT 
		t.id,
        t.loudness_level as tire_loudness_level,
        t.price as tire_price,
        t.quantity as tire_quantity,
        t.load_index as tire_load_index,
        t.speed_rating as tire_speed_rating,
        t.model_id as tire_model_id,
        s.season as tire_season,
        tm.name as model_name,
        tm.image_url as model_imageUrl,
        tm.description as model_description,
        m.name as manufacturer_name,
        d.width as dimention_width,
        d.height as dimention_height,
        d.diameter as dimention_diameter,
        fe.class as fuel_efficiency,
        g.rating as grip_rating,
        ct.name as car_type
FROM
    tire AS t
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
		left join
	car_type as ct on ct.id = t.car_type
            where m.name = ? and t.id = ?`; /*t.id = ?*/

        const model = await tiresData.searchedBy(sql, [name, tireId]);

        if (!model[0]) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                model: null,
            };
        }

        return { error: null, model: model };
    };
};

export default {
    getAllManufacturers,
    getManufacturerByName,
    getAllModelsByManufacturer,
    getManufacturerModelById,
};
