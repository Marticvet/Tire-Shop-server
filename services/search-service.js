import serviceErrors from "./service-errors,.js";

const searchedBy = (searchData) => {
    return async (manufacturer,modelName) => {
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
        where tm.name like '%${modelName}%' 
            group by tire_model_id`;

        const models = await searchData.searchedBy(
            modelName,
            sql
        );

        if (models.length === 0) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                models: null,
            };
        }

        return { error: null, models: models };
    };
};

export default {
    searchedBy,
};
