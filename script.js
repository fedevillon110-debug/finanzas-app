// ===============================
// 1. Cargar datos guardados
// ===============================
let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

// ===============================
// 2. Obtener elementos del HTML
// ===============================
const inputMonto = document.getElementById("monto");
const selectTipo = document.getElementById("tipo");
const selectCategoria = document.getElementById("categoria");
const botonAgregar = document.getElementById("agregar");
const lista = document.getElementById("lista");
const spanTotal = document.getElementById("total");

// ===============================
// 3. Mostrar / ocultar categoría
// ===============================
selectCategoria.style.display = "none";

selectTipo.addEventListener("change", () => {
  if (selectTipo.value === "gasto") {
    selectCategoria.style.display = "inline-block";
  } else {
    selectCategoria.style.display = "none";
  }
});

// ===============================
// 4. GRÁFICO (Chart.js)
// ===============================
const ctx = document.getElementById("graficoGastos").getContext("2d");
let grafico;

function actualizarGrafico() {
  const gastosPorCategoria = {};

  movimientos.forEach(mov => {
    if (mov.tipo === "gasto") {
      if (!gastosPorCategoria[mov.categoria]) {
        gastosPorCategoria[mov.categoria] = 0;
      }
      gastosPorCategoria[mov.categoria] += mov.monto;
    }
  });

  const categorias = Object.keys(gastosPorCategoria);
  const montos = Object.values(gastosPorCategoria);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categorias,
      datasets: [{
        data: montos
      }]
    }
  });
}

// ===============================
// 5. Calcular total
// ===============================
function calcularTotal() {
  let total = 0;

  movimientos.forEach(mov => {
    if (mov.tipo === "gasto") {
      total -= mov.monto;
    } else {
      total += mov.monto;
    }
  });

  spanTotal.textContent = total;
}

// ===============================
// 6. Mostrar movimientos
// ===============================
function mostrarMovimientos() {
  lista.innerHTML = "";

  movimientos.forEach((mov, index) => {
    const item = document.createElement("li");

    if (mov.tipo === "ingreso") {
      item.textContent = `Ingreso: $${mov.monto} (${mov.fecha} ${mov.hora})`;
      item.classList.add("ingreso");
    } else {
      item.textContent = `Gasto (${mov.categoria}): $${mov.monto} (${mov.fecha} ${mov.hora})`;
      item.classList.add("gasto");
    }

    const botonBorrar = document.createElement("button");
    botonBorrar.textContent = "Borrar";

    botonBorrar.addEventListener("click", () => {
      borrarMovimiento(index);
    });

    item.appendChild(botonBorrar);
    lista.appendChild(item);
  });
}

// ===============================
// 7. Guardar / borrar
// ===============================
function guardar() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function borrarMovimiento(indice) {
  movimientos.splice(indice, 1);
  guardar();
  mostrarMovimientos();
  calcularTotal();
  actualizarGrafico();
}

// ===============================
// 8. Botón agregar
// ===============================
botonAgregar.addEventListener("click", () => {
  const monto = Number(inputMonto.value);
  const tipo = selectTipo.value;

  if (monto <= 0) return;

  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-AR");
  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  let categoria = null;
  if (tipo === "gasto") {
    categoria = selectCategoria.value;
  }

  movimientos.push({
    monto,
    tipo,
    categoria,
    fecha,
    hora
  });

  guardar();
  mostrarMovimientos();
  calcularTotal();
  actualizarGrafico();

  inputMonto.value = "";
});

// ===============================
// 9. Al cargar la página
// ===============================
mostrarMovimientos();
calcularTotal();
actualizarGrafico();
