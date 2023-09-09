import { pool } from "../conexion/bd.js";
//punto 8
export class Joya{
    constructor(){
        this.id;
        this.nombre;
        this.peso;
        this.precio;
        this.material;
    }
    //punto 15
    async listarTodo(){
        // punto 1 
        const resultado = await pool.query('SELECT id, nombre, peso, precio, material FROM joya order by nombre');
        return resultado.rows;
    };

    async listarId(id){
        //punto 3
        console.log(id)
        const resultado = await pool.query("SELECT id, nombre, peso, precio, material from joya where id = $1", [id]);
        pool.release;
        return resultado.rows;
        
    };

    async crear(nombre, peso, precio, material){
        //punto 19
        const resultado = await pool.query("insert into joya (nombre, peso, precio, material) values ($1, $2, $3, $4) RETURNING id,nombre, peso, precio, material",[nombre, peso, precio, material]); 
        pool.release;
        return resultado.rows; 
    };

    async editar(id, nombre, peso, precio, material, imagenURL){
        //punto 19
        const resultado = await pool.query("update joya SET nombre = $2, peso = $3, precio = $4, material = $5, imagen = $6 WHERE id = $1 RETURNING id,nombre, peso, precio, material",[id, nombre, peso, precio, material, imagenURL]); 
        pool.release; 
        return resultado.rows; 
    };

    async editarImg(id, imagenURL){
        const resultado = await pool.query("update joya SET imagen = $2 WHERE id = $1 RETURNING id, imagen",[id, imagenURL]); 
        pool.release; 
        return resultado.rows; 
    };


    async eliminar(id){
            
        const resultado = await pool.query("delete from joya where id = $1", [id]);
        pool.release;
        console.log(resultado.rowCount)
        return resultado.rowCount;

    };

    // async filtrar(){

    //     const resultado = await pool.query("SELECT * FROM joya WHERE nombre like '%anillo%'");
    //     pool.release;
    //     return resultado.rows
    // }
    
    async filtrar1(nombre){

        const resultado = await pool.query("SELECT * FROM joya WHERE nombre = $1", [nombre]);
        pool.release;
        return resultado.rows
    }

    async filtrarMaterial(material){

        const resultado = await pool.query("SELECT * FROM joya WHERE material = $1", [material]);
        pool.release;
        return resultado.rows
    }
}