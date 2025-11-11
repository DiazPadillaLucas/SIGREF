document.addEventListener("DOMContentLoaded", function () {
  showSection(localStorage.getItem("ultimaSeccion") || "dashboard");
  validarSesion();
  actualizarFecha();
  contarRecursos();
  contarAlertasDeStockMinimo();
  agregarAlertaStockMinimo();
  contarMovimientosHoy();
  listarRecursos();
  listarBienes();
  mostrarFormulario();
  listarUsuarios();
  listarCategoriasBienes();
  listarCategoriasInsumos();
  cargarCategoriasDinamicamente("registro-bien-cat", "Bien");
  cargarCategoriasDinamicamente("registro-rec-cat", "Insumo");
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  cargarCategoriasDinamicamente("catRepMin", "Insumo");
  cargarBienesDisponibles()
  listarSolicitudes()
  cargarSolicitantesDisponibles()
   cargarInsumosDinamicos()

=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  cargarBienesDisponibles();
  renderTablaSolicitudes();
  cargarSolicitantesDisponibles();
  cargarInsumosDinamicos();
  renderTablaSolicitudesInsumos()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
//----------------------------------------
// CONTROL DE INGRESOS DE INSUMOS
//----------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  const inputFecha = document.getElementById("filtroFecha");
  const tabla = document.getElementById("tabla-movimientos");

  if (inputFecha) inputFecha.addEventListener("change", listarMovimientos);

  // Normaliza fecha a yyyy-mm-dd
  function normalizeDate(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    if (s.includes("T")) return s.split("T")[0];
    return s;
  }

  //----------------------------------------
  // LISTAR MOVIMIENTOS
  //----------------------------------------
  async function listarMovimientos() {
    try {
      if (!tabla) return;

      const filtroFecha = inputFecha?.value ?? '';

      tabla.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-sm">Cargando movimientos...</td>
        </tr>
      `;

      const resp = await fetch("http://localhost:8080/api/movimientos");
      if (!resp.ok) throw new Error("HTTP " + resp.status);

      // ✅ backend devuelve una lista pura, así que es directo
      const movimientos = await resp.json();

      if (!movimientos.length) {
        tabla.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500">No hay ingresos registrados.</td>
          </tr>
        `;
        return;
      }

      // Filtrar por fecha exacta
      const filtrados = movimientos.filter(mov => {
        const fecha = normalizeDate(mov.fecha);
        return !filtroFecha || fecha === filtroFecha;
      });

      if (!filtrados.length) {
        tabla.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
              No hay ingresos para ese día.
            </td>
          </tr>
        `;
        return;
      }

      // Render tabla
      tabla.innerHTML = "";
      filtrados.forEach(mov => {
        const fecha = normalizeDate(mov.fecha);
        const fechaTexto = fecha ? fecha.split("-").reverse().join("-") : "";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">${fechaTexto}</td>
          <td class="px-6 py-2 whitespace-nowrap text-sm font-medium">${mov?.recurso?.nombre ?? ''}</td>
          <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">${mov?.cantidad ?? ''}</td>
          <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">${mov?.observaciones ?? ''}</td>
          <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500">${mov?.generadoPor?.nombreUsuario ?? ''}</td>
        `;

        tabla.appendChild(fila);
      });

    } catch (err) {
      console.error("Error listarMovimientos:", err);
      tabla.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-sm text-red-600">
            Error cargando ingresos.
          </td>
        </tr>
      `;
    }
  }

  listarMovimientos();
});


function cargarInsumosDinamicos() {
   const datalist = document.getElementById("insumoMovimientoIngreso");
   // Limpiamos las opciones previas
   datalist.innerHTML = '';

   fetch("http://localhost:8080/api/recursos/activos")
     .then(r => r.json())
     .then(r => {
       // 🟢 FILTRO CONFIRMADO: Usamos exactamente el filtro que funciona en listarRecursos()
       const insumos = r.filter(r => r.tipo === "Insumo");
      
    
       insumos.forEach(insumo => {
         const option = document.createElement('option');
         // Aseguramos que el insumo tenga nombre para evitar opciones vacías
         if (insumo.nombre) {
            option.value = insumo.id;
            option.textContent = insumo.nombre;
            datalist.appendChild(option);
         }
       });

       console.log(`Cargados ${insumos.length} insumos dinámicamente.`);
     })
     .catch(err => console.error("Error al cargar insumos:", err));
}

// Llama a esta función cuando la página se carga o cuando abres el formulario de egreso
// Ejemplo: window.onload = cargarInsumosDinamicos;
// O si es un modal: al abrir el modal de egreso, llamas a cargarInsumosDinamicos().

//----------------------------------------
// REGISTRAR NUEVO MOVIMIENTO
//---------------------------------------
function registrarMovimiento() {

  // 1. Obtener la cantidad ingresada y asegurar que sea POSITIVA para el INGRESO (INCREMENTO)
  // Usamos Math.abs() para garantizar que la cantidad sea siempre positiva y se SUME al stock.
  const cantidad = Math.abs(parseInt(document.getElementById("cantidadMovimientoIngreso").value));

  const nombreRecurso = document.getElementById("insumoMovimientoIngreso").value;
  const observaciones = document.getElementById("observacionesMovimientoIngreso").value;
  const fechaElegida = document.getElementById("fechaMovimientoIngreso").value;

  const usuarioId = JSON.parse(localStorage.getItem("usuarioLogueado")).id;

  fetch("http://localhost:8080/api/recursos/activos")
    .then(r => r.json())
    .then(recursos => {

      // 2. Buscar y FILTRAR por Insumo (usando el filtro confirmado)
      const recurso = recursos.find(r => r.nombre === nombreRecurso && r.tipo === "Insumo");

      if (!recurso) {
        alert("No se encontró el insumo seleccionado o no es un insumo válido.");
        return;
      }

      // ✅ Spring acepta yyyy-MM-dd
      const fechaFinal = fechaElegida ? fechaElegida : new Date().toISOString().split("T")[0];

      const movimiento = {
        fecha: fechaFinal,
        cantidad, // Esta cantidad es positiva (Ingreso)
        observaciones,
        generadoPor: { id: usuarioId },
        recurso: { id: recurso.id }
      };

      console.log("Movimiento de Ingreso a registrar:", movimiento);

      // 3. Llamada al endpoint para registrar y actualizar stock
      // Tu backend DEBE estar configurado en el endpoint de "registrar" para:
      // a) Crear el registro de movimiento.
      // b) SUMAR la cantidad al stock del recurso con id = recurso.id.
      return fetch(
        "http://localhost:8080/api/movimientos/registrar?idUsuario=" + usuarioId + "&idRecurso=" + recurso.id,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movimiento)
        }
      );
    })
    .then(response => {
      if (response && response.ok) {
        alert("Ingreso y stock actualizado correctamente.");
        reloadPage();
      } else {
        alert("El ingreso no es válido. (Verifica permisos o cantidad)");
        reloadPage();
      }
    })
    .catch(err => console.error("Error al registrar ingreso:", err));
}

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

  // Paso 1: Obtener todos los recursos activos
  fetch("http://localhost:8080/api/recursos/activos")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document.getElementById("tabla-recursos");
      tabla.innerHTML = ""; // Limpia la tabla antes de agregar filas

      const recursosInsumo = data.filter(recurso =>
          // 💡 ERROR CORREGIDO: Eliminada la comilla doble extra al final de "Insumo"
          recurso.tipo === "Insumo"
      );

      // Filtra las Categorías según el select
      const categoriasFiltrados = filtro === "todos"
        ? recursosInsumo
        : recursosInsumo.filter(recurso => recurso.categoria.toLowerCase() === filtro);

      console.log(filtro);

      categoriasFiltrados.forEach((recurso) => {
        const columna = document.createElement("tr");

        // --------------------------------------------------------------
        // CAMBIO 1: ID - Ahora será la primera columna visible
        // --------------------------------------------------------------
        const id = document.createElement("td");
        id.textContent = recurso.id;
        id.className = "px-6 py-4 whitespace-nowrap text-sm font-medium"; // Clase para hacerlo visible
        id.id = "id-recurso-" + recurso.id;

        // El Código se muestra a continuación del ID
        const codigo = document.createElement("td");
        codigo.textContent = recurso.codigo;
        codigo.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const nombre = document.createElement("td");
        nombre.textContent = recurso.nombre;
        nombre.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

        const categoria = document.createElement("td");
        categoria.textContent = recurso.categoria.nombre;
        categoria.className =
          "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const stock = document.createElement("td");
        stock.textContent = recurso.cantidad;
        stock.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const minimo = document.createElement("span");
        minimo.textContent = " (Alerta)";
        minimo.className = "text-yellow-600 font-bold ml-1";

        const acciones = document.createElement("td");
        acciones.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

        const editar = document.createElement("button");

        editar.addEventListener("click", function () {
          // 1. Mostrar el formulario de modificación de Insumo
          showResourceForm("form-modificar-recurso");

          // Obtiene el ID de la categoría actual del Insumo
          const categoriaIdActual = recurso.categoria ? recurso.categoria.id : null;

          // 2. Asignar campos INMUTABLES y EDITABLES del Insumo
          document.getElementById("modificar-rec-id").value = recurso.id;
          document.getElementById("modificar-rec-nombre").value = recurso.nombre;
          // Estos campos no tienen ID en tu segundo código, puedes ignorarlos o revisar sus IDs si existen.
          // document.getElementById("modificar-rec-cod").value = recurso.codigo;
          // document.getElementById("modificar-rec-ubicacion").value = recurso.ubicacion;

          document.getElementById("modificar-rec-cant").value = recurso.cantidad;
          document.getElementById("modificar-rec-min").value = recurso.minimo;
          document.getElementById("modificar-rec-desc").value = recurso.descripcion;

          // --- LÓGICA DE CARGA Y PRESELECCIÓN DE CATEGORÍA ---
          const selectCategoriaModificar = document.getElementById("modificar-rec-cat");
          selectCategoriaModificar.innerHTML = '<option value="" disabled selected>Cargando categorías...</option>';

          // Usamos el filtro 'INSUMO' para obtener solo las categorías de insumos
          const urlConFiltro = `${CATEGORIAS_API_URL}?tipo=INSUMO`;

          fetch(urlConFiltro)
              .then(response => {
                  if (!response.ok) {
                      throw new Error("HTTP error! status: " + response.status);
                  }
                  return response.json();
              })
              .then(categorias => {
                  selectCategoriaModificar.innerHTML = '<option value="" disabled>Seleccione una Categoría</option>';

                  if (categorias.length === 0) {
                      selectCategoriaModificar.innerHTML = '<option value="" disabled selected>No hay categorías disponibles</option>';
                      return;
                  }

                  categorias.forEach(categoria => {
                      const option = document.createElement("option");
                      option.textContent = categoria.nombre;
                      option.value = categoria.id;

                      // LÓGICA DE SELECCIÓN: Si coincide con el ID actual, lo marca como seleccionado
                      if (String(categoria.id) === String(categoriaIdActual)) {
                          option.selected = true;
                      }

                      selectCategoriaModificar.appendChild(option);
                  });
              })
              .catch(error => {
                  console.error("Fallo al cargar categorías de edición (INSUMO):", error);
                  selectCategoriaModificar.innerHTML = '<option value="" disabled selected>Error al cargar</option>';
              });
          // --------------------------------------------------
        });

        // Creación y asignación del ícono y clases
        editar.className = "text-blue-600 hover:text-blue-900 mr-3";
        const editarIcon = document.createElement("i");
        editarIcon.className = "fas fa-edit";
        editar.appendChild(editarIcon);

        const eliminar = document.createElement("button");
        eliminar.className = "text-red-600 hover:text-red-900";
        eliminar.addEventListener("click", function () {
          if (confirm("¿Estás seguro de dar de baja el recurso?")) {
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

        // Se inserta el ID antes del Código
        columna.appendChild(id);
        //columna.appendChild(codigo);
        columna.appendChild(nombre);
        columna.appendChild(categoria);
        recurso.cantidad <= recurso.minimo ? stock.appendChild(minimo) : null;
        columna.appendChild(stock);
        columna.appendChild(acciones);
        acciones.appendChild(editar);
        acciones.appendChild(eliminar);

        tabla.appendChild(columna);
      });
    });
}
function reloadPage() {
  // Recargar la página para reflejar los cambios
  window.location.reload();
}
/**
 * Función que maneja el registro del nuevo Bien.
 */
function crearBien() {
  // Obtener valores y asegurar que el campo categoría funciona con el select
 const nombre = document.getElementById("registro-bien-nombre").value;
   const categoriaId = document.getElementById("registro-bien-cat").value; // Obtiene el ID (String)
   const codigo = document.getElementById("registro-bien-cod").value;
   const ubicacion = document.getElementById("registro-bien-ubi").value;
   const descripcion = document.getElementById("registro-bien-desc").value;

   // VALIDACIÓN BÁSICA DEL FORMULARIO
   if (!nombre || !categoriaId || !codigo || !ubicacion) {
       // Usamos categoriaId en lugar de la variable no definida 'categoria'
       alert("Por favor, complete todos los campos obligatorios (Nombre, Código, Categoría y Ubicación).");
       return;
   }
  const bien = {
    nombre: nombre,
    categoria: { id: parseInt(categoriaId) },
    codigo: codigo,
    cantidad: 0,
    minimo: 0,
    ubicacion: ubicacion,
    descripcion: descripcion,
    estado: true,
    condicion: "Disponible",
    tipo: "Bien",
  };

  fetch(RECURSOS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bien),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || err.error || response.statusText);
        });
      }
      return response.json();
    })
   .then((data) => {
       alert("Bien registrado exitosamente.");
       setTimeout(() => {
           if (typeof reloadPage === 'function') {
               reloadPage();
           } else {
               location.reload();
           }
           if (typeof hideResourceForm === 'function') {
               hideResourceForm('form-nuevo-bien');
           }
       }, 500); // Espera 500ms
   })
    .catch((error) => {
      console.error("Fallo al crear bien:", error);

      const errorMessage = error.message.includes("El código")
                           ? error.message
                           : "Error al intentar guardar el bien: " + error.message;

      alert(errorMessage);
    });
}
// Función corregida: modificarBien()
function modificarBien() {
  const bienId = document.getElementById("modificar-bien-id").value;
  const codigoExistente = document.getElementById("modificar-bien-cod").value;

  // Obtener el ID numérico del select de modificación.
  const categoriaId = document.getElementById("modificar-bien-cat").value;

  // Obtener otros campos
  const nombre = document.getElementById("modificar-bien-nombre").value;
  const ubicacion = document.getElementById("modificar-bien-ubi").value;
  const descripcion = document.getElementById("modificar-bien-desc").value;

  // Validación: Nombre y Ubicación son obligatorios
  if (!nombre || !ubicacion) {
      alert("Por favor, complete al menos Nombre y Ubicación.");
      return;
  }

  // CONSTRUCCIÓN DEL OBJETO CON LOS CAMPOS OBLIGATORIOS PARA LA ACTUALIZACIÓN
  const bien = {
    // Campos que el usuario puede cambiar:
    nombre: nombre,
    condicion: document.getElementById("modificar-bien-cond").value,
    ubicacion: ubicacion,
    descripcion: descripcion,

    // Campos inmutables/esenciales que deben enviarse:
    categoria: { id: parseInt(categoriaId) }, // La categoría no se edita, pero se envía su ID original
    codigo: codigoExistente, // El código no se edita

    // Otros campos que no se tocan, pero deben ser enviados si el backend los requiere
    // Si la cantidad y mínimo son gestionados por movimientos, el backend debería ignorarlos
    // o deberías obtener sus valores originales al cargar el formulario.
    // Los quitamos temporalmente para evitar el Bad Request, dejando que el backend mantenga los valores.
    // cantidad: 0, // <--- ELIMINADO
    // minimo: 0, // <--- ELIMINADO

    // Campos de estado
    estado: true,
    tipo: "Bien",
  };
  // 3. Llamada a la API usando el método PUT
  fetch(`http://localhost:8080/api/recursos/${bienId}`,
  {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bien),
  })
   .then((response) => {
       if (!response.ok) {
           return response.json().then(err => {
               throw new Error(err.message || 'Error desconocido del servidor');
           });
       }
       return response.json();
   })
   .then((data) => {
       alert("Bien modificado exitosamente.");

       // Ocultamos el formulario y recargamos
       if (typeof hideResourceForm === 'function') {
           hideResourceForm('form-modificar-bien');
       }
       if (typeof reloadPage === 'function') {
           reloadPage();
       } else {
           location.reload();
       }
   })
   .catch((error) => {
       console.error("Fallo al modificar bien:", error.message);
       alert("Fallo al modificar: " + (error.message || "Error desconocido."));
   });
}

