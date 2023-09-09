import express from "express";
import fileUpload from 'express-fileupload';
import sharp from "sharp";
import { Joya } from "./class/joyas.js";
import jwt from 'jsonwebtoken';
// import pg from "pg";

const app = express();
const joya = new Joya()

app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));

let secretKey = "1234";

/***********************************  RUTAS GET  ********************************************/

app.get('/v1/login', (req, res) => {
    res.send(`<html>
        <head>
            <title>Login</title>
        </head>
        <body>
            <form method = "POST" action = "/auth">
            Nombre: <input type = "text" name = "username"><br>
            Email: <input type = "email" name = "useremail"><br>
            Teléfono: <input type = "password" name = "phone"><br>
            <input type = "submit" value = "Iniciar sesión">
            </form>
        </body>
    </html>`)
});

/* PARA ENTRAR A UNA RUTA (p.e la ruta get http://localhost:3000/v1/joyas) CON EL TOKEN SE DEBE USAR DE LA SIGUIENTE MANERA: SE ESCRIBE LA RUTA http://localhost:3000/v1/joyas + ? + accesotoken + = + TOKEN

QUEDARÍA ASÍ:

http://localhost:3000/v1/joyas?accesotoken=PEGAR_EL_TOKEN */


app.get("/imagen", (req, res)=>{
    res.send(`<img src='/files/anillo1.png'>`)
});

app.get("/v1/joyas", validarToken, async (req,res)=>{
    try{
        res.status(200).json(await joya.listarTodo())
    }catch(error){
        res.sendStatus(400);
    }
});


app.get('/v1/joyas/nombre/:nombre', validarToken, async (req, res) => {
    try {
        res.status(200).json(await joya.filtrar1(req.params.nombre));
        
    } catch (error) {
        res.sendStatus(400)        
    }
});

app.get('/v1/joyas/material/:material', validarToken, async (req, res) => { 
    try {
        res.status(200).json(await joya.filtrarMaterial(req.params.nombre));
    
    } catch (error) {
         res.sendStatus(400)        
}
});

app.get("/v1/joyas/:id", validarToken, async (req, res) =>{
    try {
        res.status(200).json(await joya.listarId(req.params.nombre));
        
    } catch (error) {
        res.sendStatus(400)        
    }
});

/***********************************  RUTAS POST  ********************************************/

// RUTA QUE DEVUELVE EL TOKEN EN FORMATO JSON.

app.post('/auth', (req, res) => {
    const {username, useremail, phone} = req.body;
    const user = {username: username,
                useremail: useremail,
                phone: phone};
    
    const accessoToken = generarTokenAcceso(user);
        res.header('authorization', accessoToken).json({
            message: 'Usuario autenticado',
            token: accessoToken
    });
            
});

app.post("/v1/joyas", validarToken, async (req, res)=>{ 

    try {
        const {nombre, peso, precio, material} = req.body
        res.status(201).json(await joya.crear(nombre, peso, precio, material));
} catch (error) {
    res.sendStatus(400)        
}
});

/***********************************  RUTAS PUT  ********************************************/

app.put("/v1/joyas/:id", validarToken, async (req,res)=>{
    try{
        const id = req.params.id;
        // console.log(req.files);
        let EDFile = req.files.file;
        //console.log(EDFile)
        let i = 1;
        let nombreImg = `anillo${i}.png`;
        if(EDFile.mimetype == 'image/png'){
            const imagenURL = `/images/${Date.now()}-${EDFile.name}`;
            console.log(imagenURL);
            await EDFile.mv(`./public/files/${nombreImg}`);
            const {nombre, peso, precio, material} = req.body
            res.status(201).json(await joya.editar(id, nombre, peso, precio, material, imagenURL));
        }else{
            console.log("Error Formato Archivo 1")
        }

    }catch(error){
        res.sendStatus(400)
    }
});

app.put('/upload/:id', validarToken, async (req, res)=>{
    try{
        const id = req.params.id;
        // console.log(req.files);
        let EDFile = req.files.file;
        console.log(EDFile);
        //console.log(EDFile)
        let i = 1;
        let nombre = `anillo${i}.png`;
        if(EDFile.mimetype == 'image/png'){
            const imagenURL = `/images/${Date.now()}-${EDFile.name}`;
            console.log(imagenURL);
            async (imagenURL) => {
                  const image = sharp(imagenURL);
                  const metadata = await image.metadata();
              
                  const width = metadata.width;
                  const color = metadata.hasAlpha ? 'RGBA' : 'RGB';
                    console.log(width, color);
              };
            await EDFile.mv(`./public/files/${nombre}`);
            res.status(201).json(await joya.editarImg(id, imagenURL));
        }else{
            console.log("Error Formato Archivo 1")
        }
    }catch(error){
        res.sendStatus(400)
    }
//console.log(req);
});

/***********************************  RUTAS DELETE  ********************************************/

app.delete("/v1/joyas/:id", validarToken, async(req,res)=>{
    try{
        const resultado = await joya.eliminar(req.params.id);
        //punto 6
        const eliminacionExitosa = resultado >0
        res.json({success:eliminacionExitosa})
    }catch(error){
        res.sendStatus(400)
    }
    });


/***********************************  FUNCIONES JWT  ********************************************/

function generarTokenAcceso(user){
    return jwt.sign(user, secretKey, {expiresIn: '5m'});
};

function validarToken(req, res, next){
    const accesoToken = req.headers['authorization'] || req.query.accesotoken;
    if(!accesoToken){
        res.send('Acceso denegado.');
    }else{
        jwt.verify(accesoToken, secretKey, (err, user) => {
            if(err){
                res.send('Token expirado o incorrecto. Acceso denegado.');
            }else{
                req.user = user;
                next();
            }
        })
    }
};  


app.listen(3000, ()=>{
    console.log("Levantando servidor en puerto 3000")
});