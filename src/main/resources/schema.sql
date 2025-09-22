-- Crear tablas

CREATE TABLE usuario (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         nombre VARCHAR(255) NOT NULL,
                         nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
                         contrasenia VARCHAR(255) NOT NULL,
                         rol VARCHAR(50) NOT NULL
);

CREATE TABLE recurso (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         nombre VARCHAR(255) NOT NULL,
                         descripcion VARCHAR(255),
                         codigo VARCHAR(50),
                         cantidad INT NOT NULL,
                         minimo INT NOT NULL,
                         ubicacion VARCHAR(255),
                         estado BOOLEAN,
                         categoria VARCHAR(50)
);

CREATE TABLE movimiento (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            fecha DATE,
                            tipo VARCHAR(50),
                            cantidad INT,
                            nombre_solicitante VARCHAR(255),
                            destino VARCHAR(255),
                            motivo VARCHAR(255),
                            usuario_id BIGINT,
                            recurso_id BIGINT,
                            CONSTRAINT fk_mov_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
                            CONSTRAINT fk_mov_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id)
);














CREATE TABLE solicitud (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           codigo_solicitud VARCHAR(50) UNIQUE,
                           fecha DATE,
                           nombre_solicitante VARCHAR(255),
                           destino VARCHAR(255),
                           cantidad INT,
                           activo BOOLEAN,
                           tipo VARCHAR(50),
                           usuario_id BIGINT,
                           recurso_id BIGINT,
                           CONSTRAINT fk_sol_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
                           CONSTRAINT fk_sol_recurso FOREIGN KEY (recurso_id) REFERENCES recurso(id)
);

CREATE TABLE reporte (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         tipo VARCHAR(50),
                         fecha_generacion DATE,
                         usuario_id BIGINT,
                         CONSTRAINT fk_rep_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
