document.addEventListener("DOMContentLoaded", function () {
  showSection(localStorage.getItem("ultimaSeccion") || "dashboard");
  validarSesion();
  actualizarFecha();
  contarRecursos();
  contarAlertasDeStockMinimo();
  agregarAlertaStockMinimo();
  contarMovimientosHoy();
  listarRecursos();
  obtenerInsumosSelect();
  mostrarFormulario();
  listarUsuarios();

});

document.addEventListener("click", function (event) {
  if (event.target.matches("#cerrarSesion")) {
    cerrarSesion();
  }
});

function validarSesion() {
  const user = localStorage.getItem("usuarioLogueado");
  if (!user) {
    window.location.href = "/html/Login.html";
  }
  const usuario = JSON.parse(user);
  document.getElementById("rolUS").textContent = usuario.rol;
  document.getElementById("nombreUS").textContent = usuario.nombreUsuario;
}

document.addEventListener('DOMContentLoaded', () => {
  const selectTipo = document.getElementById("filtroTipo");
  const inputFecha = document.getElementById("filtroFecha"); // asegúrate de que exista en el HTML
  const tabla = document.getElementById("tabla-movimientos");

  if (selectTipo) selectTipo.addEventListener("change", listarMovimientos);
  if (inputFecha) inputFecha.addEventListener("change", listarMovimientos);

  // Normaliza una fecha que venga en varios formatos -> "yyyy-mm-dd" o null
  function normalizeDate(raw) {
    if (!raw && raw !== 0) return null;
    // si ya es Date
    if (raw instanceof Date) return isNaN(raw) ? null : raw.toISOString().slice(0,10);
    const s = String(raw).trim();
    // ISO o ISO con hora
    const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    // dd-mm-yyyy o dd/mm/yyyy
    const dmy = s.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    // timestamp o texto parseable por Date
    const dd = new Date(s);
    if (!isNaN(dd)) return dd.toISOString().slice(0,10);
    return null;
  }

  async function listarMovimientos() {
    try {
      if (!tabla) {
        console.warn('No se encontró #tabla-movimientos');
        return;
      }

      const filtro = (selectTipo?.value ?? 'todos').toLowerCase();
      const filtroFecha = inputFecha?.value ?? '';

      console.log('listarMovimientos -> filtro:', filtro, 'filtroFecha:', filtroFecha);
      tabla.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-sm">Cargando movimientos...</td></tr>`;

      const resp = await fetch("http://localhost:8080/api/movimientos");
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const dataRaw = await resp.json();
      console.log('movimientos recibidos:', dataRaw);

      // soporta pageable { content: [...] } o array directo
      const data = Array.isArray(dataRaw) ? dataRaw : (Array.isArray(dataRaw?.content) ? dataRaw.content : []);
      if (!data.length) {
        tabla.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-sm text-gray-500">No hay movimientos registrados.</td></tr>`;
        return;
      }

      // Filtrado único que combina tipo + fecha
      const movimientosFiltrados = data.filter(mov => {
        const tipoMov = String(mov?.tipo ?? mov?.type ?? '').toLowerCase();
        const tipoOk = filtro === 'todos' || tipoMov === filtro;

        const rawFecha = mov?.fecha ?? mov?.fechaMovimiento ?? mov?.date;
        const fechaMov = normalizeDate(rawFecha);
        const fechaOk = !filtroFecha || (fechaMov && fechaMov === filtroFecha);

        // para debug:
        // console.log({ rawFecha, fechaMov, tipoMov, tipoOk, fechaOk });

        return tipoOk && fechaOk;
      });

      if (!movimientosFiltrados.length) {
        tabla.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-sm text-gray-500">No hay movimientos para ese filtro.</td></tr>`;
        console.log('Movimientos filtrados: []');
        return;
      }

      // Renderizar filas
      tabla.innerHTML = '';
      movimientosFiltrados.forEach(movimiento => {
        const columna = document.createElement("tr");

        // Fecha formateada dd-mm-yyyy
        const fechaNormalized = normalizeDate(movimiento.fecha ?? movimiento.fechaMovimiento ?? movimiento.date);
        let fechaTexto = '';
        if (fechaNormalized) {
          const [y,m,d] = fechaNormalized.split('-');
          fechaTexto = `${d}-${m}-${y}`;
        }

        const tdFecha = document.createElement("td");
        tdFecha.textContent = fechaTexto;
        tdFecha.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";

        const tdInsumo = document.createElement("td");
        tdInsumo.textContent = movimiento?.recurso?.nombre ?? movimiento?.recurso ?? '';
        tdInsumo.className = "px-6 py-2 whitespace-nowrap text-sm font-medium";

        const tdTipo = document.createElement("td");
        tdTipo.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";
        const spanTipo = document.createElement("span");
        spanTipo.textContent = movimiento?.tipo ?? movimiento?.type ?? '';
        const tipoUpper = String(spanTipo.textContent).toUpperCase();
        if (tipoUpper === "INGRESO") spanTipo.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";
        if (tipoUpper === "EGRESO") spanTipo.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800";
        tdTipo.appendChild(spanTipo);

        const tdCantidad = document.createElement("td");
        tdCantidad.textContent = movimiento?.cantidad ?? movimiento?.quantity ?? '';
        tdCantidad.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";

        const tdMotivo = document.createElement("td");
        tdMotivo.textContent = movimiento?.motivo ?? movimiento?.reason ?? '';
        tdMotivo.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";

        const tdUsuario = document.createElement("td");
        tdUsuario.textContent = movimiento?.generadoPor?.nombreUsuario ?? movimiento?.usuario ?? movimiento?.user ?? '';
        tdUsuario.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";

        columna.appendChild(tdFecha);
        columna.appendChild(tdInsumo);
        columna.appendChild(tdTipo);
        columna.appendChild(tdCantidad);
        columna.appendChild(tdMotivo);
        columna.appendChild(tdUsuario);

        tabla.appendChild(columna);
      });

      console.log('Movimientos mostrados:', movimientosFiltrados.length);
    } catch (err) {
      console.error('Error listarMovimientos:', err);
      tabla.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-sm text-red-600">Error cargando movimientos. Revisa la consola.</td></tr>`;
    }
  }

  // carga inicial
  listarMovimientos();
});

