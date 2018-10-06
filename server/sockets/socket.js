const { io } = require('../server'), { Usuarios } = require('../classes/usuarios'), { crearMensaje } = require('../utilidades/utilidades'),
    usuarios = new Usuarios();



io.on('connection', (client) => {
    client.on('entrarChat', (usuario, callback) => {
        if (!usuario.nombre || !usuario.sala) {
            return callback({
                err: true,
                msj: 'El nombre/sala es necesario'
            });
        }

        client.join(usuario.sala);

        usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonasPorSalas(usuario.sala));

        callback(usuarios.getPersonasPorSalas(usuario.sala));
    });

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () => {
        let personaBorrado = usuarios.borrarPersona(client.id);
        client.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrado.nombre} salió`));
        client.broadcast.emit('listaPersonas', usuarios.getPersonasPorSalas(personaBorrado.sala));

    });

    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });
});