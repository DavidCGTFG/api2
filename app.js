const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());


const sequelize = new Sequelize('supervalues', 'adminputty', 'putty', {
  host: '54.81.81.83',
  dialect: 'mysql'
});

app.get('/api/v1/itinerario/last', async (req, res) => {
  try {
    const [results] = await sequelize.query('select id_itinerario as lastItinerario from partidas where id=(select max(id) from partidas);');
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

app.post('/api/v1/caso/elegido', async (req, res) => {
  console.log(req.body.id);
  try {
    let query='select * from casos where id='+req.body.id+';';
    const caso = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    res.json(caso);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});



app.get('/api/v1/caso/:idCaso', (req, res) => {
  const idItinerario = req.query.itinerario;
  const idCaso = req.params.idCaso;

  // Ejecutar la consulta usando Sequelize
  sequelize.query(`
    SELECT casos.*,imagen_recompensa,imagen_fracaso,recompensa FROM casos
    JOIN valores on valores.id=id_valor
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
 let query="select max(id) as nuevo from itinerarios;";
 const ultimoItinerario=await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
  const array=req.body.array;

  for (const element of array) {
    const caso = await sequelize.query('INSERT INTO itinerario_caso (id_itinerario,id_caso) VALUES (?,?)', {
      replacements: [ultimoItinerario[0].nuevo,element]
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

app.post('/api/v1/caso/cambiar', upload.array('imagen', 6), async (req, res) => {
  const { id, id_valor, nombre, texto_intro, texto_Opcion_Basica, texto_Opcion_Avanzada, 
    texto_Opcion_Pasiva, texto_Opcion_Agresiva, texto_Redencion_Pasiva, texto_Redencion_Buena_Pasiva,
     texto_Redencion_Mala_Pasiva, texto_Redencion_Agresiva, texto_Redencion_Buena_Agresiva, 
     texto_Redencion_Mala_Agresiva } = req.body;
  const imagenes = req.files;
  const imagen1 = imagenes[0];
  const imagen2 = imagenes[1];
  const imagen3 = imagenes[2];
  const imagen4 = imagenes[3];
  const imagen5 = imagenes[4];
  const imagen6 = imagenes[5];

  try {
    const [results] = await sequelize.query('SELECT nombre AS valor FROM valores where id=?',{
      replacements:[id_valor]
    });
    const valor = results[0].valor;
    // Convertir los datos de las imágenes en un objeto Buffer
    const imagenBasica = imagen1.buffer;
    const imagenAvanzada = imagen2.buffer;
    const imagenAgresiva = imagen3.buffer;
    const imagenPasiva = imagen4.buffer;
    const imagenRedencionPasiva = imagen5.buffer;
    const imagenRedencionAgresiva = imagen6.buffer;

    const Client = require('ssh2-sftp-client');
    const privateKey = require('fs').readFileSync('key/pruebitaputty.ppk');
    const sftp = new Client();

    await sftp.connect({
      host: '44.205.198.225',
      port: 22,
      username: 'admin',
      privateKey:privateKey
    });


    // Guardar la imagen en la base de datos
    const resultado = await sequelize.query('update casos set id_valor=?, nombre=?, texto_intro=?,texto_Opcion_Basica=?,texto_Opcion_Avanzada=?,texto_Opcion_Pasiva=?,texto_Opcion_Agresiva=?,texto_Redencion_Pasiva=?,texto_Redencion_Buena_Pasiva=?,texto_Redencion_Mala_Pasiva=?,texto_Redencion_Agresiva=?,texto_Redencion_Buena_Agresiva=?,texto_Redencion_Mala_Agresiva=?,imagen_Opcion_Basica=?,imagen_Opcion_Avanzada=?,imagen_Opcion_Agresiva=?,imagen_Opcion_Pasiva=?,imagen_Redencion_Pasiva=?,imagen_Redencion_Agresiva=? where id=?', {
      replacements: [id_valor, 
        nombre, 
        texto_intro, 
        texto_Opcion_Basica, 
        texto_Opcion_Avanzada, 
        texto_Opcion_Pasiva,
         texto_Opcion_Agresiva,
          texto_Redencion_Pasiva,
           texto_Redencion_Buena_Pasiva, 
           texto_Redencion_Mala_Pasiva, 
           texto_Redencion_Agresiva, 
           texto_Redencion_Buena_Agresiva,
            texto_Redencion_Mala_Agresiva, 
            (valor+"_basica"+id+".jpg"),
            (valor+"_avanzada"+id+".jpg"),
            (valor+"_agresiva"+id+".jpg"),
            (valor+"_pasiva"+id+".jpg"),
            (valor+"_redencion_pasiva"+id+".jpg"),
            (valor+"_redencion_agresiva"+id+".jpg"),id]

            
    });
    await sftp.put(imagenBasica, '/var/www/html/imagenes/' + (valor+"_basica"+id+".jpg"));
    await sftp.put(imagenAvanzada, '/var/www/html/imagenes/' + (valor+"_avanzada"+id+".jpg"));
    await sftp.put(imagenAgresiva, '/var/www/html/imagenes/' + (valor+"_agresiva"+id+".jpg"));
    await sftp.put(imagenPasiva, '/var/www/html/imagenes/' + (valor+"_pasiva"+id+".jpg"));
    await sftp.put(imagenRedencionPasiva, '/var/www/html/imagenes/' + (valor+"_redencion_pasiva"+id+".jpg"));
    await sftp.put(imagenRedencionAgresiva, '/var/www/html/imagenes/' + (valor+"_redencion_agresiva"+id+".jpg"));

    sftp.end();

    res.json("Actualizado");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

app.post('/api/v1/caso/insertar', upload.array('imagen', 6), async (req, res) => {
  const {id_valor, nombre, texto_intro, texto_Opcion_Basica, texto_Opcion_Avanzada, texto_Opcion_Pasiva, texto_Opcion_Agresiva, texto_Redencion_Pasiva, texto_Redencion_Buena_Pasiva, texto_Redencion_Mala_Pasiva, texto_Redencion_Agresiva, texto_Redencion_Buena_Agresiva, texto_Redencion_Mala_Agresiva } = req.body;
  const imagenes = req.files;
  const imagen1 = imagenes[0];
  const imagen2 = imagenes[1];
  const imagen3 = imagenes[2];
  const imagen4 = imagenes[3];
  const imagen5 = imagenes[4];
  const imagen6 = imagenes[5];

  try {
    const [results] = await sequelize.query('SELECT nombre AS valor FROM valores where id=?',{
      replacements:[id_valor]
    });
    const valor = results[0].valor;
    const [ultimo] = await sequelize.query('SELECT max(id) AS ultimoCaso FROM casos');
    const id = ultimo[0].ultimoCaso+1;
    // Convertir los datos de las imágenes en un objeto Buffer
    const imagenBasica = imagen1.buffer;
    const imagenAvanzada = imagen2.buffer;
    const imagenAgresiva = imagen3.buffer;
    const imagenPasiva = imagen4.buffer;
    const imagenRedencionPasiva = imagen5.buffer;
    const imagenRedencionAgresiva = imagen6.buffer;

    const Client = require('ssh2-sftp-client');
    const privateKey = require('fs').readFileSync('key/pruebitaputty.ppk');
    const sftp = new Client();

    await sftp.connect({
      host: '44.205.198.225',
      port: 22,
      username: 'admin',
      privateKey:privateKey
    });



    // Guardar la imagen en la base de datos
    const resultado = await sequelize.query('insert into casos (id_valor, nombre, texto_intro,texto_Opcion_Basica,texto_Opcion_Avanzada,texto_Opcion_Pasiva,texto_Opcion_Agresiva,texto_Redencion_Pasiva,texto_Redencion_Buena_Pasiva,texto_Redencion_Mala_Pasiva,texto_Redencion_Agresiva,texto_Redencion_Buena_Agresiva,texto_Redencion_Mala_Agresiva,imagen_Opcion_Basica,imagen_Opcion_Avanzada,imagen_Opcion_Agresiva,imagen_Opcion_Pasiva,imagen_Redencion_Pasiva,imagen_Redencion_Agresiva) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', {
      replacements: [id_valor, 
        nombre, 
        texto_intro, 
        texto_Opcion_Basica, 
        texto_Opcion_Avanzada, 
        texto_Opcion_Pasiva,
         texto_Opcion_Agresiva,
          texto_Redencion_Pasiva,
           texto_Redencion_Buena_Pasiva, 
           texto_Redencion_Mala_Pasiva, 
           texto_Redencion_Agresiva, 
           texto_Redencion_Buena_Agresiva,
            texto_Redencion_Mala_Agresiva, 
            (valor+"_basica"+id+".jpg"),
            (valor+"_avanzada"+id+".jpg"),
            (valor+"_agresiva"+id+".jpg"),
            (valor+"_pasiva"+id+".jpg"),
            (valor+"_redencion_pasiva"+id+".jpg"),
            (valor+"_redencion_agresiva"+id+".jpg")]
    });
    await sftp.put(imagenBasica, '/var/www/html/imagenes/' + (valor+"_basica"+id+".jpg"));
    await sftp.put(imagenAvanzada, '/var/www/html/imagenes/' + (valor+"_avanzada"+id+".jpg"));
    await sftp.put(imagenAgresiva, '/var/www/html/imagenes/' + (valor+"_agresiva"+id+".jpg"));
    await sftp.put(imagenPasiva, '/var/www/html/imagenes/' + (valor+"_pasiva"+id+".jpg"));
    await sftp.put(imagenRedencionPasiva, '/var/www/html/imagenes/' + (valor+"_redencion_pasiva"+id+".jpg"));
    await sftp.put(imagenRedencionAgresiva, '/var/www/html/imagenes/' + (valor+"_redencion_agresiva"+id+".jpg"));

    sftp.end();


    res.json("Creado");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

app.post('/subir', upload.array('imagen', 10), (req, res) => {
  // Aquí puedes obtener los archivos subidos a través de req.files

  // Verificar si se enviaron archivos
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se encontraron imágenes para subir.' });
  }

  const Client = require('ssh2-sftp-client');
  const privateKey = require('fs').readFileSync('key/pruebitaputty.ppk');
  const sftp = new Client();

  sftp.connect({
    host: '44.205.198.225',
    port: 22,
    username: 'admin',
    privateKey:privateKey
  })
  .then(() => {
    // Subir cada archivo al servidor de destino
    const promises = req.files.map((file) => {
      const buffer = file.buffer; // Obtener el buffer de la imagen en memoria
      return sftp.put(buffer, '/var/www/html/imagenes/' + file.originalname);
    });

    // Esperar a que se completen todas las subidas
    return Promise.all(promises);
  })
  .then(() => {
    // Envía una respuesta exitosa al cliente
    res.status(200).json({ message: 'Imágenes subidas con éxito.' });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Ocurrió un error al subir las imágenes.' });
  })
  .finally(() => {
    // Cierra la conexión SFTP
    sftp.end();
  });
});






const port = 3000;

app.listen(port, () => {
  console.log(`Servidor Express funcionando en el puerto ${port}`);
});


