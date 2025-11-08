-- Crear tablas

CREATE TABLE usuario (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         nombre VARCHAR(255) NOT NULL,
                         nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
                         contrasenia VARCHAR(255) NOT NULL,
                         rol VARCHAR(50) NOT NULL
);

-- --------------------------------------------------------
-- Script de Creación de Tabla para la Entidad Recurso
-- Base de Datos: MySQL
-- --------------------------------------------------------

-- Asume que la tabla de enumeración 'Categoria' existe o será manejada por la aplicación.

CREATE TABLE Recurso (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(500),
    codigo VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    minimo INT NOT NULL,
    ubicacion VARCHAR(255),
    condicion VARCHAR(50),
    tipo VARCHAR(50),
    estado BOOLEAN NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UQ_Recurso_Codigo UNIQUE (codigo)
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



CREATE TABLE reporte (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         tipo VARCHAR(50),
                         fecha_generacion DATE,
                         usuario_id BIGINT,
                         CONSTRAINT fk_rep_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
CREATE TABLE solicitante (
    -- id: @Id y @GeneratedValue(strategy = GenerationType.IDENTITY)
    id BIGINT NOT NULL AUTO_INCREMENT,

    -- dni: @Column(unique = true, nullable = false)
    dni VARCHAR(255) NOT NULL,

    -- nombre: String (VARCHAR(255) por defecto)
    nombre VARCHAR(255),

    -- puesto: String (VARCHAR(255) por defecto)
    puesto VARCHAR(255),

    -- Definiciones de Restricciones
    PRIMARY KEY (id),
    UNIQUE KEY UK_dni (dni) -- Restricción para asegurar que el DNI no se repita
) ;
-- Creación de la tabla SOLICITUD
CREATE TABLE solicitud (
    id BIGINT NOT NULL AUTO_INCREMENT,

    nro_tramite VARCHAR(255) NOT NULL, -- @Column(unique = true, nullable = false)
    area VARCHAR(255),
    fecha_solicitud DATE NOT NULL, -- @Temporal(TemporalType.DATE) y @Column(nullable = false)

    solicitante_id BIGINT NOT NULL, -- Clave foránea a Solicitante

    PRIMARY KEY (id),
    UNIQUE KEY UK_nro_tramite (nro_tramite), -- Restricción de unicidad para nroTramite

    -- Definición de la Clave Foránea a Solicitante
    FOREIGN KEY (solicitante_id) REFERENCES solicitante(id)
) ;

-- Creación de la tabla intermedia SOLICITUD_RECURSO
CREATE TABLE solicitud_recurso (
    solicitud_id BIGINT NOT NULL, -- Clave Foránea y parte de la PK
    recurso_id BIGINT NOT NULL,   -- Clave Foránea y parte de la PK

    cantidad_solicitada INT, -- Campo adicional

    -- Definición de la Clave Primaria Compuesta
    PRIMARY KEY (solicitud_id, recurso_id),

    -- Definición de las Claves Foráneas
    FOREIGN KEY (solicitud_id) REFERENCES solicitud(id) ON DELETE CASCADE,
    FOREIGN KEY (recurso_id) REFERENCES recurso(id) ON DELETE CASCADE
);