function listarBienes() {
  const filtro = document.getElementById("filtroCategoria").value;

  fetch("http://localhost:8080/api/recursos/activos")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document.getElementById("tabla-bienes");
      tabla.innerHTML = "";

      const recursosBien = data.filter(recurso =>
          recurso.tipo && recurso.tipo === "Bien"
      );

      // Filtra las Categorías (por nombre)
      const categoriasFiltrados = filtro === "todos"
        ? recursosBien
        : recursosBien.filter(recurso =>
            // CORRECCIÓN 2: El filtro verifica la existencia de recurso.categoria.nombre
            // y lo compara con el filtro en minúsculas.
            recurso.categoria && recurso.categoria.nombre &&
            recurso.categoria.nombre.toLowerCase() === filtro
        );

      categoriasFiltrados.forEach((recurso) => {
        const columna = document.createElement("tr");

          const codigo= document.createElement("td");
                codigo.textContent = recurso.codigo;
                 codigo.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";
        const nombre = document.createElement("td");
        nombre.textContent = recurso.nombre;
        nombre.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

        // **********************************************
        // CORRECCIÓN 3: MOSTRAR EL NOMBRE DE LA CATEGORÍA
        // **********************************************
        const categoria = document.createElement("td");
        // Muestra el nombre, o 'N/A' si la categoría es null (seguridad)
        categoria.textContent = recurso.categoria ? recurso.categoria.nombre : 'N/A';
        categoria.className ="px-6 py-4 whitespace-nowrap text-sm text-gray-500";

        const descripcion = document.createElement("td");
        descripcion.textContent = recurso.descripcion || 'N/A';
        descripcion.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs";
        const condicion = document.createElement("td");
        condicion.textContent = recurso.condicion;
        condicion.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
        const ubicacion = document.createElement("td");
        ubicacion.textContent = recurso.ubicacion;
        ubicacion.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
        const acciones = document.createElement("td");
        acciones.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";

      const editar = document.createElement("button");
             editar.addEventListener("click", function () {
               showResourceForm("form-modificar-bien");

               const categoriaIdActual = recurso.categoria ? recurso.categoria.id : null;

               // 1. Asigna campos INMUTABLES y EDITABLES (esto es lo primero)
               document.getElementById("modificar-bien-id").value = recurso.id;
               document.getElementById("modificar-bien-cod").value = recurso.codigo;
               document.getElementById("modificar-bien-nombre").value = recurso.nombre;
               document.getElementById("modificar-bien-cond").value = recurso.condicion;
               document.getElementById("modificar-bien-ubi").value = recurso.ubicacion;
               document.getElementById("modificar-bien-desc").value = recurso.descripcion;

               // 2. LÓGICA DE CARGA Y PRESELECCIÓN DE CATEGORÍA PARA EDICIÓN
               const selectCategoriaModificar = document.getElementById("modificar-bien-cat");
               selectCategoriaModificar.innerHTML = '<option value="" disabled selected>Cargando categorías...</option>';

               const urlConFiltro = `${CATEGORIAS_API_URL}?tipo=BIEN`;

               fetch(urlConFiltro)
                   .then(response => {
                       if (!response.ok) {
                           throw new Error("HTTP error! status: " + response.status);
                       }
                       return response.json();
                   })
                   .then(categorias => {
                       selectCategoriaModificar.innerHTML = '<option value="" disabled>Seleccione una Categoría</option>';

                       if (categorias.length === 0) {
                           selectCategoriaModificar.innerHTML = '<option value="" disabled selected>No hay categorías disponibles</option>';
                           return;
                       }

                       categorias.forEach(categoria => {
                           const option = document.createElement("option");
                           option.textContent = categoria.nombre;
                           option.value = categoria.id;

                           // LÓGICA DE SELECCIÓN: Si coincide con el ID actual, lo marca como seleccionado
                           if (String(categoria.id) === String(categoriaIdActual)) {
                               option.selected = true;
                           }

                           selectCategoriaModificar.appendChild(option);
                       });
                   })
                   .catch(error => {
                       console.error("Fallo al cargar categorías de edición:", error);
                       selectCategoriaModificar.innerHTML = '<option value="" disabled selected>Error al cargar</option>';
                   });
             });

             // 3. CREACIÓN Y ASIGNACIÓN DEL ÍCONO Y CLASES (Restaurado)
             editar.className = "text-blue-600 hover:text-blue-900 mr-3";
             const editarIcon = document.createElement("i");
             editarIcon.className = "fas fa-edit"; // Ícono de Font Awesome
             editar.appendChild(editarIcon);

         const eliminar = document.createElement("button");
                eliminar.className = "text-red-600 hover:text-red-900";
                eliminar.addEventListener("click", function () {
                  if (confirm("¿Estás seguro de dar de baja este bien?")) {
                    fetch(
                      "http://localhost:8080/api/recursos/" + recurso.id + "/darDeBaja",
                      {
                        method: "PATCH",
                      }
                    )
                      .then((response) => response.json())
                      .then((data) => reloadPage())
                      .catch((error) =>
                        console.error("Error al dar de baja el bien:", error));
                    reloadPage();
                  }
                });
        eliminar.className = "text-red-600 hover:text-red-900";
        const eliminarIcon = document.createElement("i");
        eliminarIcon.className = "fas fa-trash";
        eliminar.appendChild(eliminarIcon);

        columna.appendChild(codigo);
        columna.appendChild(nombre);       // 1. Nombre
        columna.appendChild(categoria);    // 2. Categoría
        columna.appendChild(descripcion);  // 3. Descripción
        columna.appendChild(condicion);    // 4. Condición
        columna.appendChild(ubicacion);    // 5. Ubicación
        columna.appendChild(acciones);     // 6. Acciones

        acciones.appendChild(editar);
        acciones.appendChild(eliminar);
        tabla.appendChild(columna);
      });
    });
}

