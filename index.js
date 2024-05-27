const { default: axios } = require('axios');
const cors = require('cors');
const express = require('express');
var Storage = require('node-storage');
var store = new Storage('path/to/file');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors());
const puerto = process.env.PORT || 3000;
const usuarios = [
  {
    id: 1,
    nombreCompleto: "Juan Pérez",
    clave: "mi123",
    nombreUsuario: "juanperez"
  },
  {
    id: 2,
    nombreCompleto: "María González",
    clave: "miclave secreta",
    nombreUsuario: "mariagonzalez"
  },
  {
    id: 3,
    nombreCompleto: "Pedro López",
    clave: "password1234",
    nombreUsuario: "pedrolopez"
  }
];
const auth = (req, res, next) => {
    try{
      const storeVal = store.get('token');
      const token = jwt.verify(storeVal, process.env.CLAVE_SECRETA);
      req.token = token;
      next();
    }catch(error){
      res.status(401).send({error: 'Se vencio la autenticación'});
    }

};

// rutas de express
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usuarioEncontrado = usuarios.find(usuario =>
    usuario.nombreUsuario === username && usuario.clave === password
  );
  const payload = {
    username: usuarioEncontrado?.username,
  };
  if (usuarioEncontrado) {
    const token = jwt.sign(payload, process.env.CLAVE_SECRETA, { expiresIn: '1m' })
    store.put('token', token);
    res.redirect('/dashboard?id=' + usuarioEncontrado.id);
  } else {
    res.status(401).send('Credenciales incorrectas');
  }
});
app.get('/dashboard', auth, async (req, res) => {
  const usuarioId = req.query.id;
  const respuestaServidor = await axios.get(`http://localhost:3000/detail/${usuarioId}`);
  const detalle = respuestaServidor.data;
  res.send(`Estas en el dashboard de ${detalle.nombreCompleto}`);
});
app.get('/detail/:id', auth, async (req, res) => {
  const usuarioId = req.params.id;
  const findUser = usuarios.find(user => user.id == usuarioId);
  res.send(findUser);
})

// funcion para autenticar
app.listen(puerto, () => console.log(`servidor desplegado en el puerto ${puerto}`))
