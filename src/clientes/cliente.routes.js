const { Router } = require('express');
const { validarDatos } = require('../middlewares/validarDatos.middleware.js');
const { clienteSchema, clienteUpdateSchema } = require('./cliente.schema');
const {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente
} = require('./cliente.controller.js');

const router = Router();

router.get('/', getClientes);
router.get('/:id', getCliente);
router.post('/', validarDatos(clienteSchema), createCliente);
router.patch('/:id', validarDatos(clienteUpdateSchema), updateCliente);
router.delete('/:id', deleteCliente);

module.exports = router;