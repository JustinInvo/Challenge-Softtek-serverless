const express = require('express');
const axios = require('axios');
const app = express();
const { v4 } = require('uuid')
const AWS = require('aws-sdk')
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mi API Express',
      version: '1.0.0',
    },
  },
  apis: ['./src/*.js'], // path to the API docs
};

const specs = swaggerJsdoc(options);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.use(express.json());

const attributeMap = {
  "name": "nombre",
  "model": "modelo",
  "manufacturer": "fabricante",
  "cost_in_credits": "costo_en_creditos",
  "length": "longitud",
  "max_atmosphering_speed": "velocidad_maxima_atmosfera",
  "crew": "tripulacion",
  "passengers": "pasajeros",
  "cargo_capacity": "capacidad_de_carga",
  "consumables": "consumibles",
  "vehicle_class": "clase_vehiculo",
  "pilots": "pilotos",
  "films": "peliculas",
  "created": "creado",
  "edited": "editado",
  "url": "url"
};


/**
 * @swagger
 * /vehiculos:
 *   get:
 *     summary: Recupera una lista de vehículos swapi
 *     responses:
 *       200:
 *         description: Una lista de vehículos swapi
 */
app.get('/vehiculos', async (req, res) => {
  const response = await axios.get('https://swapi.py4e.com/api/vehicles/');
  const data = response.data.results.map(item => {
    let newItem = {};
    for (let key in item) {
      if (attributeMap[key]) {
        newItem[attributeMap[key]] = item[key];
      }
    }
    return newItem;
  });
  res.json(data);
});

/**
 * @swagger
 * /contrataciones:
 *   post:
 *     summary: Crea una nueva contratación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               edad:
 *                 type: number
 *               puesto:
 *                 type: string
 *               experiencia:
 *                 type: string
 *     responses:
 *       200:
 *         description: La contratación fue creada exitosamente
 */
app.post('/contrataciones', async (req, res) => {
  const { nombre, edad, puesto, experiencia } = req.body;
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const id = v4()

  const newHiring ={
    id, nombre, edad, puesto, experiencia
  }

  await dynamodb.put({
    TableName: 'ContratacionesTable',
    Item: newHiring
  }).promise()
  
  res.json({ 
    statusCode: 200,
    message: 'Persona contratada correctamente',
    contratacion: newHiring
  });
});

/**
 * @swagger
 * /contrataciones:
 *   get:
 *     summary: Recupera una lista de contrataciones
 *     responses:
 *       200:
 *         description: Una lista de contrataciones
 */
app.get('/contrataciones', async (req, res) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const data = await dynamodb.scan({
    TableName: 'ContratacionesTable'
  }).promise();
  
  res.json({ 
    statusCode: 200,
    contrataciones: data.Items
  });
});

module.exports = app;