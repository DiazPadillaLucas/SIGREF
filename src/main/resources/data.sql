-- Insertar Usuarios
INSERT INTO usuario (nombre, nombre_usuario, contrasenia, rol) VALUES
('Juan Pérez', 'jperez', '1234', 'ADMINISTRADOR'),
('Maria López', 'mlopez', 'abcd', 'OPERADOR'),
('Carlos Ruiz', 'cruiz', 'qwerty', 'OPERADOR'),
('Laura García', 'lgarcia', 'pass', 'OPERADOR'),
('Pedro Gómez', 'pgomez', 'admin', 'ADMINISTRADOR');



-- Insertar Movimientos
INSERT INTO movimiento (fecha, tipo, cantidad,nombre_solicitante, destino, motivo, usuario_id, recurso_id) VALUES
('2025-09-25', 'INGRESO', 5, '--','--', 'Compra', 1, 1),
(CURRENT_DATE, 'EGRESO', 2, 'Lucas','laboratorio','Se acabo la tinta en el laboratorio', 2, 2),
('2025-08-20', 'INGRESO', 3, '--','--','Compra', 3, 3),
(CURRENT_DATE, 'EGRESO', 1, 'Mirian','aula 23','Limpieza', 4, 4),(CURRENT_DATE, 'EGRESO', 3, 'Mirian','aula 23','Limpieza', 4, 4),
(CURRENT_DATE, 'INGRESO', 4, '--','--','Donación', 5, 5),(CURRENT_DATE, 'INGRESO', 6, '--','--','Donación', 5, 2);

-- Insertar Reportes
INSERT INTO reporte (tipo, fecha_generacion, usuario_id) VALUES
('PRESTAMOS', CURRENT_DATE, 1),
('INVENTARIO', CURRENT_DATE, 2),
('STOCK_MINIMO', CURRENT_DATE, 3),
('PRESTAMOS', CURRENT_DATE, 4),
('MOVIMIENTO', CURRENT_DATE, 5);
