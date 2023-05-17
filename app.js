const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

const sequelize = new Sequelize('supervalues', 'adminputty', 'putty', {
  host: '54.81.81.83',
  dialect: 'mysql'
});



// Ruta para obtener todos los profesores
app.get('/profesores', async (req, res) => {
    const id_P = req.query.id_P; // Obtener el valor del parámetro id_P de la URL

    let query = 'SELECT * FROM profesor'; // Consulta SQL inicial sin filtro

    if (id_P) {
      query = `SELECT * FROM profesor WHERE id_P >= ${id_P}`; // Construir la consulta con filtro si se proporciona el parámetro id_P
    }
  try {
const profesores = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    console.log(profesores);
    res.json(profesores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor Express funcionando en el puerto ${port}`);
});