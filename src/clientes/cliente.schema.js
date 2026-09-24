const {z} = require('zod');
const clienteSchema = z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(3),
    dni: z.string().min(8),
    email: z.string().min(5)
})
const clienteUpdateSchema = clienteSchema.partial();
module.exports = {clienteSchema, clienteUpdateSchema};