// Función para listar categorías en la tabla
function listarCategorias() {
  console.log("Cargando categorías...");
  fetch("http://localhost:8080/api/categorias")
    .then(response => {
      if (!response.ok) throw new Error('Error HTTP: ' + response.status);
      return response.json();
    })
    .then(data => {
      console.log("Categorías recibidas:", data);
      const tabla = document.getElementById("tabla-categorias");
      if (!tabla) {
        console.error("No se encontró #tabla-categorias");
        return;
      }
      tabla.innerHTML = ""; // Limpia la tabla

      // Filtrar si hay un filtro aplicado (usa el select de la sección)
      const filtro = document.getElementById("filtroCategoria").value.toLowerCase();
      const categoriasFiltradas = filtro === "todos" ? data : data.filter(cat => cat.nombre.toLowerCase() === filtro);

      categoriasFiltradas.forEach(categoria => {
        const columna = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = categoria.id;
        id.style = "display: none;";
        id.id = "id-categoria-" + categoria.id;

        const codigo = document.createElement("td");
        codigo.textContent = categoria.id;  // Usa ID como código; ajusta si tienes un campo 'codigo'
        codigo.className = "px-6 py-3 whitespace-nowrap text-sm text-gray-500";

        const nombre = document.createElement("td");
        nombre.textContent = categoria.nombre;
        nombre.className = "px-6 py-3 whitespace-nowrap text-sm font-medium";

        const acciones = document.createElement("td");
        acciones.className = "px-6 py-3 whitespace-nowrap text-sm font-medium";

        const editar = document.createElement("button");
        editar.addEventListener("click", function () {
          showResourceForm("form-modificar-categoria");
          document.getElementById("modificar-cat-id").value = categoria.id;
          document.getElementById("modificar-cat-nombre").value = categoria.nombre;
        });
        editar.className = "text-blue-600 hover:text-blue-900 mr-3";
        const editarIcon = document.createElement("i");
        editarIcon.className = "fas fa-edit";
        editar.appendChild(editarIcon);

        const eliminar = document.createElement("button");
        eliminar.className = "text-red-600 hover:text-red-900";
        eliminar.addEventListener("click", function () {
          if (confirm("¿Estás seguro de dar de baja esta categoría?")) {
            fetch("http://localhost:8080/api/categorias/" + categoria.id + "/darDeBaja", {
              method: "PATCH",
            })
              .then(() => reloadPage())
              .catch(error => console.error("Error al dar de baja la categoría:", error));
          }
        });
        const eliminarIcon = document.createElement("i");
        eliminarIcon.className = "fas fa-trash";
        eliminar.appendChild(eliminarIcon);

        columna.appendChild(id);
        columna.appendChild(codigo);
        columna.appendChild(nombre);
        columna.appendChild(acciones);
        acciones.appendChild(editar);
        acciones.appendChild(eliminar);

        tabla.appendChild(columna);
      });
    })
    .catch(error => console.error("Error listarCategorias:", error));
}

// Función para crear una nueva categoría
function crearCategoria() {
  console.log("Entrando a crearCategoria");
  const nombre = document.getElementById("registro-rec-nombre").value.trim();  // Usa el ID actual del HTML
  console.log("Nombre de categoría:", nombre);
  if (!nombre) {
    alert("El nombre de la categoría es obligatorio.");
    return;
  }

  const categoria = { nombre: nombre };

  fetch("http://localhost:8080/api/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  })
    .then(response => {
      if (response.ok) {
        alert("Categoría creada exitosamente.");
        document.getElementById("registro-rec-nombre").value = "";  // Limpiar campo
        hideResourceForm("form-nueva-categoria");
        listarCategorias();  // Recargar tabla
        actualizarSelectsCategorias();  // Actualizar selects
      } else {
        alert("Error al crear la categoría.");
      }
    })
    .catch(error => console.error("Error crearCategoria:", error));
}

// Función para modificar una categoría
function modificarCategoria() {
  console.log("Entrando a modificarCategoria");
  const id = document.getElementById("modificar-cat-id").value;
  const nombre = document.getElementById("modificar-cat-nombre").value.trim();
  console.log("ID:", id, "Nombre:", nombre);
  if (!nombre) {
    alert("El nombre de la categoría es obligatorio.");
    return;
  }

  const categoria = { nombre: nombre };

  fetch("http://localhost:8080/api/categorias/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  })
    .then(response => {
      if (response.ok) {
        alert("Categoría modificada exitosamente.");
        hideResourceForm("form-modificar-categoria");
        listarCategorias();
        actualizarSelectsCategorias();
      } else {
        alert("Error al modificar la categoría.");
      }
    })
    .catch(error => console.error("Error modificarCategoria:", error));
}

// Función para actualizar los selects de categorías en toda la app
function actualizarSelectsCategorias() {
  console.log("Actualizando selects de categorías...");
  fetch("http://localhost:8080/api/categorias")
    .then(response => response.json())
    .then(categorias => {
      console.log("Categorías para selects:", categorias);
      const selects = [
        "registro-rec-cat",    // Formulario nuevo insumo
        "modificar-rec-cat",   // Formulario modificar insumo
        "filtroCategoria",     // Filtro en sección de insumos y categorías
        "filtro-categoria"     // Filtro en reportes (si aplica)
      ];

      selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Seleccione...</option>';  // Opción por defecto
          categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.nombre.toLowerCase();  // Value en minúsculas para consistencia
            option.textContent = cat.nombre;
            select.appendChild(option);
          });
        }
      });
    })
    .catch(error => console.error("Error actualizarSelectsCategorias:", error));
}

