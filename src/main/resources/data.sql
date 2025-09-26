-- Insertar Usuarios
INSERT INTO usuario (nombre, nombre_usuario, contrasenia, rol) VALUES
('Juan Pérez', 'jperez', '1234', 'ADMINISTRADOR'),
('Maria López', 'mlopez', 'abcd', 'OPERADOR'),
('Carlos Ruiz', 'cruiz', 'qwerty', 'OPERADOR'),
('Laura García', 'lgarcia', 'pass', 'OPERADOR'),
('Pedro Gómez', 'pgomez', 'admin', 'ADMINISTRADOR');

-- Insertar Recursos
INSERT INTO recurso (nombre, descripcion, codigo, cantidad, minimo, ubicacion, estado, categoria) VALUES
('Impresora HP', 'Impresora láser', 'IMP001', 10, 2, 'Oficina A', true, 'OFICINA'),
('Silla ergonómica', 'Silla para oficina', 'SIL001', 15, 5, 'Deposito', true, 'OFICINA'),
('PC Escritorio', 'Computadora de escritorio', 'PC001', 5, 1, 'Sala B', true, 'INSUMOELECTRICO'),
('Proyector', 'Proyector de presentaciones', 'PRO001', 2, 4, 'Sala de Reuniones', true, 'OFICINA'),
('Mesa Reunión', 'Mesa grande', 'MES001', 3, 5, 'Sala de Reuniones', true, 'LIMPIEZA');

-- Insertar Movimientos
INSERT INTO movimiento (fecha, tipo, cantidad, motivo, usuario_id, recurso_id) VALUES
(CURRENT_DATE, 'INGRESO', 5, 'Compra', 1, 1),
(CURRENT_DATE, 'EGRESO', 2, 'Prestamo', 2, 2),
(CURRENT_DATE, 'INGRESO', 3, 'Devolucion', 3, 3),
(CURRENT_DATE, 'EGRESO', 1, 'Reparación', 4, 4),
(CURRENT_DATE, 'INGRESO', 4, 'Donación', 5, 5);

-- Insertar Solicitudes
INSERT INTO solicitud (codigo_solicitud, fecha, nombre_solicitante, destino, cantidad, activo, tipo, usuario_id, recurso_id) VALUES
('SOL001', CURRENT_DATE, 'Javier', 'Aula 1', 2, true, 'PRESTAMO', 2, 1),
('SOL002', CURRENT_DATE, 'Ana', 'Oficina 3', 1, false, 'ENTREGA', 3, 2),
('SOL003', CURRENT_DATE, 'Luis', 'Deposito', 3, true, 'PRESTAMO', 4, 3),
('SOL004', CURRENT_DATE, 'Sara', 'Sala B', 1, false, 'ENTREGA', 5, 4),
('SOL005', CURRENT_DATE, 'Marta', 'Oficina Principal', 2, false, 'PRESTAMO', 1, 5);

-- Insertar Reportes
INSERT INTO reporte (tipo, fecha_generacion, usuario_id) VALUES
('PRESTAMOS', CURRENT_DATE, 1),
('INVENTARIO', CURRENT_DATE, 2),
('STOCK_MINIMO', CURRENT_DATE, 3),
('PRESTAMOS', CURRENT_DATE, 4),
('INVENTARIO', CURRENT_DATE, 5);