//Funciones para recurso
function crearRecurso() {
  const nombreRecurso = document.getElementById("registro-rec-nombre").value;
  const categoriaId = document.getElementById("registro-rec-cat").value; // Este es el ID de la categoría

  // 🛑 1. VALIDACIÓN DEL NOMBRE 🛑
  if (!nombreRecurso || nombreRecurso.trim() === "") {
    alert("El nombre del insumo no puede estar en blanco.");
    return;
  }

  // 🛑 2. VALIDACIÓN DE LA CATEGORÍA 🛑
  // Asumo que el valor vacío es 0 o una cadena vacía si no se selecciona nada.
  // Ajusta '0' si tu opción por defecto es otra.
  if (!categoriaId || categoriaId === "" || parseInt(categoriaId) === 0) {
    alert("Debe seleccionar una categoría para el insumo.");
    return;
  }


  // Continuamos si las validaciones pasan
  const minimoInput = document.getElementById("registro-rec-min").value;
  const minimoValido = minimoInput ? parseInt(minimoInput) : 0;
  const descripcion = document.getElementById("registro-rec-desc").value;

  const recurso = {
      nombre: nombreRecurso.trim(),
      categoria: { id: parseInt(categoriaId) }, // Aquí usamos el ID validado
      codigo: "",
      cantidad: 0,
      minimo: minimoValido,
      ubicacion: "",
      descripcion: descripcion,
      estado: true,
      condicion: "",
      tipo: "Insumo",
  };

  fetch("http://localhost:8080/api/recursos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recurso),
  })
    .then((response) => {
        if (!response.ok) {
            return response.text().then(errorText => {
                throw new Error(`Error ${response.status}: ${errorText || 'Error sin mensaje del servidor.'}`);
            });
        }
        return response.json();
    })
    .then((data) => {
      alert("Insumo registrado exitosamente.");
      reloadPage();
    })
    .catch((error) => {
      console.error("Fallo al crear insumo:", error);
      alert("Error al guardar insumo: " + (error.message || "Verifique la consola para detalles."));
    });
}
function modificarRecurso() {
  const recursoId = document.getElementById("modificar-rec-id").value;

  // Capturar valores numéricos de forma segura: convierte a número o usa 0
  const cantidadVal = document.getElementById("modificar-rec-cant").value;
  const minimoVal = document.getElementById("modificar-rec-min").value;
  const categoriaId = document.getElementById("modificar-rec-cat").value;


  const recurso = {
    nombre: document.getElementById("modificar-rec-nombre").value,
    categoria: { id: parseInt(categoriaId) },
    cantidad: cantidadVal ? parseInt(cantidadVal) : 0,
    minimo: minimoVal ? parseInt(minimoVal) : 0,
    ubicacion: " ", // Mantener si no hay input
    descripcion: document.getElementById("modificar-rec-desc").value,
    estado: true,
    condicion: " ",
    tipo: "Insumo"
  };

  fetch("http://localhost:8080/api/recursos/" + recursoId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recurso),
  })
    .then((response) => response.json())
    .then((data) => {
           alert("Insumo modificado exitosamente.");

           // Ocultamos el formulario y recargamos
           if (typeof hideResourceForm === 'function') {
               hideResourceForm('form-modificar-rec');
           }
           if (typeof reloadPage === 'function') {
               reloadPage();
           } else {
               location.reload();
           }
       })
    .catch((error) => console.error("Error al modificar insumo:", error));
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