// Agregar eventos y llamadas iniciales en DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // ... (tu código existente aquí)

  // Agregar listener para el filtro de categorías en la sección
  const filtroCat = document.getElementById("filtroCategoria");
  if (filtroCat) filtroCat.addEventListener("change", listarCategorias);

  // Llamadas iniciales para categorías
  listarCategorias();
  actualizarSelectsCategorias();
});

function showSection(sectionId) {
  // Ocultar todas las secciones antes de mostrar la seleccionada

  document
    .querySelectorAll(".section-content")
    .forEach((sec) => sec.classList.add("hidden"));

  // Mostrar la sección seleccionada
  if (!document.getElementById(sectionId)) {
    console.error("Sección no encontrada:", sectionId);
    return;
  }
  document.getElementById(sectionId).classList.remove("hidden");
  localStorage.setItem("ultimaSeccion", sectionId);
}

// Muestra los formularios correspondiente a ingreso o egreso
function mostrarFormulario(tipo) {
  document.getElementById("form-ingreso").classList.add("hidden");
  document.getElementById("form-egreso").classList.add("hidden");

  if (tipo === "ingreso") {
    document.getElementById("form-ingreso").classList.remove("hidden");
  } else if (tipo === "egreso") {
    document.getElementById("form-egreso").classList.remove("hidden");
  }
}

function cerrarSesion() {
  // Eliminar el usuario logueado del localStorage y redirigir al login
  const user = localStorage.getItem("usuarioLogueado");
  if (!user) {
    window.location.href = "/html/Login.html";
    return;
  }
  localStorage.removeItem("usuarioLogueado");
  window.location.href = "/html/Login.html";
}

function actualizarFecha() {
  const hoy = new Date().toLocaleDateString();

  const fecha1 = document.getElementById("fecha-actual");
  if (fecha1) fecha1.textContent = hoy;

  const fecha2 = document.getElementById("fecha-actual-stock");
  if (fecha2) fecha2.textContent = hoy;

  const fecha3 = document.getElementById("fecha-actual-reportes");
  if (fecha3) fecha3.textContent = hoy;
}

function contarRecursos() {
  fetch("http://localhost:8080/api/recursos/contar/todosLosRecursos")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("totalRecursos").textContent = data;
    })
    .catch((error) => console.error("Error al contar recursos:", error));
}

function contarAlertasDeStockMinimo() {
  fetch("http://localhost:8080/api/recursos/contar/alertaStock")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("alertasStock").textContent = data;
    })
    .catch((error) =>
      console.error("Error al contar alertas de stock mínimo:", error)
    );
}

function contarMovimientosHoy() {
    console.log("🔹 contando movimientos hoy...");
    fetch("http://localhost:8080/api/movimientos/contar/hoy")
         .then((response) => response.json())
            .then((data) => {
              document.getElementById("totalMovimientosHoy").textContent = data;
            })
            .catch((error) =>
              console.error("Error al contar movimientos de hoy", error)
            );
}



