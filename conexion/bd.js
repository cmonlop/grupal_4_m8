import pg from "pg";
const {Pool} = pg;
//punto 18
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "YOUR_password",
  database: "joyas",
  port: 5432,
  max: 20, // máximo de 20 clientes
  idleTimeoutMillis: 5000, // 5 segundos de inactividad
  connectionTimeoutMillis: 2000, // 2 segundos de espera
});
pool.connect();

async function close(){
    await pool.close();
}

export { pool };