function generarReporteMovimientoPDF(movimientos) {
  try {
    // Se asume que jspdf y autotable están cargados globalmente.
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    console.log("Función generar reporte movimiento ejecutada.");
    doc.setFontSize(16);

    // Obtener fechas del formulario (IDs: fechaInicio, fechaFin)
    const fechaInicio = document.getElementById("fechaInicio").value; // formato YYYY-MM-DD
    const fechaFin = document.getElementById("fechaFin").value;       // formato YYYY-MM-DD

    // Aplicar filtro si hay fechas cargadas
    let movimientosFiltrados = movimientos;
    if (fechaInicio && fechaFin) {
      movimientosFiltrados = movimientos.filter(mov => {
        // La fecha puede venir en 'fecha' o 'fechaGeneracion'. Se usa 'fecha' como preferencia.
        const fechaBase = mov.fecha || mov.fechaGeneracion;
        if (!fechaBase) return false; // Ignorar si no hay campo de fecha

        // Tomar solo la parte de la fecha (YYYY-MM-DD)
        const fechaMov = fechaBase.split("T")[0];

        return fechaMov >= fechaInicio && fechaMov <= fechaFin;
      });
    }

    // Preparar fecha de generación del reporte
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy=`${dd}/${mm}/${yyyy}`;

    // Manejar caso de movimientos vacíos
    if (movimientosFiltrados.length === 0) {
      doc.text("No hay Movimientos en el rango seleccionado.", 14, 20);
      doc.text(fechaHoy, 190, 20, { align: "right" });
      doc.save("reporte_movimiento.pdf");
      return;
    }

    // Encabezado del reporte
    doc.text("Reporte de Movimientos de Recursos", 14, 20);
    doc.text(fechaHoy, 190, 20, { align: "right" });

    // --- NUEVO TEXTO BAJO EL TÍTULO ---
    doc.setFontSize(12);
    doc.text("Dirigido a quien corresponda", 14, 28);
    // ------------------------------------

    // Definición de las columnas del reporte según la solicitud
    const columns = [
      "Fecha",
      "Nombre de Insumo",
      "Cantidad",
      "Observaciones",
      "Usuario que Ingresó",
    ];

    // Mapeo de datos a filas de la tabla
    const rows = movimientosFiltrados.map(mov => {
      // Formateo de fecha
      const fechaBase = mov.fecha || mov.fechaGeneracion;
      const fechaObj = new Date(fechaBase);
      const dia = String(fechaObj.getDate()).padStart(2, "0");
      const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
      const anio = fechaObj.getFullYear();
      const fechaFormateada = `${dia}-${mes}-${anio}`;

      // Extracción del Nombre de Usuario
      const nombreUsuario = mov.generadoPor && mov.generadoPor.nombre
                            ? mov.generadoPor.nombre
                            : 'Desconocido';

      // Extracción del Nombre del Recurso
      const nombreInsumo = mov.recurso && mov.recurso.nombre ? mov.recurso.nombre : 'Insumo N/A';

      return [
        fechaFormateada,
        nombreInsumo,
        mov.cantidad,
        mov.observaciones || '', // Asegurar que sea una cadena vacía si es nulo
        nombreUsuario,
      ];
    });

    // Generar la tabla con autoTable (startY ajustado a 35 para dar espacio al nuevo texto)
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 35, // Aumentado de 30 a 35 para acomodar la nueva línea
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
          // Ajustes para que las columnas de texto (Insumo, Observaciones) se adapten
          1: { cellWidth: 'auto' }, // Nombre de Insumo
          3: { cellWidth: 'auto' }, // Observaciones
      }
    });

    // Código eliminado: Texto final "Generado en base a..."
    /*
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Generado en base a los movimientos registrados en el sistema.", 14, finalY);
    */

    doc.save("reporte_movimiento_actualizado.pdf");
  } catch (error) {
    console.error("Error al generar el PDF. Revise la carga de jspdf y jspdf-autotable:", error);
  }
}

function generarReporte(tipo) {
  const usuarioId = JSON.parse(localStorage.getItem("usuarioLogueado")).id;

  let url = "http://localhost:8080/api/reportes/generar?tipo=" + tipo + "&idUsuario=" + usuarioId;
  fetch(url, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      switch (tipo) {
        case "stock_minimo":
          // Pasar solo los datos ya filtrados por el backend
          generarReporteStockMinimoPDF(data);
          break;
        case "inventario":
        // ...
        case "movimiento":
        generarReporteMovimientoPDF(data);
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Obtener insumos para listarlos en select
function obtenerInsumosSelect(){
  fetch('http://localhost:8080/api/recursos/activos')
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


=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

//----------Gestion Solicitante------------------------------------------
// Variable global para guardar el ID del solicitante que se está editando
let solicitanteIdEditando = null;

// URL base del API para Solicitantes
const API_URL = "http://localhost:8080/api/solicitantes";

// --- Funciones de Utilidad y Gestión de Vistas ---

// Función asumida para recargar la lista de datos
function reloadPage() {
    listarSolicitantes();
}

// === MOSTRAR FORMULARIO ===
function showResourceForm(formId) {
    document.getElementById(formId).classList.remove("hidden");
}

// === OCULTAR FORMULARIO ===
function hideResourceForm(formId) {
    document.getElementById(formId).classList.add("hidden");
    // Limpiar el ID de edición al cerrar el formulario de modificar
    if (formId === "form-modificar-solicitante") {
        solicitanteIdEditando = null;
    }
    limpiarFormulario();
}

// === LIMPIAR FORMULARIO (de nuevo) ===
function limpiarFormulario() {
    document.getElementById("solicitante-dni").value = "";
    document.getElementById("solicitante-nombre").value = "";
    document.getElementById("solicitante-puesto").value = "";
}

// === FUNCIÓN PARA ABRIR EN MODO NUEVO ===
window.abrirNuevoSolicitante = function() {
    solicitanteIdEditando = null;
    limpiarFormulario();

    document.getElementById("form-modificar-solicitante").classList.add("hidden");

    showResourceForm("form-nuevo-solicitante");
}

// --- CRUD Solicitantes ---

// Inicialización
document.addEventListener('DOMContentLoaded', listarSolicitantes);

// === LISTAR SOLICITANTES (GET) ===
function listarSolicitantes() {
    fetch(API_URL)
        .then((response) => {
            if (!response.ok) throw new Error("Error al obtener solicitantes");
            return response.json();
        })
        .then((data) => {
            const tabla = document.getElementById("tabla-solicitantes");
            tabla.innerHTML = "";

            data.forEach((solicitante) => {
                const fila = crearFilaSolicitante(solicitante);
                tabla.appendChild(fila);
            });
        })
        .catch((error) => console.error("Error al obtener solicitantes:", error));
}

// === CREAR FILA DE TABLA ===
function crearFilaSolicitante(solicitante) {
    const columna = document.createElement("tr");

    const dni = document.createElement("td");
    dni.textContent = solicitante.dni;
    dni.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700";

    const nombre = document.createElement("td");
    nombre.textContent = solicitante.nombre;
    nombre.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700";

    const puesto = document.createElement("td");
    puesto.textContent = solicitante.puesto;
    puesto.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700";

    const acciones = document.createElement("td");
    acciones.className = "px-6 py-4 whitespace-nowrap text-center";

    // Botón editar
    const editar = document.createElement("button");
    editar.addEventListener("click", function () {
        editarSolicitante(solicitante);
    });
    editar.className = "text-blue-600 hover:text-blue-800 mr-3";
    const editarIcon = document.createElement("i");
    editarIcon.className = "fas fa-edit";
    editar.appendChild(editarIcon);

    // Botón eliminar (dar de baja lógica)
    const eliminar = document.createElement("button");
    eliminar.className = "text-red-600 hover:text-red-800";
    eliminar.addEventListener("click", function () {
        if (solicitante.id) {
             eliminarSolicitante(solicitante.id);
        } else {
             console.error("El solicitante no tiene ID para eliminar.");
        }
    });
    const eliminarIcon = document.createElement("i");
    eliminarIcon.className = "fas fa-trash";
    eliminar.appendChild(eliminarIcon);


    acciones.appendChild(editar);
    acciones.appendChild(eliminar);

    columna.appendChild(dni);
    columna.appendChild(nombre);
    columna.appendChild(puesto);
    columna.appendChild(acciones);

    return columna;
}


// === CREAR SOLICITANTE (POST) ===
window.crearSolicitante = function() {
    const solicitante = {
        dni: document.getElementById("solicitante-dni").value.trim(),
        nombre: document.getElementById("solicitante-nombre").value.trim(),
        puesto: document.getElementById("solicitante-puesto").value.trim(),
    };

    if (!solicitante.dni || !solicitante.nombre || !solicitante.puesto) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solicitante),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Error al crear solicitante");
            return res.json();
        })
        .then(() => {
            hideResourceForm("form-nuevo-solicitante");
            reloadPage();
            alert("Solicitante creado exitosamente.");
        })
        .catch((err) => console.error("Error al crear solicitante:", err));
}


// === EDITAR SOLICITANTE (Llenar formulario de MODIFICACIÓN) ===
function editarSolicitante(solicitud) {
    solicitanteIdEditando = solicitud.id;

    document.getElementById("modificar-solicitante-dni").value = solicitud.dni;
    document.getElementById("modificar-solicitante-nombre").value = solicitud.nombre;
    document.getElementById("modificar-solicitante-puesto").value = solicitud.puesto;

    document.getElementById("form-nuevo-solicitante").classList.add("hidden");

    showResourceForm("form-modificar-solicitante");
}


// === MODIFICAR SOLICITANTE (PUT) ===
window.modificarSolicitante = function() {
    if (!solicitanteIdEditando) {
        console.error("No hay ID de solicitante para modificar.");
        return;
    }

    const solicitante = {
        dni: document.getElementById("modificar-solicitante-dni").value.trim(),
        nombre: document.getElementById("modificar-solicitante-nombre").value.trim(),
        puesto: document.getElementById("modificar-solicitante-puesto").value.trim(),
    };

    if (!solicitante.dni || !solicitante.nombre || !solicitante.puesto) {
        alert("Por favor, completa todos los campos de modificación.");
        return;
    }

    fetch(`${API_URL}/${solicitanteIdEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solicitante)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error en la modificación");
            return response.json();
        })
        .then(() => {
            hideResourceForm("form-modificar-solicitante");
            reloadPage();
            alert("Solicitante modificado exitosamente.");
        })
        .catch(error => console.error("Error al modificar solicitante:", error));
}


// === ELIMINAR SOLICITANTE (CORREGIDO PARA USAR DELETE) ===
function eliminarSolicitante(idSolicitante) {
    if (confirm("¿Estás seguro de dar de baja este solicitante?")) {
        fetch(`http://localhost:8080/api/solicitantes/${idSolicitante}`, {
            // Se usa DELETE porque es el único método implementado en tu SolicitanteControlador
            method: "DELETE",
        })
        .then((res) => {
             if (!res.ok) {
                 // Esto capturará cualquier error, incluido si DELETE falla por alguna razón
                 throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
             }
             // Si el servidor responde con éxito (ej: 200 OK, 204 No Content), recargamos
             reloadPage();
        })
        .catch((err) => {
            console.error("Error al dar de baja solicitante:", err);
            alert(`Error al dar de baja el solicitante: ${err.message}.`);
        });
    }
}


