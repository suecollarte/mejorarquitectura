import  express from 'express';
import exphbs from 'express-handlebars';
import { config } from './src/utils/config.js';
import * as path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { fileURLToPath } from "url";
/*** normalize */
import { producto } from './DB/data.js';
import { mensajesData } from './DB/datamensaje.js';
import { print } from "./utils/functions.js";

import util from 'util';

//session persistencia mongo


const app = express();



/* --- Middlewares express ---*/
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('./public'));


/* --- Handlebars ---*/
import { engine } from 'express-handlebars';
app.engine('hbs', engine({
  defaultLayout: 'main',
  layoutsDir: './views/layouts',
  partialsDir: './views/partials',
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', './views');


/*------------ Rutas ----*/

app.use('/api/v1/operaciones', routerOperaciones);

/*Agregamos routers a la app*/
app.all('*', (req, res)=>{
  res.status(404).json({
      status: 404,
      route: `${req.method} ${req.url}`,
      msg: `No implemented route`
  })
});

/* ---------------------- WebSocket ----------------------*/
// Import de httpServer y socketIo
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import routerOperaciones from './src/routers/operaciones.routes.js';


const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);


io.on("connection", async (socket)=>{

  console.log(`Nuevo cliente conectados! ${socket.id}`);
  
    socket.emit('from-server-mensaje', {mensajesData});
  
   socket.on('from-client-mensaje', mensaje => {
    mensajesData.push(mensaje);
     io.sockets.emit('from-server-mensaje', {mensajesData});
   });

})


/* ---------------------- Server ---------------------- */
const PORT = config.server.PORT;
const server = app.listen(PORT, () => {
  console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
server.on('error', error=>{
  console.error(`Error en el servidor ${error}`);
});