// Formatea fecha a dd/mm/yyyy
function formatDate(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Clase de badge según tipo
function tipoBadgeClass(tipo) {
  if (!tipo) return 'inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700';
  const t = tipo.toLowerCase();
  if (t.includes('ingres')) return 'inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-700';
  if (t.includes('prést') || t.includes('prest') || t.includes('salid') || t.includes('egres')) return 'inline-block px-3 py-1 rounded-full text-sm bg-red-100 text-red-700';
  return 'inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700';
}

// Formatea cantidad (pone + para ingresos positivos)
function formatCantidad(tipo, cantidad) {
  const c = Number(cantidad) || 0;
  if (tipo && tipo.toLowerCase().includes('ingres') && c > 0) return `+${c}`;
  return String(c);
}

// Método principal: trae los últimos 6 y los muestra
async function cargarUltimosMovimientos() {

  fetch("http://localhost:8080/api/movimientos/ultimos")
      .then((response) => response.json())
      .then((data) => {
        const tabla = document.getElementById("tabla-ultimos-movimientos");

        //data.forEach((recurso) => {
        tabla.innerHTML = ""; // Limpia la tabla antes de agregar filas

        // Filtra las Categoria según el select

        data.forEach((mov) => {
          const columna = document.createElement("tr");

          const fecha = document.createElement("td");
          const fechaObj = new Date(mov.fecha);
          const dia = String(fechaObj.getDate()).padStart(2, "0");
          const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
          const anio = fechaObj.getFullYear();
          fecha.textContent = `${dia}-${mes}-${anio}`;
          fecha.className = "px-4 py-2 whitespace-nowrap text-sm text-gray-500";

          const recurso = document.createElement("td");
          recurso.className = "px-4 py-2 whitespace-nowrap text-sm font-medium";
          recurso.textContent = mov.recurso.nombre;

          const tipo = document.createElement("td");
          tipo.className = "px-6 py-2 whitespace-nowrap text-sm text-gray-500";
          const span = document.createElement("span");
          span.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800";
          span.textContent = mov.tipo;
          tipo.appendChild(span);

          const cantidad = document.createElement("td");
          cantidad.className = "px-4 py-2 whitespace-nowrap text-sm text-gray-500";
          cantidad.textContent = mov.cantidad;


          columna.appendChild(fecha);
          columna.appendChild(recurso);
          if(span.textContent === "INGRESO"){
            span.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";
          }
          if(span.textContent === "EGRESO"){
            span.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800";
          }
          columna.appendChild(tipo);
          columna.appendChild(cantidad);
          tabla.appendChild(columna);

        });
      });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarUltimosMovimientos();
  // Opcional: refrescar cada 60s
  // setInterval(cargarUltimosMovimientos, 60000);
});

/*

function contarPrestamosPendientes() {
  fetch("http://localhost:8080/api/solicitudes/pendientes")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("prestamosPendientes").textContent = data;
    })
    .catch((error) =>
      console.error("Error al contar préstamos pendientes:", error)
    );
}

*/
function agregarUltimosMovimientos() {
  fetch("http://localhost:8080/api/recursos/listarStockMinimo")
      .then((response) => response.json())
      .then((data) => {
        const listaAlertas = document.getElementById("contenedor-alertas");
        listaAlertas.innerHTML = "";
        let cant = 0;

        data.forEach((recurso) => {
          if (cant < 6) {
            const div = document.createElement("div");
            div.className =
                "flex items-start p-3 border border-yellow-200 rounded-lg bg-yellow-50";

            const icon = document.createElement("i");
            icon.className =
                "fas fa-exclamation-circle text-yellow-500 mt-1 mr-3";
            const div2 = document.createElement("div");

            const nombre = document.createElement("p");
            nombre.className = "font-medium text-yellow-800";
            nombre.textContent = recurso.nombre;

            const stock = document.createElement("p");
            stock.className = "text-sm text-yellow-700";
            stock.textContent = ` Stock actual: ${recurso.cantidad} - Mínimo: ${recurso.minimo}`;

            div2.appendChild(nombre);
            div2.appendChild(stock);

            div.appendChild(icon);
            div.appendChild(div2);

            listaAlertas.appendChild(div);
            cant++;
          }
        });

        if (data.length === 0) {
          listaAlertas.innerHTML = "<li>No hay alertas de stock mínimo.</li>";
        }
      })
      .catch((error) => console.error("Error al crear alerta de stock:", error));
}



function agregarAlertaStockMinimo() {
  fetch("http://localhost:8080/api/recursos/listarStockMinimo")
    .then((response) => response.json())
    .then((data) => {
      const listaAlertas = document.getElementById("contenedor-alertas");
      listaAlertas.innerHTML = "";
      let cant = 0;

      data.forEach((recurso) => {
        if (cant < 6) {
          const div = document.createElement("div");
          div.className =
            "flex items-start p-3 border border-yellow-200 rounded-lg bg-yellow-50";

          const icon = document.createElement("i");
          icon.className =
            "fas fa-exclamation-circle text-yellow-500 mt-1 mr-3";
          const div2 = document.createElement("div");

          const nombre = document.createElement("p");
          nombre.className = "font-medium text-yellow-800";
          nombre.textContent = recurso.nombre;

          const stock = document.createElement("p");
          stock.className = "text-sm text-yellow-700";
          stock.textContent = ` Stock actual: ${recurso.cantidad} - Mínimo: ${recurso.minimo}`;

          div2.appendChild(nombre);
          div2.appendChild(stock);

          div.appendChild(icon);
          div.appendChild(div2);

          listaAlertas.appendChild(div);
          cant++;
        }
      });

      if (data.length === 0) {
        listaAlertas.innerHTML = "<li>No hay alertas de stock mínimo.</li>";
      }
    })
    .catch((error) => console.error("Error al crear alerta de stock:", error));
}


document.getElementById("filtroCategoria").addEventListener("change", function() {
  listarRecursos();
});

