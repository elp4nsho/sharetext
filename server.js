const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = app.listen(7025, () => {
  console.log('Servidor escuchando en el puerto 3000');
});

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Inicializar Socket.IO
const io = socketIO(server);

// Manejar conexiones de clientes
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Enviar mensajes anteriores al cliente
  fs.readFile(__dirname + '/messages.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    socket.emit('previousMessages', data);
  });

  // Recibir y emitir mensajes
  socket.on('message', (message) => {
    console.log('Mensaje recibido:', message);

    // Guardar mensaje en el archivo de texto
    fs.appendFile(__dirname + '/messages.txt', message + '\n', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Mensaje guardado en el archivo de texto');
    });

    // Emitir mensaje a todos los clientes conectados
    io.emit('message', message);
  });

  // Manejar desconexiones de clientes
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

