import mysql from "mysql2"; 
import { DB_CONFIG } from '../config.js';

const pool = mysql.createPool(DB_CONFIG);

export default pool;