function listarRecursos() {
  const filtro = document.getElementById("filtroCategoria").value;
  fetch("http://localhost:8080/api/recursos/activos")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document.getElementById("tabla-recursos");

      //data.forEach((recurso) => {
      tabla.innerHTML = ""; // Limpia la tabla antes de agregar filas

            // Filtra las Categoria según el select
      const categoriasFiltrados = filtro === "todos" ? data : data.filter(recurso => recurso.categoria.toLowerCase() === filtro);
      console.log(filtro);
       categoriasFiltrados.forEach((recurso) => {
         console.log(recurso.categoria.toLowerCase());
        const columna = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = recurso.id;
        id.style = "display: none;";
        id.id = "id-recurso-" + recurso.id;

        const codigo = document.createElement("td");
        codigo.textContent = recurso.codigo;
        codigo.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const nombre = document.createElement("td");
        nombre.textContent = recurso.nombre;
        nombre.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

        const categoria = document.createElement("td");
        categoria.textContent = recurso.categoria;
        categoria.className =
          "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const stock = document.createElement("td");
        stock.textContent = recurso.cantidad;
        stock.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const minimo = document.createElement("span");
        minimo.textContent = " (Alerta)";
        minimo.className = "text-yellow-600 font-bold ml-1";

       /* const ubicacion = document.createElement("td");
        ubicacion.textContent = recurso.ubicacion;
        ubicacion.className =
          "px-6 py-4 whitespace-nowrap text-sm text-gray-500";*/

        const acciones = document.createElement("td");
        acciones.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

       /* const ver = document.createElement("button");
        ver.className = "text-blue-600 hover:text-blue-900 mr-3";
        const verIcon = document.createElement("i");
        verIcon.className = "fas fa-eye";
        ver.appendChild(verIcon);*/

        const editar = document.createElement("button");
        editar.addEventListener("click", function () {
          showResourceForm("form-modificar-recurso");
          document.getElementById("modificar-rec-id").value = recurso.id;
          document.getElementById("modificar-rec-nombre").value =
            recurso.nombre;
          document.getElementById("modificar-rec-cat").value =
            recurso.categoria.toLowerCase();
          document.getElementById("modificar-rec-cod").value = recurso.codigo;
          document.getElementById("modificar-rec-cant").value =
            recurso.cantidad;
          document.getElementById("modificar-rec-min").value = recurso.minimo;
          //document.getElementById("modificar-rec-ubicacion").value =
          //  recurso.ubicacion;
          document.getElementById("modificar-rec-desc").value =
            recurso.descripcion;
        });
        editar.className = "text-blue-600 hover:text-blue-900 mr-3";
        const editarIcon = document.createElement("i");
        editarIcon.className = "fas fa-edit";
        editar.appendChild(editarIcon);

        const eliminar = document.createElement("button");
        eliminar.className = "text-red-600 hover:text-red-900";
        eliminar.addEventListener("click", function () {
          if (confirm("¿Estás seguro de dar de baja este recurso?")) {
            fetch(
              "http://localhost:8080/api/recursos/" + recurso.id + "/darDeBaja",
              {
                method: "PATCH",
              }
            )
              .then((response) => response.json())
              .then((data) => reloadPage())
              .catch((error) =>
                console.error("Error al dar de baja el recurso:", error));
            reloadPage();
          }
        });
        const eliminarIcon = document.createElement("i");
        eliminarIcon.className = "fas fa-trash";
        eliminar.appendChild(eliminarIcon);

        columna.appendChild(id);
        columna.appendChild(codigo);
        columna.appendChild(nombre);
        columna.appendChild(categoria);
        recurso.cantidad <= recurso.minimo ? stock.appendChild(minimo) : null;
        columna.appendChild(stock);
        columna.appendChild(acciones);
         acciones.appendChild(editar);
          acciones.appendChild(eliminar);



         tabla.appendChild(columna);
       // columna.appendChild(ubicacion);

        /*acciones.appendChild(ver);*/

      });
    });
}

function reloadPage() {
  // Recargar la página para reflejar los cambios
  window.location.reload();
}

function crearRecurso() {
  const recurso = {
    nombre: document.getElementById("registro-rec-nombre").value,
    categoria: document.getElementById("registro-rec-cat").value.toUpperCase(),
    codigo: document.getElementById("registro-rec-cod").value,
    cantidad: document.getElementById("registro-rec-cant").value,
    minimo: document.getElementById("registro-rec-min").value,
   // ubicacion: document.getElementById("registro-rec-ubicacion").value,
    descripcion: document.getElementById("registro-rec-desc").value,
    estado: true,
  };

  fetch("http://localhost:8080/api/recursos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recurso),
  })
    .then((response) => response.json())
    .then((data) => reloadPage())
    .catch((error) => console.error("Error al crear recurso:", error));
}

function modificarRecurso() {
  const recurso = {
    nombre: document.getElementById("modificar-rec-nombre").value,
    categoria: document.getElementById("modificar-rec-cat").value.toUpperCase(),
    codigo: document.getElementById("modificar-rec-cod").value,
    cantidad: document.getElementById("modificar-rec-cant").value,
    minimo: document.getElementById("modificar-rec-min").value,
   // ubicacion: document.getElementById("modificar-rec-ubicacion").value,
    descripcion: document.getElementById("modificar-rec-desc").value,
    estado: true,
  };
  const recursoId = document.getElementById("modificar-rec-id").value;
  fetch("http://localhost:8080/api/recursos/" + recursoId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recurso),
  })
    .then((response) => response.json())
    .then((data) => reloadPage())
    .catch((error) => console.error("Error al modificar recurso:", error));
}

