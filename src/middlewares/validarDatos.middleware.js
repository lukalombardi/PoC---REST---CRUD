const validarDatos = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message
      }))
    });
  }

  req.body = resultado.data; 
  next();
};

module.exports = { validarDatos };