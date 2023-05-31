const mysql = require('mysql');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const connection = mysql.createConnection({
    host: '54.81.81.83',
    user: 'adminputty',
    password: 'putty',
    database: 'supervalues'
})



function calcularHashSHA256(string) {

    const hash = crypto.createHash('sha256');

    hash.update(string);

    const hashHex = hash.digest('hex');

    return hashHex;
}

function generarTokenJWT(id) {
    const token = jwt.sign({ profeId: id }, 'login_secret_profe', { expiresIn: '14d' });
    console .log(token);
    return token;
}

exports.checkLogin = (req, res, next) => {
    if (!req.session) {
        req.session = {};
      }
    const { email, password } = req.query;

    const hash = calcularHashSHA256(password);

    const query = `select * from profesores where email='${email}' and contrasena='${hash}';`
console.log(query);
    connection.query(query, (error, results, fields) => {
        if (error) {
        } else {
            if (results.length > 0) {
                let token = generarTokenJWT(results[0].id);
                req.session.token = token;
                console.log(req.session);
                 res.json({
                    status: 200,
                    data: {
                        name: results[0].nombre,
                    }
                });
            } else {
             res.json({
                    status: 404,
                    data: {
                        message: 'Usuario no encontrado'
                    }
                });
            }
        }
    });

}


exports.checkSession = (req, res, next) => {

    const token = req?.session?.token;
console.log(req.session.token);
    if (token) {
        jwt.verify(token, 'login_secret_profe', (err, decoded) => {
            console.log(err);
            if (err) {
                res.json({
                    status: 401,
                    data: {
                        message: 'Token inválido 1'
                    }
                });
            } else {
                res.json({
                    status: 200,
                    data: {
                        message: 'Token válido'
                    }
                });
            }
        });
    } else {
        res.json({
            status: 401,
            data: {
                message: 'Token inválido 2 '
            }
        });
    }
}

exports.logout = (req, res, next) => {
    delete req.session.token;
    res.json({
        status: 200,
        data: {
            message: 'Logout'
        }
    });
}