function generarReporteMovimientoPDF(movimientos) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    console.log("funcion generar reporte movimiento");
    doc.setFontSize(16);

    // obtener fechas del formulario
    const fechaInicio = document.getElementById("fechaInicio").value; // formato YYYY-MM-DD
    const fechaFin = document.getElementById("fechaFin").value;       // formato YYYY-MM-DD

    // aplicar filtro si hay fechas cargadas
    let movimientosFiltrados = movimientos;
    if (fechaInicio && fechaFin) {
      movimientosFiltrados = movimientos.filter(mov => {
        // me quedo con la parte de la fecha sin horas
        const fechaMov = mov.fecha.split("T")[0];
        return fechaMov >= fechaInicio && fechaMov <= fechaFin;
      });
    }

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0"); // meses empiezan en 0
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy=`${dd}/${mm}/${yyyy}`;

    if (movimientosFiltrados.length === 0) {
    doc.text("No hay Movimientos en el rango seleccionado.", 14, 20);
    doc.text(fechaHoy, 190, 20, { align: "right" }); // fecha a la derecha
    doc.save("reporte_movimiento.pdf");
      return;
    }

    doc.text("Reporte de Movimientos", 14, 20);
    doc.text(fechaHoy, 190, 20, { align: "right" }); // fecha a la derecha

    const columns = [
      "ID",
      "Fecha",
      "Tipo",
      "Nombre de insumo",
      "Cantidad",
      "Destino",
      "Nombre de Solicitante",
    ];

    const rows = movimientosFiltrados.map(mov => {
      // asegurar fecha formateada para mostrar
      const fechaObj = new Date(mov.fecha);
      const dia = String(fechaObj.getDate()).padStart(2, "0");
      const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
      const anio = fechaObj.getFullYear();
      const fechaFormateada = `${dia}-${mes}-${anio}`;

      return [
        mov.id,
        fechaFormateada,
        mov.tipo,
        mov.recurso.nombre,
        mov.cantidad,
        mov.destino,
        mov.nombre_solicitante,
      ];
    });

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    // Texto final
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text("Dirigido a quien corresponda", 14, finalY);

    doc.save("reporte_movimiento.pdf");
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}

async function generarReporteStockMinimoPDF(recursos) {
  try {
    const categoriaSeleccionada =
      document.getElementById("categoria").value;

    if (categoriaSeleccionada === "") {
      alert("Por favor seleccione una categoría.");
      return;
    }

    const recursosFiltrados = recursos.filter(
      (rec) =>
        rec.categoria.toUpperCase() === categoriaSeleccionada.toUpperCase() &&
        rec.estado === true
    );

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy = `${dd}/${mm}/${yyyy}`;

    if (recursosFiltrados.length === 0) {
      alert("No hay recursos con alerta de stock mínimo en esta categoría.");
      doc.setFontSize(12);
      doc.text(fechaHoy, 190, 20, { align: "right" });
      doc.text(`Categoría: ${categoriaSeleccionada}`, 14, 30);
      doc.text("Dirigido a quien corresponda", 14, 50);
      doc.save(`reporte_stock_minimo_${categoriaSeleccionada.toLowerCase()}.pdf`);
      return;
    }

    doc.setFontSize(16);
    doc.text(
      `Reporte de Stock Mínimo - Categoría: ${categoriaSeleccionada}`,
      14,
      20
    );
    doc.text(fechaHoy, 190, 20, { align: "right" });

    const columns = [
      "ID",
      "Nombre",
      "Descripción",
     // "Código",
      "Cantidad",
      "Mínimo",
      "Categoría",
    ];

    const rows = recursosFiltrados.map((rec) => [
      rec.id,
      rec.nombre,
      rec.descripcion,
    //  rec.codigo,
      rec.cantidad,
      rec.minimo,
      rec.categoria,
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 193, 7] }, // Amarillo
    });

    // Texto final
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Dirigido a quien corresponda", 14, finalY);

    doc.save(`reporte_stock_minimo_${categoriaSeleccionada.toLowerCase()}.pdf`);
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}



