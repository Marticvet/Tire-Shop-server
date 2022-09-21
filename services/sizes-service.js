import serviceErrors from "./service-errors,.js";

const getModelsWithSizes =  (sizesData) => {
    return async (data) => {
        const { season, manufacturer } = data;
        const sql = `SELECT 
        t.id,
        t.quantity AS tire_quantity,
		t.loudness_level as tire_loudness_level,
        t.price as tire_price,
        t.load_index as tire_load_index,
        t.speed_rating as tire_speed_rating,
        t.model_id as tire_model_id,
        s.season as tire_season,
        tm.name as model_name ,
        tm.image_url AS model_imageUrl,
		tm.image_url as manufacturer_imageUrl,
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
        where width = ? and height = ? and diameter = ?
        and s.season like '%${season}%'
        and m.name like '%${manufacturer}%'`;
        const models = await sizesData.getModelsWithSizes(data, sql);

        if (models.length === 0) {
            return {
                error: serviceErrors.RECORD_NOT_FOUND,
                models: null,
            };
        }

        return  { error: null, models: models };
    };
};
const getSizesByModelId = (sizesData) => {
    return async (modelId) => {
        const sql = `SELECT 
        t.id,
        t.load_index,
        t.speed_rating,
        tm.id as tire_model_id,
        t.quantity as tire_quantity,
        t.dimention_id as tire_dimention_id,
        d.width as dimention_width,
        d.height as dimention_height,
        d.diameter as dimention_diameter
    FROM
        tire AS t
            LEFT JOIN
        model AS tm ON tm.id = t.model_id
            LEFT JOIN
        manufacturer AS m ON m.id = tm.manufacturer_id
            LEFT JOIN
        dimension AS d ON d.id = t.dimention_id
where tm.id = ?`;
        return await sizesData.getSizesByModelId(modelId, sql);
    };
};

export default {
    getModelsWithSizes,
    getSizesByModelId,
};
