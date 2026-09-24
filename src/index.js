require('dotenv').config()
const express = require('express');
const app = express();

app.use(express.json());                    

const clientesRoutes = require('./clientes/cliente.routes.js');
app.use('/clientes', clientesRoutes);     

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Clientes PoC' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`)
})