async function generarReporteInventarioPDF(recursos) {
  try {
    const categoriaSeleccionada =
      document.getElementById("filtro-categoria").value;

    if (categoriaSeleccionada === "") {
      alert("Por favor seleccione una categoría.");
      return;
    }

    const recursosFiltrados = recursos.filter(
      (rec) =>
        rec.categoria.toUpperCase() === categoriaSeleccionada.toUpperCase() && rec.estado === true
    );
     const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, "0"); // meses empiezan en 0
            const dd = String(hoy.getDate()).padStart(2, "0");
            const fechaHoy=`${dd}/${mm}/${yyyy}`;

    if (recursosFiltrados.length === 0) {
      alert("No hay recursos registrados para esta categoría.");
      doc.text(fechaHoy, 190, 20, { align: "right" }); // fecha a la derecha
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Reporte de Inventario - Categoría: ${categoriaSeleccionada}`, 14, 20);
    doc.text(fechaHoy, 190, 20, { align: "right" }); // fecha a la derecha

    const columns = [
      "ID",
      "Nombre",
      "Cantidad",
      "Mínimo",
     // "Ubicación",
     // "Estado",
    ];
    const rows = recursosFiltrados.map((rec) => [
      rec.id,
      rec.nombre,
      rec.cantidad,
      rec.minimo,
   //   rec.ubicacion,
    //  rec.estado ? "Activo" : "Inactivo",
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 204, 113] }, // Verde
    });
    // Texto final
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text("Dirigido a quien corresponda", 14, finalY);

    doc.save(`reporte_inventario_${categoriaSeleccionada.toLowerCase()}.pdf`);
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}

function generarReporte(tipo) {
  const usuarioId = JSON.parse(localStorage.getItem("usuarioLogueado")).id;

  fetch(
    "http://localhost:8080/api/reportes/generar?tipo=" +
      tipo +
      "&idUsuario=" +
      usuarioId,
    {
      method: "POST",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      switch (tipo) {
        case "stock_minimo":
          generarReporteStockMinimoPDF(data);
          break;
        case "inventario":
          generarReporteInventarioPDF(data);
          break;
        case "movimiento":
          generarReporteMovimientoPDF(data);
          break;

        default:
          break;
      }
    })
    .catch((error) => console.error("Error al generar reporte:", error));
}

// /ocultar formularios en gestión de recursos (modificada)

function showResourceForm(idForm) {
  document.getElementById(idForm).classList.remove("hidden");
}



// Ocultar formulario en caso de cancelar
function hideResourceForm(idForm){
  console.log("Entro a al funcion .", idForm)
  document.getElementById(idForm).classList.add("hidden");
}

// Obtener insumos para listarlos en select
function obtenerInsumosSelect(){
  fetch("http://localhost:8080/api/recursos/activos")
      .then((response) => response.json())
      .then((data) => {
        const selects = document.getElementsByClassName("insumo-selec-movimiento");
        console.log(data);

        console.log(selects);
        data.sort((a,b) => a.nombre.localeCompare(b.nombre));

        console.log("Data organizado",data);

        data.forEach((insumo) => {
          let option = document.createElement("option");
          option.textContent = insumo.nombre;
          for (let select of selects) {
            select.appendChild(option.cloneNode(true));
          }
        });

      });
}


// Mostrar/ocultar formularios en usuarios
function showUserForm(action) {
  document.getElementById("form-nuevo-usuario").classList.add("hidden");
  if (action === "nuevo") {
    document.getElementById("form-nuevo-usuario").classList.remove("hidden");
  }
}

document.getElementById("filtroRol").addEventListener("change", function() {
  listarUsuarios();
});

function listarUsuarios() {
  // 1. Obtener el valor del filtro correctamente del select con ID "filtroRol"
  const filtroRol = document.getElementById("filtroRol").value;

  fetch("http://localhost:8080/api/usuarios")
      .then((response) => response.json())
      .then((data) => {
        const tabla = document.getElementById("tabla-usuarios");
        tabla.innerHTML = ""; // limpiar antes de renderizar
        console.log("Lista de usuarios: ", data);

        // 2. Aplicar el filtro:
        //    - Si filtroRol es "TODOS", devuelve todos los datos (data).
        //    - En otro caso, filtra donde el rol del usuario coincida con el valor de filtroRol.
        const usuariosFiltrados = (filtroRol === "TODOS")
          ? data
          : data.filter((usuario) => usuario.rol === filtroRol);

        usuariosFiltrados.forEach((usuario) => {
          const columna = document.createElement("tr");

          const nombreUsuario = document.createElement("td");
          nombreUsuario.textContent = usuario.nombreUsuario;
          nombreUsuario.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

          const nombre = document.createElement("td");
          nombre.textContent = usuario.nombre;
          nombre.className = "px-6 py-4 whitespace-nowrap text-sm";

          const rol = document.createElement("td");
          rol.textContent = usuario.rol;
          rol.className = "px-6 py-4 whitespace-nowrap text-sm";

          const acciones = document.createElement("td");
          acciones.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

          const estado = document.createElement("span");
          estado.className = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800";


          //Boton editar usuario
          const editar = document.createElement("button");
          editar.addEventListener("click", function () {
            showResourceForm("form-modificar-usuario");
            document.getElementById("nombre-completo-modificar").value = usuario.nombre;
            document.getElementById("nombre-usuario-modificar").value =
                usuario.nombreUsuario;
            document.getElementById("modificar-usuario-id").value = usuario.id;
            document.getElementById("contraseña-modificar").value =
                usuario.contrasenia;
            document.getElementById("rol-modificar").value =
                usuario.rol;
            document.getElementById("estado-modificar").value = usuario.estado;

          });
          editar.className = "text-blue-600 hover:text-blue-900 mr-3";
          const editarIcon = document.createElement("i");
          editarIcon.className = "fas fa-edit";
          editar.appendChild(editarIcon);


          //Boton eliminar usuario
          const eliminar = document.createElement("button");
          eliminar.className = "text-red-600 hover:text-red-900";
          eliminar.addEventListener("click", function () {
            if (confirm("¿Estás seguro de dar de baja este recurso?")) {
              fetch(
                  "http://localhost:8080/api/usuarios/" + usuario.id,
                  {
                    method: "PATCH",
                  }
              )
                  .then((response) => response.json())
                  .then((data) => reloadPage())
                  .catch((error) =>
                      console.error("Error al dar de baja el usuario:", error));
              reloadPage();
            }

          });
          const eliminarIcon = document.createElement("i");
          eliminarIcon.className = "fas fa-trash";
          eliminar.appendChild(eliminarIcon);


          columna.appendChild(nombreUsuario);
          columna.appendChild(nombre);
          columna.appendChild(rol);
          columna.appendChild(estado);
          columna.appendChild(editar);
          columna.appendChild(eliminar);
          /*
          acciones.appendChild(ver);
          acciones.appendChild(editar);
          acciones.appendChild(eliminar);
          */

          tabla.appendChild(columna);
        });
      })
      .catch((error) => console.error("Error al obtener usuarios:", error));
}

window.crearUsuario = function() {
     const usuario = {
       nombre: document.querySelector("#form-nuevo-usuario input[type='text']").value,
       nombreUsuario: document.querySelectorAll("#form-nuevo-usuario input[type='text']")[1].value,
       contrasenia: document.querySelector("#form-nuevo-usuario input[type='password']").value,
       rol: document.querySelector("#form-nuevo-usuario select").value,
     };

     const confirmar = document.querySelectorAll("#form-nuevo-usuario input[type='password']")[1].value;
     if (usuario.contrasenia !== confirmar) {
       alert("Las contraseñas no coinciden");
       return;
     }

     fetch("http://localhost:8080/api/usuarios", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(usuario),
     })
       .then((res) => res.json())
       .then(() => {
         reloadPage()
       })
       .catch((err) => console.error("Error al crear usuario:", err));

}

//modificar usuario
//Función para modificar usuario

function modificarUsuario() {
  const usuario = {
    nombre: document.getElementById("nombre-completo-modificar").value,
    nombreUsuario: document.getElementById("nombre-usuario-modificar").value,
    contrasenia: document.getElementById("contraseña-modificar").value,
    rol: document.getElementById("rol-modificar").value,
    estado: document.getElementById("estado-modificar").value === "Activo"
  };

  const idUsuario = document.getElementById("modificar-usuario-id").value; // input oculto con el id
  const confirmar = document.getElementById("contraseña-confirmar-modificar").value;

  if (usuario.contrasenia !== confirmar) {
    alert("Las contraseñas no coinciden");
    return;
  }

  fetch("http://localhost:8080/api/usuarios/"+idUsuario, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  })
    .then(response => {
      if (!response.ok) throw new Error("Error en la modificación");
      return response.json();
    })
    .then(() => reloadPage())
    .catch(error => console.error("Error al modificar usuario:", error));
}

//Asignar evento al botón Guardar
document.getElementById("guardar-modificar-usuario").addEventListener("click", modificarUsuario);


// Eliminar usuario (dar de baja)
function eliminarUsuario(idUsuario) {
    if (confirm("¿Estás seguro de dar de baja este usuario?")) {
      fetch("http://localhost:8080/api/usuarios/" + idUsuario, {
        method: "PATCH", // o PATCH si tu backend hace baja lógica
      })
          .then(() => reloadPage())
          .catch((err) => console.error("Error al dar de baja usuario:", err));
    }
}




// Agregar nuevo Movimiento
function registrarMovimiento() {

    let tipo, cantidad, motivo, nombreSolicitante, destino, nombreRecurso;

    if (!document.getElementById("form-ingreso").classList.contains("hidden")) {

        tipo = "INGRESO";
        cantidad = parseInt(document.getElementById("cantidadMovimientoIngreso").value);
        motivo = document.getElementById("motivoMovimientoIngreso").value;
        nombreRecurso = document.getElementById("insumoMovimientoIngreso").value;
        nombreSolicitante = "--";
        destino = "--"; // Si no hay campo destino en ingreso, déjalo vacío o agrega uno

    } else {

        tipo = "EGRESO";
        cantidad = parseInt(document.getElementById("cantidadMovimientoEgreso").value);
        motivo = document.getElementById("motivoMovimientoEgreso").value;
        nombreRecurso = document.getElementById("insumoMovimientoEgreso").value;
        nombreSolicitante = document.getElementById("nombreSolicitanteMovimientoEgreso").value;
        destino = document.getElementById("areaDestinoMovimientoEgreso").value;
    }



    const usuarioId = JSON.parse(localStorage.getItem("usuarioLogueado")).id;


    fetch("http://localhost:8080/api/recursos/activos")
        .then((response) => response.json())
        .then((recursos) => {
            const recurso = recursos.find(r => r.nombre === nombreRecurso);
            if (!recurso) {
                alert("No se encontró el recurso seleccionado.");
                return;
            }



      // Obtener la fecha actual en la zona horaria de Argentina en formato ISO completo
      const fecha= new Date().toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).replace(' ', 'T');
      // Si el backend espera un Date completo, enviar el string ISO (yyyy-MM-ddTHH:mm:ss)
      const movimiento = {
        fecha: fecha,
        tipo: tipo,
        cantidad: cantidad,
        nombre_solicitante: nombreSolicitante,
        destino: destino,
        motivo: motivo,
        generadoPor: { id: usuarioId },
        recurso: { id: recurso.id }
      };

      console.log("Movimiento a registrar:", movimiento);
      return fetch("http://localhost:8080/api/movimientos/registrar?idUsuario="+ usuarioId + "&idRecurso="+recurso.id, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movimiento),
            });
        })
        .then((response) => {
            if (response && response.ok) {
                alert("Movimiento registrado correctamente.");
                reloadPage();
            }else{
              alert("Movimiento no valido.");
              reloadPage();
            }
        })
        .catch((error) => console.error("Error al registrar movimiento:", error));
}
