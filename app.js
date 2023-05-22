const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

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
    console.log(res);
  } catch (error) {
    console.error(error);
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
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    });
});

app.get('/api/v1/casos/pedir', async (req, res) => {
  try {
    let query = 'SELECT id,nombre FROM casos'; // Consulta SQL inicial sin filtro

const casos = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
res.json(casos);
    console.log(res); // Mostrar en la consola del servidor
  } catch (error) {
    console.error('Error al obtener los casos:', error);
    res.status(500).json({ error: 'Error al obtener los casos' });
  }
});

// Ruta para obtener todos los profesores
app.get('/profesores', async (req, res) => {
    const id_P = req.query.id_P; // Obtener el valor del parámetro id_P de la URL

    let query = 'SELECT * FROM profesores'; // Consulta SQL inicial sin filtro

    if (id_P) {
      query = `SELECT * FROM profesor WHERE id_P >= ${id_P}`; // Construir la consulta con filtro si se proporciona el parámetro id_P
    }
  try {
const profesores = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    res.json(profesores);
  } catch (error) {
    console.error(error);
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
  const array = req.body;

  for (const element of array) {
    console.log(element);
  }
  res.json(array);
  console.log(array);
});

app.post('/api/v1/caso/cambiar', async (req, res) => {
 
  res.json(array);
  console.log(array);
});

const port = 3001;

app.listen(port, () => {
  console.log(`Servidor Express funcionando en el puerto ${port}`);
});