function cargarSolicitantesDisponibles() {
    const selectSolicitante = document.getElementById("registro-solcBi-solicitabien");

    fetch('http://localhost:8080/api/solicitantes')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
        })
        .then(solicitantes => {
            if (solicitantes.length === 0) {
                 selectSolicitante.innerHTML = '<option value="" disabled selected>No hay Solicitantes disponibles</option>';
                 return;
            }

            // Rellena con los Solicitantes (asumiendo que tienen 'id' y 'nombre'/'apellido' o similar)
            solicitantes.forEach(solicitante => {
                const option = document.createElement("option");
                // Muestra el nombre completo o un identificador
                option.textContent = solicitante.nombre; // AJUSTAR SEGÚN LA ESTRUCTURA DE TU ENTIDAD SOLICITANTE
                // El valor es el ID del Solicitante (que el Backend espera)
                option.value = solicitante.id;
                selectSolicitante.appendChild(option);
            });

            console.log(`Solicitantes cargados (${solicitantes.length} encontrados).`);
        })
        .catch(error => {
            console.error("Fallo al cargar Solicitantes:", error);
            selectSolicitante.innerHTML = '<option value="" disabled selected>Error al cargar solicitantes</option>';
        });
}

function cargarBienesDisponibles() {
    const selectBienes = document.getElementById("registro-solcBi-nomBien");

    fetch('http://localhost:8080/api/recursos')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
        })
        .then(recursos => {

            const bienes = recursos.filter(recursos => recursos.tipo === "Bien");

            console.log("Bienes disponibles:", bienes);

            if (bienes.length === 0) {
                 selectBienes.innerHTML = '<option value="" disabled selected>No hay bienes disponibles</option>';
                 return;
            }
            

            // Rellena con los Solicitantes (asumiendo que tienen 'id' y 'nombre'/'apellido' o similar)
            bienes.forEach(bien => {
                const option = document.createElement("option");
                // Muestra el nombre completo o un identificador
                option.textContent = bien.nombre; 
                option.value = bien.id;
                selectBienes.appendChild(option);
            });

            console.log(`Solicitantes cargados (${bienes.length} encontrados).`);
        })
        .catch(error => {
            console.error("Fallo al cargar bienes:", error);
            selectSolicitante.innerHTML = '<option value="" disabled selected>Error al cargar bienes</option>';
        });
}




