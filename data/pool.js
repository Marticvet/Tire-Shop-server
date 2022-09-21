import mysql from 'mysql'
import { DB_CONFIG } from '../config.js';

const pool = mysql.createConnection(DB_CONFIG);

export default pool;