const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const baseURL = 'http://54.81.81.83'; // Reemplaza con la URL base de tu API o servidor

// Ruta para obtener todos los profesores
app.get('/profesores', async (req, res) => {
  try {
    const id_P = req.query.id_P; // Obtener el valor del parámetro id_P de la URL

    let query = 'SELECT * FROM profesor'; // Consulta SQL inicial sin filtro

    if (id_P) {
      query = `SELECT * FROM profesor WHERE id_P >= ${id_P}`; // Construir la consulta con filtro si se proporciona el parámetro id_P
    }

    const response = await axios.get(`${baseURL}/profesores`, {
      params: { query }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

// Ruta para insertar un nuevo profesor
app.post('/profesores', async (req, res) => {
  try {
    const { nombre_P, email, tipo_P } = req.body;

    const response = await axios.post(`${baseURL}/profesores`, {
      nombre_P,
      email,
      tipo_P
    });

    if (response.status === 201) {
      res.json({ message: 'Profesor insertado correctamente' });
    } else {
      res.status(500).json({ error: 'Error al insertar el profesor' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al insertar el profesor' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor Express funcionando en el puerto ${port}`);
});