// --- Validación de DNI (Se mantiene) ---
document.addEventListener('DOMContentLoaded', () => {
    const dniInputs = [
        document.getElementById('solicitante-dni'),
        document.getElementById('modificar-solicitante-dni')
    ].filter(input => input);

    dniInputs.forEach(dniInput => {
        dniInput.addEventListener('keypress', (e) => {
            const char = e.key;
            if (!/[0-9]/.test(char) && e.key !== 'Backspace') {
                e.preventDefault();
            }
        });
        dniInput.addEventListener('paste', (e) => {
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            if (!/^\d+$/.test(pasted)) {
                e.preventDefault();
            }
        });
        dniInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
});


function crearCategoria() {
  const nombreInput = document.getElementById("registro-cat-nombre");
  const tipoSelect = document.getElementById("registro-cat-tipo");

  if (!nombreInput || !tipoSelect) {
    alert("Formulario de categoría incompleto en el HTML.");
    return;
  }

  const nombre = nombreInput.value.trim();
  const tipoTexto = tipoSelect.options[tipoSelect.selectedIndex].text.trim();

  if (!nombre) {
    alert("El nombre de la categoría es obligatorio.");
    return;
  }
  if (!tipoTexto || tipoTexto.toLowerCase().includes("seleccione")) {
    alert("Seleccione un tipo válido (Bien o Insumo).");
    return;
  }

  // Mapear texto del select al enum que espera el backend
  let tipoEnum;
  if (/insumo/i.test(tipoTexto)) tipoEnum = "INSUMO";
  else if (/bien/i.test(tipoTexto)) tipoEnum = "BIEN";
  else {
    alert("Tipo de categoría inválido.");
    return;
  }

  const categoria = {
    nombre: nombre,
    tipo: tipoEnum
  };

  fetch("http://localhost:8080/api/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria)
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((txt) => {
          throw new Error(txt || `HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      alert("Categoría creada correctamente.");
      // limpiar formulario y cerrar
      nombreInput.value = "";
      tipoSelect.selectedIndex = 0;
      if (typeof hideResourceForm === "function") hideResourceForm("form-nueva-categoria");
      // refrescar lista / selects si existen las funciones
      if (typeof listarCategorias === "function") listarCategorias();
      else reloadPage();
      if (typeof actualizarSelectsCategorias === "function") actualizarSelectsCategorias();
    })
    .catch((err) => {
      console.error("Error al crear categoría:", err);
      alert("Error al crear categoría: " + (err.message || "Revisa la consola"));
    });
}

// Lista categorías de tipo BIEN
function listarCategoriasBienes() {
  fetch("http://localhost:8080/api/categorias")
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((cats) => {
      const tabla = document.getElementById("tabla-categorias-bienes");
      if (!tabla) {
        console.warn("No se encontró #tabla-categorias-bienes");
        return;
      }
      tabla.innerHTML = "";
      const bienes = (Array.isArray(cats) ? cats : []).filter(c => c.tipo === "BIEN");
      console.log("Categorías de bienes:", bienes);
      if (bienes.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-sm text-gray-500">No hay categorías de bienes.</td></tr>`;
               return;
      }
      bienes.forEach(cat => {
        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";
        tdNombre.textContent = cat.nombre || "";

        const tdTipo = document.createElement("td");
        tdTipo.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
        tdTipo.textContent = "Bien";

        const tdAcc = document.createElement("td");
        tdAcc.className = "px-6 py-4 whitespace-nowrap text-sm";

        const btnEdit = document.createElement("button");
        btnEdit.className = "text-blue-600 hover:text-blue-900 mr-3";
        btnEdit.innerHTML = '<i class="fas fa-edit"></i>';
        btnEdit.addEventListener("click", () => {
          const idInput = document.getElementById("modificar-cat-id");
          const nombreInput = document.getElementById("modificar-cat-nombre");
          const tipoSelect = document.getElementById("modificar-cat-tipo");
          if (idInput) idInput.value = cat.id;
          if (nombreInput) nombreInput.value = cat.nombre;
          if (tipoSelect) tipoSelect.value = cat.tipo;
          showResourceForm("form-modificar-categoria");
        });

        const btnDel = document.createElement("button");
        btnDel.className = "text-red-600 hover:text-red-900";
        btnDel.innerHTML = '<i class="fas fa-trash"></i>';
        btnDel.addEventListener("click", () => {
          if (!confirm(`¿Eliminar categoría "${cat.nombre}"?`)) return;
          fetch(`http://localhost:8080/api/categorias/${cat.id}`, { method: "DELETE" })
            .then(r => {
              if (!r.ok) return r.text().then(t => { throw new Error(t || r.status); });
              listarCategoriasBienes();
              actualizarSelectsCategorias && typeof actualizarSelectsCategorias === "function" && actualizarSelectsCategorias();
            })
            .catch(err => {
              console.error("Error eliminar categoría:", err);
              alert("No se pudo eliminar la categoría. Revisa la consola.");
            });
        });

        tdAcc.appendChild(btnEdit);
        tdAcc.appendChild(btnDel);

        tr.appendChild(tdNombre);
        tr.appendChild(tdTipo);
        tr.appendChild(tdAcc);
        tabla.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Error listarCategoriasBienes:", err);
      const tabla = document.getElementById("tabla-categorias-bienes");
      if (tabla) tabla.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-sm text-red-600">Error cargando categorías.</td></tr>`;
    });
}

// Lista categorías de tipo INSUMO en <tbody id="tabla-categorias-insumos">
function listarCategoriasInsumos() {
  fetch("http://localhost:8080/api/categorias")
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((cats) => {
      const tabla = document.getElementById("tabla-categorias-insumos");
      if (!tabla) {
        console.warn("No se encontró #tabla-categorias-insumos");
        return;
      }
      tabla.innerHTML = "";
      const insumos = (Array.isArray(cats) ? cats : []).filter(c => c.tipo === "INSUMO");
      if (insumos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-sm text-gray-500">No hay categorías de insumos.</td></tr>`;
        return;
      }
      insumos.forEach(cat => {
        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.className = "px-6 py-4 whitespace-nowrap text-sm font-medium";
        tdNombre.textContent = cat.nombre || "";

        const tdTipo = document.createElement("td");
        tdTipo.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
        tdTipo.textContent = "Insumo";

        const tdAcc = document.createElement("td");
        tdAcc.className = "px-6 py-4 whitespace-nowrap text-sm";

        const btnEdit = document.createElement("button");
        btnEdit.className = "text-blue-600 hover:text-blue-900 mr-3";
        btnEdit.innerHTML = '<i class="fas fa-edit"></i>';
        btnEdit.addEventListener("click", () => {
          const idInput = document.getElementById("modificar-cat-id");
          const nombreInput = document.getElementById("modificar-cat-nombre");
          const tipoSelect = document.getElementById("modificar-cat-tipo");
          if (idInput) idInput.value = cat.id;
          if (nombreInput) nombreInput.value = cat.nombre;
          if (tipoSelect) tipoSelect.value = cat.tipo;
          showResourceForm("form-modificar-categoria");
        });

        const btnDel = document.createElement("button");
        btnDel.className = "text-red-600 hover:text-red-900";
        btnDel.innerHTML = '<i class="fas fa-trash"></i>';
        btnDel.addEventListener("click", () => {
          if (!confirm(`¿Eliminar categoría "${cat.nombre}"?`)) return;
          fetch(`http://localhost:8080/api/categorias/${cat.id}`, { method: "DELETE" })
            .then(r => {
              if (!r.ok) return r.text().then(t => { throw new Error(t || r.status); });
              listarCategoriasInsumos();
              actualizarSelectsCategorias && typeof actualizarSelectsCategorias === "function" && actualizarSelectsCategorias();
            })
            .catch(err => {
              console.error("Error eliminar categoría:", err);
              alert("No se pudo eliminar la categoría. Revisa la consola.");
            });
        });

        tdAcc.appendChild(btnEdit);
        tdAcc.appendChild(btnDel);

        tr.appendChild(tdNombre);
        tr.appendChild(tdTipo);
        tr.appendChild(tdAcc);
        tabla.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Error listarCategoriasInsumos:", err);
      const tabla = document.getElementById("tabla-categorias-insumos");
      if (tabla) tabla.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-sm text-red-600">Error cargando categorías.</td></tr>`;
    });
}

// Llamadas iniciales para poblar las dos tablas
document.addEventListener("DOMContentLoaded", () => {
  listarCategoriasBienes();
  listarCategoriasInsumos();
});


// Gestión de Solicitudes de Bienes--------------------------------------------------


// Mostrar un formulario y ocultar los demás
function showResourceForm(formId) {
    document.querySelectorAll(".form-container").forEach(form => {
        form.classList.add("hidden");
    });
    const form = document.getElementById(formId);
    if (form) form.classList.remove("hidden");
}

// Ocultar un formulario
function hideResourceForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.classList.add("hidden");
}

//-------------------- VER DETALLE (OJITO) --------------------

let solicitudSeleccionadaBien = null;

function verDetalleSolicitudBien(id) {
    const solicitud = solicitudesBienes.find(s => s.id === id);
    if (!solicitud) return;

    solicitudSeleccionadaBien = solicitud;

    // Llenar campos
    document.getElementById("ver-solcBi-numt").value = solicitud.numeroT;
    document.getElementById("ver-solcBi-area").value = solicitud.area;
    document.getElementById("ver-solcBi-nombien").value = solicitud.bien;
    document.getElementById("ver-solcBi-solicitabien").value = solicitud.solicitante;
    document.getElementById("ver-solcBi-fecha").value = solicitud.fecha;

    // Mostrar formulario de ver
    showResourceForm("form-ver-solicitudBienes");
}

// Aceptar solicitud desde el formulario de visualización
function aceptarSolicitudBien() {
    if (!solicitudSeleccionadaBien) return;

    solicitudSeleccionadaBien.estado = "aceptada";

    renderTablaSolicitudes();
    hideResourceForm("form-ver-solicitudBienes");

    alert("Solicitud aceptada correctamente.");
}


function crearSolicitudInsumos() {
    const numeroT = document.getElementById("registro-insumo-numeroT").value.trim();
    const area = document.getElementById("registro-insumo-area").value.trim();
    const solicitanteId = solicitanteSelect.value;
    const fecha = document.getElementById("registro-insumo-fecha").value.trim();

    if (!numeroT || !area || !solicitanteId || !fecha) {
        alert("Complete todos los campos antes de guardar.");
        return;
    }

    if (solicitudesInsumos.some(s => s.numeroT === numeroT)) {
        alert("Ya existe una solicitud con ese número de trámite.");
        return;
    }

    const insumos = [];
    document.querySelectorAll("#contenedor-insumos .insumo-item").forEach(item => {
        const nombre = item.querySelector(".input-insumo-nombre").value.trim();
        const cantidad = item.querySelector(".input-insumo-cantidad").value.trim();
        if (nombre && cantidad) insumos.push({ nombre, cantidad });
    });

    if (insumos.length === 0) {
        alert("Debe agregar al menos un insumo.");
        return;
    }
      const nuevaSolicitud = {
        nroTramite: numeroT,
        area: area,
        fechaSolicitud: fecha,
        estado: "PENDIENTE",
        solicitante: {
            id: parseInt(solicitanteId)
        },
        insumosSolicitados: insumos
    };

    solicitudesInsumos.push(nuevaSolicitud);
    guardarEnLocalStorageInsumos();
    renderTablaSolicitudesInsumos();
    limpiarFormularioSolicitudInsumos();
    hideResourceForm("form-nueva-solicitudInsumos");
    alert("Solicitud registrada correctamente.");
}

function crearSolicitudBien() {



    const numeroT = document.getElementById("registro-solcBi-numeroT").value.trim();
    const area = document.getElementById("registro-solcBi-Area").value.trim();
    console.log("bienId seleccionado:", document.getElementById("registro-solcBi-nomBien").value);
    // CLAVE: Captura el ID del Solicitante del nuevo
    const solicitanteId = document.getElementById("registro-solcBi-solicitabien").value;
    const fecha = document.getElementById("registro-solcBi-fecha").value.trim();



    
    // 1. Validaciones
    if (!numeroT || !area || !solicitanteId || !fecha) { // Usamos solicitanteId aquí
        alert("Complete todos los campos antes de guardar.");
        return;
    }
    

    const bienes = [];
    document.querySelectorAll("#contenedor-bienes .insumo-item").forEach(item => {

        const bienIds = document.getElementById("registro-solcBi-nomBien").value;
        bienes.push(bienIds);
    }); 

    console.log("bienes seleccionados:", bienes);

    if (bienes.length === 0) {
        alert("Debe agregar al menos un bienes.");
        return;
    }
        const nuevaSolicitud = {
        nroTramite: numeroT,
        area: area,
        fechaSolicitud: fecha,
        estado: "PENDIENTE", // Valor por defecto
        solicitante: {
            id: parseInt(solicitanteId)
        },
        bienesSolicitados: [
            {
                id: parseInt(bienes)
            }
        ]
    };
    // 3. Integración con el SolicitudControlador (POST)
    fetch("http://localhost:8080/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSolicitud),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(errorText => {
                throw new Error(`Error ${response.status}: ${errorText || 'Error al procesar la solicitud.'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        alert("Solicitud registrada correctamente.");
        // Después de crear, refresca la lista/página
        listarSolicitudes();
        hideResourceForm("form-nueva-solicitudBienes");
        reloadPage();
    })
    .catch(error => {
        console.error("Fallo al crear solicitud de Bien:", error);
        alert("Error al guardar la solicitud: " + error.message);
    });
}

function listarSolicitudes() {
    const tablaSolicitudes = document.getElementById("tabla-solicitudes-bienes"); // Asegúrate de que este ID exista
    if (!tablaSolicitudes) return;

    fetch("http://localhost:8080/api/solicitudes")
        .then(response => response.json())
        .then(solicitudes => {
            tablaSolicitudes.innerHTML = ''; // Limpiar tabla

            solicitudes.forEach(solicitud => {
                const columna = document.createElement("tr");

                // --- Extracción del Bien (el primer recurso asociado) ---
                let nombreBien = 'N/A';
                if (solicitud.recursosAsociados && solicitud.recursosAsociados.size > 0) {
                    // Como asumimos una Solicitud de Bien simple (un solo recurso), tomamos el primero
                    const primerRecursoAsociado = solicitud.recursosAsociados.values().next().value;
                    if (primerRecursoAsociado && primerRecursoAsociado.recurso) {
                         nombreBien = primerRecursoAsociado.recurso.nombre;
                    }
                }
                // Formato de fecha
                const fecha = new Date(solicitud.fechaSolicitud).toLocaleDateString();

                columna.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${solicitud.nroTramite}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${solicitud.area}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${nombreBien}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${solicitud.solicitante.nombre}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fecha}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="mostrar(${solicitud.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="mostrarFormularioEditarSolicitud(${solicitud.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarSolicitud(${solicitud.id})" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tablaSolicitudes.appendChild(columna);
            });
        })
        .catch(error => console.error("Error al listar solicitudes:", error));
}
function eliminarSolicitud(id) {
    if (confirm("¿Estás seguro de eliminar la solicitud con ID " + id + "?")) {
        fetch(`http://localhost:8080/api/solicitudes/${id}`, {
            method: "DELETE",
        })
        .then(response => {
            if (response.ok) {
                alert("Solicitud eliminada correctamente.");
                listarSolicitudes(); // Refresca la tabla
            } else {
                throw new Error("Fallo en la eliminación.");
            }
        })
        .catch(error => {
            console.error("Error al eliminar solicitud:", error);
            alert("Hubo un error al eliminar la solicitud.");
        });
    }
}



// Modificar una solicitud existente
function modificarSolicitudBien() {
    const numeroT = document.getElementById("modificar-solcBi-numt").value.trim();
    const area = document.getElementById("modificar-solcBi-area").value.trim();
    const bien = document.getElementById("modificar-solcBi-nombien").value.trim();
    const solicitante = document.getElementById("modificar-solcBi-solicitabien").value.trim();
    const fecha = document.getElementById("modificar-solcBi-fecha").value.trim();

    const solicitud = solicitudesBienes.find(s => s.numeroT === numeroT);
    if (!solicitud) {
        alert("No se encontró la solicitud para modificar.");
        return;
    }

    solicitud.area = area;
    solicitud.bien = bien;
    solicitud.solicitante = solicitante;
    solicitud.fecha = fecha;

  
    hideResourceForm("form-modificar-solicitudBienes");
    alert("Solicitud modificada correctamente.");
}

// Eliminar una solicitud
function eliminarSolicitud(id) {
    const confirmar = confirm("¿Desea eliminar esta solicitud?");
    if (!confirmar) return;

    solicitudesBienes = solicitudesBienes.filter(s => s.id !== id);
    renderTablaSolicitudes();
}

// Renderizar tabla con las solicitudes
function renderTablaSolicitudes() {
    const tbody = document.getElementById("tabla-solicitudes-bienes");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (solicitudesBienes.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 6;
        celda.textContent = "No hay solicitudes registradas.";
        celda.classList.add("text-center", "py-4", "text-gray-500");
        fila.appendChild(celda);
        tbody.appendChild(fila);
        return;
    }

    solicitudesBienes.forEach(s => {
        const fila = document.createElement("tr");

        const colNum = document.createElement("td");
        colNum.textContent = s.numeroT;
        colNum.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colArea = document.createElement("td");
        colArea.textContent = s.area;
        colArea.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colBien = document.createElement("td");
        colBien.textContent = s.bien;
        colBien.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colSolicitante = document.createElement("td");
        colSolicitante.textContent = s.solicitante;
        colSolicitante.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colFecha = document.createElement("td");
        colFecha.textContent = s.fecha;
        colFecha.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colAcciones = document.createElement("td");
        colAcciones.classList.add("px-6", "py-3", "text-sm", "flex", "space-x-4");

        // Botón Ver (ojito)
        const btnVer = document.createElement("button");
        btnVer.innerHTML = `<i class="fas fa-eye text-gray-700 hover:text-black text-lg"></i>`;
        btnVer.title = "Ver detalles";
        btnVer.onclick = function() {
        verDetalleSolicitudBien(s.id);
                };

        // Botón Editar (ícono)
        const btnEditar = document.createElement("button");
        btnEditar.innerHTML = `<i class="fas fa-edit text-blue-600 hover:text-blue-900 text-lg"></i>`;
        btnEditar.title = "Editar";
        btnEditar.onclick = function() {
            editarSolicitud(s.id);
        };

        // Botón Eliminar (ícono)
        const btnEliminar = document.createElement("button");
        btnEliminar.innerHTML = `<i class="fas fa-trash text-red-600 hover:text-red-900 text-lg"></i>`;
        btnEliminar.title = "Eliminar";
        btnEliminar.onclick = function() {
            eliminarSolicitud(s.id);
        };

        colAcciones.appendChild(btnEditar);
        colAcciones.appendChild(btnEliminar);

        fila.appendChild(colNum);
        fila.appendChild(colArea);
        fila.appendChild(colBien);
        fila.appendChild(colSolicitante);
        fila.appendChild(colFecha);
        fila.appendChild(colAcciones);

        tbody.appendChild(fila);
    });
}

// Limpiar campos del formulario
function limpiarFormulario(prefijo) {
    const campos = [
        `${prefijo}-solcBi-numeroT`,
        `${prefijo}-solcBi-Area`,
        `${prefijo}-solcBi-nombien`,
        `${prefijo}-solcBi-solicitabien`,
        `${prefijo}-solcBi-fecha`
    ];

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    renderTablaSolicitudes();
});

// Gestión de Solicitudes de Insumos --------------------------------------------------


// Mostrar un formulario y ocultar los demás
function showResourceForm(formId) {
    document.querySelectorAll(".form-container").forEach(form => {
        form.classList.add("hidden");
    });
    const form = document.getElementById(formId);
    if (form) form.classList.remove("hidden");
}

// Ocultar un formulario
function hideResourceForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.classList.add("hidden");
}

// ==============================
// Agregar o eliminar insumos del formulario
// ==============================

function agregarInsumo(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const nuevoRecurso = document.createElement("div");
    nuevoRecurso.classList.add("grid", "grid-cols-1", "md:grid-cols-3", "gap-4", "items-end", "insumo-item");

    const extraerTipo = (cont) => {
        return cont.replace("contenedor-", "");
    }
    const tipo = extraerTipo(contenedorId) === "bienes" ? "Bien" : "Insumo";
    if(tipo==="Insumo"){
      clase = ""
      nuevoRecurso.innerHTML = `
            <div>
                  <label class="block text-gray-700 mb-2">Nombre del ${tipo}</label>
                                <select
                                            id="registro-solcBi-nomBien"
                                            class="input-insumo-nombre w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                    >
                                    </select>
                                </div>
            <div>
                <label class="block text-gray-700 mb-2">Cantidad</label>
                <input type="number" min="1" class="input-insumo-cantidad w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 10" />
            </div>
            <button type="button" class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="eliminarInsumo(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }else{

    nuevoRecurso.innerHTML = `
        <div>
            <label class="block text-gray-700 mb-2">Nombre del ${tipo}</label>
            <input type="text" class="input-insumo-nombre w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Papel A4" />
        </div>
        <button type="button" class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="eliminarInsumo(this)">
            <i class="fas fa-trash"></i>
        </button>
    `; }
    contenedor.appendChild(nuevoRecurso);
}


function eliminarInsumo(btn) {
    const item = btn.closest(".insumo-item");
    if (item) item.remove();
}


// ==============================
// Cargar datos en formulario de edición
// ==============================

function editarSolicitudInsumos(id) {
    const solicitud = solicitudesInsumos.find(s => s.id === id);
    if (!solicitud) return;

    // Asegúrate de que el formulario de modificación exista en tu HTML
    // y que tenga los IDs esperados.
    const idField = document.getElementById("modificar-insumo-id");
    if (idField) idField.value = solicitud.id; // campo oculto para mantener el id

    document.getElementById("modificar-insumo-numeroT").value = solicitud.numeroT || "";
    document.getElementById("modificar-insumo-area").value = solicitud.area || "";
    document.getElementById("modificar-insumo-solicitante").value = solicitud.solicitante || "";
    document.getElementById("modificar-insumo-fecha").value = solicitud.fecha || "";

    // Rellenar los insumos en el contenedor de modificación
    const contenedor = document.getElementById("contenedor-insumos-modificar");
    if (!contenedor) {
        console.warn("No se encontró #contenedor-insumos-modificar en el DOM.");
        showResourceForm("form-modificar-solicitudInsumos");
        return;
    }

    contenedor.innerHTML = "";
    solicitud.insumos.forEach(insumo => {
        const item = document.createElement("div");
        item.classList.add("grid", "grid-cols-1", "md:grid-cols-3", "gap-4", "items-end", "insumo-item");
        item.innerHTML = `
            <div>
                <label class="block text-gray-700 mb-2">Nombre del Insumo</label>
                <input type="text" class="input-insumo-nombre w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${insumo.nombre}" />
            </div>
            <div>
                <label class="block text-gray-700 mb-2">Cantidad</label>
                <input type="number" min="1" class="input-insumo-cantidad w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${insumo.cantidad}" />
            </div>
            <button type="button" class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="eliminarInsumo(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        contenedor.appendChild(item);
    });

    showResourceForm("form-modificar-solicitudInsumos");
}

// ==============================
// Modificar solicitud existente
// ==============================

function modificarSolicitudInsumos() {
    const idValue = document.getElementById("modificar-insumo-id").value;
    const id = idValue ? Number(idValue) : null;
    if (!id) {
        alert("ID de la solicitud no encontrado. No se puede modificar.");
        return;
    }

    const numeroT = document.getElementById("modificar-insumo-numeroT").value.trim();
    const area = document.getElementById("modificar-insumo-area").value.trim();
    const solicitante = document.getElementById("modificar-insumo-solicitante").value.trim();
    const fecha = document.getElementById("modificar-insumo-fecha").value.trim();

    if (!numeroT || !area || !solicitante || !fecha) {
        alert("Complete todos los campos antes de modificar.");
        return;
    }

    // Verificar unicidad de numeroT (excluyendo la propia solicitud)
    if (solicitudesInsumos.some(s => s.numeroT === numeroT && s.id !== id)) {
        alert("Otro registro ya usa ese Número de Trámite. Cambie el número o verifique el registro.");
        return;
    }

    const insumos = [];
    document.querySelectorAll("#contenedor-insumos-modificar .insumo-item").forEach(item => {
        const nombre = item.querySelector(".input-insumo-nombre").value.trim();
        const cantidad = item.querySelector(".input-insumo-cantidad").value.trim();
        if (nombre && cantidad) insumos.push({ nombre, cantidad });
    });

    if (insumos.length === 0) {
        alert("Debe agregar al menos un insumo.");
        return;
    }

    const solicitud = solicitudesInsumos.find(s => s.id === id);
    if (!solicitud) {
        alert("No se encontró la solicitud para modificar.");
        return;
    }

    solicitud.numeroT = numeroT;
    solicitud.area = area;
    solicitud.solicitante = solicitante;
    solicitud.fecha = fecha;
    solicitud.insumos = insumos;

    guardarEnLocalStorageInsumos();
    renderTablaSolicitudesInsumos();
    hideResourceForm("form-modificar-solicitudInsumos");
    alert("Solicitud modificada correctamente.");
}

// ==============================
// Eliminar solicitud
// ==============================

function eliminarSolicitudInsumos(id) {
    const confirmar = confirm("¿Desea eliminar esta solicitud?");
    if (!confirmar) return;

    solicitudesInsumos = solicitudesInsumos.filter(s => s.id !== id);
    guardarEnLocalStorageInsumos();
    renderTablaSolicitudesInsumos();
}

// ==============================
// Renderizar tabla con solicitudes
// ==============================

function renderTablaSolicitudesInsumos() {
    const tbody = document.getElementById("tabla-solicitudesInsumos");
    if (!tbody) return;
    

    tbody.innerHTML = "";
    

    solicitudesInsumos.forEach(s => {
        const fila = document.createElement("tr");

        const colNum = document.createElement("td");
        colNum.textContent = s.numeroT;
        colNum.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colArea = document.createElement("td");
        colArea.textContent = s.area;
        colArea.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colSolicitante = document.createElement("td");
        colSolicitante.textContent = s.solicitante;
        colSolicitante.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colFecha = document.createElement("td");
        colFecha.textContent = s.fecha;
        colFecha.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colInsumos = document.createElement("td");
        colInsumos.innerHTML = `<ul class="list-disc ml-4">${s.insumos.map(i => `<li>${i.nombre} (${i.cantidad})</li>`).join("")}</ul>`;
        colInsumos.classList.add("px-6", "py-3", "text-sm", "text-gray-700");

        const colAcciones = document.createElement("td");
        colAcciones.classList.add("px-6", "py-3", "text-sm", "flex", "space-x-4");

        const btnEditar = document.createElement("button");
        btnEditar.innerHTML = `<i class="fas fa-edit text-blue-600 hover:text-blue-900 text-lg"></i>`;
        btnEditar.title = "Editar";
        btnEditar.onclick = () => editarSolicitudInsumos(s.id);

        const btnEliminar = document.createElement("button");
        btnEliminar.innerHTML = `<i class="fas fa-trash text-red-600 hover:text-red-900 text-lg"></i>`;
        btnEliminar.title = "Eliminar";
        btnEliminar.onclick = () => eliminarSolicitudInsumos(s.id);

        colAcciones.appendChild(btnEditar);
        colAcciones.appendChild(btnEliminar);

        fila.appendChild(colNum);
        fila.appendChild(colArea);
        fila.appendChild(colSolicitante);
        fila.appendChild(colFecha);
        fila.appendChild(colInsumos);
        fila.appendChild(colAcciones);

        tbody.appendChild(fila);
    });
}

// ==============================
// Guardar y limpiar
// ==============================

function guardarEnLocalStorageInsumos() {
    localStorage.setItem("solicitudesInsumos", JSON.stringify(solicitudesInsumos));
}

function limpiarFormularioSolicitudInsumos() {
    const form = document.getElementById("formCrearSolicitudInsumos");
    if (form) form.reset();

    const cont = document.getElementById("contenedor-insumos");
    if (cont) {
        cont.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end insumo-item">
                <div>
                    <label class="block text-gray-700 mb-2">Nombre del Insumo</label>
                    <input type="text" class="input-insumo-nombre w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Papel A4" />
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Cantidad</label>
                    <input type="number" min="1" class="input-insumo-cantidad w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 10" />
                </div>
                <button type="button" class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600" onclick="eliminarInsumo(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", renderTablaSolicitudesInsumos);



// URL base del API.
const RECURSOS_API_URL = "http://localhost:8080/api/recursos";
const CATEGORIAS_API_URL = "http://localhost:8080/api/categorias";

// -------------------------------------------------------------------

/**
 * Carga categorías dinámicamente en uno o más elementos <select>.
 * @param {string} selectId El ID del elemento <select> (ej: "registro-bien-cat").
 * @param {string} tipoFiltro El tipo de categoría a filtrar (ej: "Bien", "Insumo").
 */
function cargarCategoriasDinamicamente(selectId, tipoFiltro) {
    // 1. Obtiene el elemento select usando el ID
    const selectCategoria = document.getElementById(selectId);

    if (!selectCategoria) {
        console.error(`Error: No se encontró el elemento con ID: ${selectId}`);
        return;
    }

    // Si la función ya se ejecutó y hay opciones (más de 1, contando el 'Seleccione...'), salimos.
    // Esto previene recargas innecesarias.
    if (selectCategoria.options && selectCategoria.options.length > 1) return;

    // Asumimos que CATEGORIAS_API_URL está definida globalmente
    // La URL ahora usa el tipoFiltro pasado como argumento
    const urlConFiltro = `${CATEGORIAS_API_URL}?tipo=${tipoFiltro}`;

    // 2. Muestra estado de carga
    selectCategoria.innerHTML = '<option value="" disabled selected>Cargando categorías...</option>';

    fetch(urlConFiltro)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
        })
        .then(categorias => {
            // 3. Limpia y establece la opción por defecto
            selectCategoria.innerHTML = '<option value="" disabled selected>Seleccione una Categoría</option>';

            if (categorias.length === 0) {
                 console.warn(`No se encontraron categorías de tipo ${tipoFiltro}.`);
                 selectCategoria.innerHTML = '<option value="" disabled selected>No hay categorías disponibles</option>';
                 return;
            }
            // 4. Rellena con las categorías
            categorias.forEach(categoria => {
                const option = document.createElement("option");
                option.textContent = categoria.nombre;
                // Usamos el ID numérico que el backend espera
                option.value = categoria.id;
                selectCategoria.appendChild(option);
            });
            console.log(`Categorías de tipo ${tipoFiltro} cargadas (${categorias.length} encontradas).`);
        })
        .catch(error => {
            // 5. Manejo del error
            console.error(`Fallo al cargar categorías de tipo ${tipoFiltro}:`, error);
            selectCategoria.innerHTML = '<option value="" disabled selected>Error al cargar</option>';
            alert(`Error de conexión al cargar las categorías (${tipoFiltro}). Verifique el servidor.`);
        });
}

// Inicialización: Carga las categorías al cargar la página.
document.addEventListener('DOMContentLoaded', cargarCategoriasDinamicamente);



<<<<<<< Updated upstream
async function generarReporteStockMinimoPDF(recursos) {
  try {
    // 🌟 Eliminada la dependencia de document.getElementById("catRepMin") 🌟
    // El nombre de la categoría para el título se fija en "Todas las Categorías"
    const categoriaNombreSeleccionada = "Todas las Categorías";

    const recursosFiltrados = recursos; // Datos ya filtrados

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración de fecha
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy = `${dd}/${mm}/${yyyy}`;

    // 🛑 Manejo de Cero Resultados
    if (recursosFiltrados.length === 0) {
      alert(`No hay recursos con alerta de stock mínimo en la categoría: ${categoriaNombreSeleccionada}.`);
      doc.setFontSize(12);
      doc.text(fechaHoy, 190, 20, { align: "right" });
      doc.text(`Categoría: ${categoriaNombreSeleccionada}`, 14, 30);
      doc.text("Dirigido a quien corresponda", 14, 50);
      doc.save(`reporte_stock_minimo_${categoriaNombreSeleccionada.toLowerCase().replace(/\s/g, '_')}.pdf`);
      return;
    }

    // 🌟 ORDENAMIENTO ALFABÉTICO POR NOMBRE 🌟
    recursosFiltrados.sort((a, b) => {
        // Obtenemos el nombre y aseguramos que no sea nulo antes de toLowerCase()
        const nombreA = (a.nombre || '').toLowerCase();
        const nombreB = (b.nombre || '').toLowerCase();

        if (nombreA < nombreB) return -1;
        if (nombreA > nombreB) return 1;
        return 0;
    });

<<<<<<< Updated upstream

    // --- Encabezado del PDF ---
    doc.setFontSize(16);
    doc.text(
      `Reporte de Stock Mínimo - ${categoriaNombreSeleccionada}`,
      14,
      20
    );
    doc.text(fechaHoy, 190, 20, { align: "right" });

    // Mover "Dirigido a quien corresponda" arriba de la tabla
    const startYDirigido = 30;
    doc.setFontSize(12);
    doc.text("Dirigido a quien corresponda", 14, startYDirigido);

<<<<<<< Updated upstream

    // --- Configuración de la Tabla ---
    const columns = [
      "ID",
      "Nombre",
      "Descripción",
     // "Código",
      "Cantidad",
      "Mínimo",
      "Categoría",
    ];

    const rows = recursosFiltrados.map((rec) => {
      // Solución al [object Object] (asumimos que la estructura sigue siendo rec.categoria.nombre)
      const nombreCategoria = rec.categoria && rec.categoria.nombre ? rec.categoria.nombre : '[No definido]';

      return [
        rec.id,
        rec.nombre,
        rec.descripcion,
      //  rec.codigo,
        rec.cantidad,
        rec.minimo,
        nombreCategoria,
      ];
    });

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: startYDirigido + 10, // Inicia 10 unidades después del texto
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 193, 7] }, // Amarillo
    });

    // Guardar el archivo PDF
    doc.save(`reporte_stock_minimo_${categoriaNombreSeleccionada.toLowerCase().replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error("Error generando el PDF:", error);
  }
}


=======
>>>>>>> Stashed changes

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
