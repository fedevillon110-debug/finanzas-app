let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let mesSeleccionado = new Date().getMonth();
let vista = "mes";
let grafico;

/* ELEMENTOS */
const menu = document.getElementById("menu");
const hamburguesa = document.getElementById("hamburguesa");
const btnMeses = document.getElementById("btnMeses");
const listaMeses = document.getElementById("listaMeses");
const btnAhorros = document.getElementById("btnAhorros");

const formulario = document.getElementById("formulario");
const monto = document.getElementById("monto");
const tipo = document.getElementById("tipo");
const categoriaIngreso = document.getElementById("categoriaingreso");
const categoriaGasto = document.getElementById("categoriagasto");
const categoriaAhorro = document.getElementById("categoriaahorro");
const agregar = document.getElementById("agregar");

const vistaMes = document.getElementById("vistaMes");
const vistaAhorros = document.getElementById("vistaAhorros");

const listaIngresos = document.getElementById("listaIngresos");
const listaGastos = document.getElementById("listaGastos");
const listaAhorros = document.getElementById("listaAhorros");

const total = document.getElementById("total");
const totalAhorros = document.getElementById("totalAhorros");

/* MENU */
hamburguesa.onclick = () => menu.classList.toggle("abierto");

btnMeses.onclick = () => listaMeses.classList.toggle("oculto");

listaMeses.onclick = e => {
  if (e.target.dataset.mes) {
    mesSeleccionado = Number(e.target.dataset.mes);
    document.getElementById("mesActual").textContent = e.target.textContent;
    vista = "mes";
    menu.classList.remove("abierto");
    render();
  }
};

btnAhorros.onclick = () => {
  vista = "ahorros";
  menu.classList.remove("abierto");
  render();
};

/* FORM */
function actualizarCategorias() {
  categoriaIngreso.style.display = "none";
  categoriaGasto.style.display = "none";
  categoriaAhorro.style.display = "none";

  if (tipo.value === "ingreso") {
    categoriaIngreso.style.display = "block";
  }
  if (tipo.value === "gasto") {
    categoriaGasto.style.display = "block";
  }
  if (tipo.value === "ahorro") {
    categoriaAhorro.style.display = "block";
  }
}

tipo.onchange = actualizarCategorias;
actualizarCategorias();

/* AGREGAR */
agregar.onclick = () => {
let categoriaSeleccionada;

if (tipo.value === "ingreso") categoriaSeleccionada = categoriaIngreso.value;
if (tipo.value === "gasto") categoriaSeleccionada = categoriaGasto.value;
if (tipo.value === "ahorro") categoriaSeleccionada = categoriaAhorro.value;

movimientos.push({
  monto: Number(monto.value),
  tipo: tipo.value,
  categoria: categoriaSeleccionada,
  fecha: new Date().toLocaleDateString("es-AR")
});

  localStorage.setItem("movimientos", JSON.stringify(movimientos));
  monto.value = "";
  render();
};

/* BORRAR */
function borrar(i) {
  movimientos.splice(i, 1);
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
  render();
}

/* DARK MODE */
document.getElementById("darkSwitch").onchange = e => {
  document.body.classList.toggle("dark", e.target.checked);
};

/* GRAFICO */
function actualizarGrafico(datos) {
  const ctx = document.getElementById("graficoGastos");
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(datos),
      datasets: [{ data: Object.values(datos) }]
    }
  });
}

/* RENDER */
function render() {
  listaIngresos.innerHTML = "";
  listaGastos.innerHTML = "";
  listaAhorros.innerHTML = "";

  vistaMes.classList.toggle("oculto", vista !== "mes");
  vistaAhorros.classList.toggle("oculto", vista !== "ahorros");
  formulario.style.display = vista === "mes" ? "grid" : "none";

  let t = 0;
  let ah = 0;
  let gastosPorCategoria = {};

  movimientos.forEach((m, i) => {
    const [, mes] = m.fecha.split("/");
    if (vista === "mes" && Number(mes) - 1 !== mesSeleccionado) return;

    if (m.tipo === "ingreso" && vista === "mes") {
      t += m.monto;
      listaIngresos.innerHTML += `
        <li class="ingreso">+$${m.monto} - ${m.categoria} - ${m.fecha}
        <button class="borrar" onclick="borrar(${i})">🗑</button></li>`;
    }

    if (m.tipo === "gasto" && vista === "mes") {
      t -= m.monto;
      listaGastos.innerHTML += `
        <li class="gasto">-$${m.monto} - ${m.categoria} - ${m.fecha}
        <button class="borrar" onclick="borrar(${i})">🗑</button></li>`;
      gastosPorCategoria[m.categoria] =
        (gastosPorCategoria[m.categoria] || 0) + m.monto;
    }

    if (m.tipo === "ahorro") {
      ah += m.monto;
      listaAhorros.innerHTML += `
        <li class="ahorro-item">+$${m.monto} - ${m.categoria} - ${m.fecha}
        <button class="borrar" onclick="borrar(${i})">🗑</button></li>`;
    }
  });

  total.textContent = t;
  totalAhorros.textContent = ah;

  if (vista === "mes") actualizarGrafico(gastosPorCategoria);
}

render();

//exportar informe
document.getElementById("exportarPDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  doc.text("Informe mensual", 10, y);
  y += 10;

  doc.text("Ingresos:", 10, y);
  y += 10;

  movimientos.forEach(m => {
    const [, mes] = m.fecha.split("/");
    if (Number(mes) - 1 !== mesSeleccionado) return;

    if (m.tipo === "ingreso") {
      doc.text(`$${m.monto} - ${m.categoria} - ${m.fecha}`, 10, y);
      y += 8;
    }
  });

  y += 5;
  doc.text("Gastos:", 10, y);
  y += 10;

  movimientos.forEach(m => {
    const [, mes] = m.fecha.split("/");
    if (Number(mes) - 1 !== mesSeleccionado) return;

    if (m.tipo === "gasto") {
      doc.text(`$${m.monto} - ${m.categoria} - ${m.fecha}`, 10, y);
      y += 8;
    }
  });

  y += 5;
  doc.text("Ahorros:", 10, y);
  y += 10;

  movimientos.forEach(m => {
    if (m.tipo === "ahorro") {
      doc.text(`$${m.monto} - ${m.categoria} - ${m.fecha}`, 10, y);
      y += 8;
    }
  });

const nombresMeses = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre"
];

const nombreMes = nombresMeses[mesSeleccionado];

doc.save(`informe${nombreMes}.pdf`);
};

