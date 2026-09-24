const { prisma } = require('../db.js');

// GET /clientes, busca todos los clientes, 200 con la lista
const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('getClientes:', error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
};

// GET /clientes/:id, busca clientes por id, 200 si existe, 404 si no
const getCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error('getCliente:', error);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

// POST /clientes, crea clientes, 201 creado, 409 si el DNI o email ya existe
const createCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({ data: req.body });
    res.status(201).json(cliente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI o email' });
    }
    console.error('createCliente:', error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

// PATCH /clientes/:id, actualiza el cliente, 200 actualizado, 404 si no existe, 409 si choca un único
const updateCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.status(200).json(cliente);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese DNI o email' });
    }
    console.error('updateCliente:', error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// DELETE /clientes/:id, elimina el cliente, 200 eliminado, 404 si no existe
const deleteCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(200).json(cliente);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    console.error('deleteCliente:', error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};

module.exports = { getClientes, getCliente, createCliente, updateCliente, deleteCliente };