const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const storage = multer.memoryStorage();
const readFileAsync = promisify(fs.readFile);
const upload = multer({ dest: '/var/www/html/imagenes' });

app.use(express.json());

const sequelize = new Sequelize('supervalues', 'adminputty', 'putty', {
  host: '54.81.81.83',
  dialect: 'mysql'
});

app.get('/api/v1/itinerario/last', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT max(id_Itinerario) AS lastItinerario FROM itinerario_caso;');
    const lastItinerario = results[0].lastItinerario;

    const [casosResults] = await sequelize.query(`SELECT id_Caso FROM itinerario_caso WHERE id_Itinerario = ${lastItinerario};`);
    const idCasos = casosResults.map(caso => caso.id_Caso);

    res.json({
      status: 200,
      data: {
        idCasos,
        idItinerario: lastItinerario
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/v1/caso/:idCaso', (req, res) => {
  const idItinerario = req.query.itinerario;
  const idCaso = req.params.idCaso;

  // Ejecutar la consulta usando Sequelize
  sequelize.query(`
    SELECT * FROM casos
    JOIN itinerario_caso ON casos.id = itinerario_caso.id_caso
    WHERE id_itinerario = ${idItinerario} AND casos.id = ${idCaso}
  `)
    .then(([results, metadata]) => {
      // Manejar la respuesta
      res.json(results);
    })
    .catch(error => {
      // Manejar errores
      res.status(500).json({ error: 'Error en el servidor' });
    });
});

app.get('/api/v1/casos/pedir', async (req, res) => {
  try {
    let query = 'SELECT id,nombre FROM casos'; // Consulta SQL inicial sin filtro

    const casos = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    res.json(casos);

  } catch (error) {

    res.status(500).json({ error: 'Error al obtener los casos' });
  }
});

// Ruta para obtener todos los profesores
app.get('/profesores', async (req, res) => {
  const id = req.query.id; // Obtener el valor del parámetro id_P de la URL

  let query = 'SELECT * FROM profesores'; // Consulta SQL inicial sin filtro

  if (id) {
    query = `SELECT * FROM profesores WHERE id >= ${id}`; // Construir la consulta con filtro si se proporciona el parámetro id_P
  }
  try {
    const profesores = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

app.post('/profesores', async (req, res) => {
  try {
    const { nombre_P, email, tipo_P } = req.body[0]; // Obtener los datos del nuevo profesor del cuerpo de la solicitud

    const resultado = await sequelize.query('INSERT INTO profesor (nombre_P, email, tipo_P) VALUES (?,?,?)', {
      replacements: [nombre_P, email, tipo_P]
    }); // Insertar el nuevo profesor en la base de datos

    if (resultado[0].affectedRows > 0) {
      res.status(201).json({ message: 'Profesor insertado correctamente' });
    } else {
      console.error(error.message)
      res.status(500).json({ error: 'Error al insertar el profesor' });
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: 'Error al insertar el profesor' });
  }
});

app.post('/api/v1/itinerario/insertar', async (req, res) => {
  try{
  const {nombre } = req.body;
  const caso = await sequelize.query('INSERT INTO itinerarios (nombre) VALUES (?)', {
    replacements: [nombre]
 });
 let query="select max(id) from itinerario;";
 const ultimoItinerario=await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
  const array=req.body.array;
  for (const element of array) {
    const caso = await sequelize.query('INSERT INTO itinerario_caso (id_itinerario,id_caso) VALUES (?,?)', {
      replacements: [ultimoItinerario,element]
   });
  }
  res.json(array);
  console.log(array);
}catch(error){
  console.log(error);
}
});

app.post('/caso/nuevo', async (req, res) => {
  console.log(req.body[0]);
  const { id_valor, nombre, texto_intro } = req.body[0];

  const caso = await sequelize.query('INSERT INTO casos (id_valor,nombre,texto_intro) VALUES (?,?,?)', {
    replacements: [id_valor, nombre, texto_intro]
  });

});

app.get('/api/v1/casos', async (req, res) => {

  let query = 'SELECT * FROM casos'; // Consulta SQL inicial sin filtro

  try {
    const profesores = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los casos' });
  }
});

app.post('/api/v1/caso/cambiar',upload.array('imagenes', 6), async (req, res) => {
  const { id,
    id_valor,
    nombre,
    texto_intro,
    texto_Opcion_Basica,
    texto_Opcion_Avanzada,
    texto_Opcion_pasiva,
    texto_Opcion_Agresiva,
    texto_Redencion_Pasiva,
    texto_Redencion_Buena_Pasiva,
    texto_Redencion_Mala_Pasiva,
    texto_Redencion_Agresiva,
    texto_Redencion_Buena_Agresiva,
    texto_Redencion_Mala_Agresiva } = req.body;

  const imagenes = req.files;
  const imagen1=imagenes[0];
  const imagen2=imagenes[1];
  const imagen3=imagenes[2];
  const imagen4=imagenes[3];
  const imagen5=imagenes[4];
  const imagen6=imagenes[5];


  try {
    // Convertir los datos de las imagenes en un objeto Buffer
    const imagenBasica = imagen1.buffer;
    const imagenAvanzada = imagen2.buffer;
    const imagenAgresiva = imagen3.buffer;
    const imagenPasiva = imagen4.buffer;
    const imagenRedencionPasiva = imagen5.buffer;
    const imagenRedencionAgresiva = imagen6.buffer;


    // Guardar la imagen en la base de datos
    const resultado = await sequelize.query('update casos set id_valor=?, nombre=?, texto_intro=?,texto_Opcion_Basica=?,texto_Opcion_Avanzada=?,texto_Opcion_pasiva=?,texto_Opcion_Agresiva=?,texto_Redencion_Pasiva=?,texto_Redencion_Buena_Pasiva=?,texto_Redencion_Mala_Pasiva=?,texto_Redencion_Agresiva=?,texto_Redencion_Buena_Agresiva=?,texto_Redencion_Mala_Agresiva=?,imagen_Opcion_Basica=?,imagen_Opcion_Avanzada=?,imagen_Opcion_Agresiva=?,imagen_Opcion_Pasiva=?,imagen_Redencion_Pasiva=?,imagen_Redencion_Agresiva=? where id=?', {
      replacements: [id_valor,
      nombre,
      texto_intro,
      texto_Opcion_Basica,
      texto_Opcion_Avanzada,
      texto_Opcion_pasiva,
      texto_Opcion_Agresiva,
      texto_Redencion_Pasiva,
      texto_Redencion_Buena_Pasiva,
      texto_Redencion_Mala_Pasiva,
      texto_Redencion_Agresiva,
      texto_Redencion_Buena_Agresiva,
      texto_Redencion_Mala_Agresiva,
      imagenBasica,
      imagenAvanzada,
      imagenAgresiva,
      imagenPasiva,
      imagenRedencionPasiva,
      imagenRedencionAgresiva,
       id]
    });

    res.json("Actualizado");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

app.put('/pruebita/imagenes', upload.array('imagenes', 7), (req, res) => {
  try {
    // Accede a los archivos subidos a través de req.files
    const files = req.files;
    console.log('Archivos subidos:', files);

    res.status(200).json({ message: 'Imágenes cargadas exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cargar las imágenes' });
  }
});






const port = 3000;

app.listen(port, () => {
  console.log(`Servidor Express funcionando en el puerto ${port}`);
});

