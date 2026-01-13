document.addEventListener('DOMContentLoaded', () => {
  const productos = [
    { nombre: "Café 4oz", precio: 2.00, imagen: "https://i.imgur.com/fLlfOPJ.png" },
    { nombre: "Café Con Leche 8oz", precio: 3.25, imagen: "https://i.imgur.com/6MWV0co.png" },
    { nombre: "Café Negro", precio: 3.00, imagen: "https://i.imgur.com/M9tpeWC.png" },
    { nombre: "Café Sin Lactosa", precio: 3.25, imagen: "https://i.imgur.com/gMfGyGf.png" },
    { nombre: "Chocolate Caliente", precio: 3.50, imagen: "https://i.imgur.com/aFTr65n.png" },
    { nombre: "Mocha", precio: 3.50, imagen: "https://i.imgur.com/GGVgr2l.png" },
    { nombre: "Chai Latte", precio: 3.50, imagen: "https://i.imgur.com/qtqgfwk.png" },
    { nombre: "Taro", precio: 4.00, imagen: "https://i.imgur.com/7IJj3H9.png" },
    { nombre: "Hielo", precio: 0.50, imagen: "https://i.imgur.com/EjPso2X.png" },
    { nombre: "Té", precio: 2.00, imagen: "https://i.imgur.com/4jyWYmQ.png" },
    { nombre: "Iced Coffee", precio: 4.00, imagen: "https://i.imgur.com/LPAJqEE.png" },
    { nombre: "Registrar Regalo", esRegalo: true, imagen: "https://i.imgur.com/YOPpsZV.png" }
  ];

  const productosContainer = document.getElementById("productos");
  const resumenLista = document.getElementById("resumenLista");
  const regalosLista = document.getElementById("regalosLista");
  const totalSpan = document.getElementById("total");

  const metodoModal = document.getElementById("metodoPagoModal");
  const botonesPago = document.querySelectorAll(".metodoPago");
  const nombreAthInput = document.getElementById("nombreAthInput");
  const confirmarAth = document.getElementById("confirmarAth");
  const nombreAth = document.getElementById("nombreAth");

  const regaloModal = document.getElementById("regaloModal");
  const nombreRegalo = document.getElementById("nombreRegalo");
  const productoRegaloSelect = document.getElementById("productoRegaloSelect");
  const confirmarRegalo = document.getElementById("confirmarRegalo");

  const emailBtn = document.getElementById("emailBtn");

  let historial = [];
  let regalos = [];
  let metodoPendiente = null;

  // Select de productos para regalos
  productos.filter(p => !p.esRegalo).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nombre;
    opt.textContent = p.nombre;
    productoRegaloSelect.appendChild(opt);
  });

  // Tarjetas
  productos.forEach((producto) => {
    const div = document.createElement("div");
    div.className = "producto";
    const precioTexto = producto.esRegalo ? "Registrar regalo" : `$${producto.precio.toFixed(2)}`;
    div.innerHTML = `
      <h3>${producto.nombre}</h3>
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <p>${precioTexto}</p>
    `;

    if (producto.esRegalo) {
      div.onclick = () => {
        nombreRegalo.value = "";
        productoRegaloSelect.selectedIndex = 0;
        regaloModal.style.display = "flex";
      };
    } else {
      div.onclick = () => {
        metodoPendiente = { ...producto };
        metodoModal.style.display = "flex";
        nombreAthInput.style.display = "none";
        nombreAth.value = "";
      };
    }

    productosContainer.appendChild(div);
  });

  // Pago
  botonesPago.forEach(btn => {
    btn.addEventListener("click", () => {
      const metodo = btn.dataset.metodo;
      if (!metodoPendiente) return;

      if (metodo === "ATH Móvil") {
        nombreAthInput.style.display = "block";
      } else {
        historial.push({ ...metodoPendiente, metodo });
        metodoPendiente = null;
        metodoModal.style.display = "none";
        actualizarResumen();
      }
    });
  });

  confirmarAth.onclick = () => {
    const nombre = nombreAth.value.trim();
    if (!nombre) return alert("Por favor escribe un nombre.");
    if (!metodoPendiente) return;

    historial.push({ ...metodoPendiente, metodo: "ATH Móvil", persona: nombre });
    metodoPendiente = null;
    metodoModal.style.display = "none";
    actualizarResumen();
  };

  // Regalo
  confirmarRegalo.onclick = () => {
    const persona = nombreRegalo.value.trim();
    const productoNombre = productoRegaloSelect.value;
    if (!persona) return alert("Por favor escribe el nombre de la persona.");
    if (!productoNombre) return alert("Por favor selecciona un producto.");

    regalos.push({ persona, producto: productoNombre });
    regaloModal.style.display = "none";
    actualizarResumen();
  };

  function actualizarResumen() {
    resumenLista.innerHTML = "";
    let total = 0;

    historial.forEach((item, i) => {
      let texto = `${item.nombre} - $${item.precio.toFixed(2)} (${item.metodo}`;
      if (item.metodo === "ATH Móvil" && item.persona) texto += ` - ${item.persona}`;
      texto += `)`;

      const li = document.createElement("li");
      li.textContent = texto;
      li.title = "Click para eliminar esta venta";
      li.onclick = () => { historial.splice(i, 1); actualizarResumen(); };
      resumenLista.appendChild(li);

      total += item.precio;
    });

    totalSpan.textContent = total.toFixed(2);

    regalosLista.innerHTML = "";
    regalos.forEach((reg, idx) => {
      const li = document.createElement("li");
      li.textContent = `${reg.producto} → ${reg.persona}`;
      li.title = "Click para eliminar este regalo";
      li.onclick = () => { regalos.splice(idx, 1); actualizarResumen(); };
      regalosLista.appendChild(li);
    });
  }

  document.getElementById("procesarBtn").onclick = () => {
    if (historial.length === 0 && regalos.length === 0) return alert("No hay nada para procesar.");
    alert("Orden guardada. Puedes descargar el resumen o enviarlo por email.");
  };

  document.getElementById("deshacerBtn").onclick = () => {
    if (historial.length > 0) { historial.pop(); actualizarResumen(); }
  };

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("¿Seguro que deseas borrar todo (ventas y regalos)?")) {
      historial = []; regalos = []; actualizarResumen();
    }
  };

  document.getElementById("descargarBtn").onclick = () => {
    if (historial.length === 0 && regalos.length === 0) return alert("No hay ventas ni regalos para reportar.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    let efectivo = 0, ath = 0;

    doc.setFontSize(16);
    doc.text(`Resumen de Ventas - ${new Date().toLocaleDateString()}`, 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);

    historial.forEach(item => {
      let linea = `${item.nombre} - $${item.precio.toFixed(2)} - ${item.metodo}`;
      if (item.metodo === "ATH Móvil" && item.persona) { linea += ` (Pagó: ${item.persona})`; ath += item.precio; }
      else if (item.metodo === "Efectivo") { efectivo += item.precio; }
      doc.text(linea, 20, y); y += 8;
    });

    y += 10;
    doc.setFontSize(13);
    doc.text(`Total Efectivo: $${efectivo.toFixed(2)}`, 20, y); y += 8;
    doc.text(`Total ATH Móvil: $${ath.toFixed(2)}`, 20, y); y += 8;
    doc.text(`Total General: $${(efectivo + ath).toFixed(2)}`, 20, y);

    if (regalos.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text("Productos Regalados (NO incluidos en el total)", 20, y);
      y += 8;
      doc.setFontSize(12);
      regalos.forEach(reg => { doc.text(`- ${reg.producto} (Regalado a: ${reg.persona})`, 20, y); y += 8; });
    }

    const fecha = new Date().toISOString().split("T")[0];
    doc.save(`ventas_${fecha}.pdf`);
  };

  // Gmail (2 destinatarios)
  emailBtn.onclick = () => {
    if (historial.length === 0 && regalos.length === 0) return alert("No hay ventas ni regalos para reportar.");

    const fecha = new Date().toLocaleDateString();
    let efectivo = 0, ath = 0;
    let body = `Resumen de Ventas - ${fecha}\n\n`;

    historial.forEach(item => {
      let linea = `${item.nombre} - $${item.precio.toFixed(2)} - ${item.metodo}`;
      if (item.metodo === "ATH Móvil" && item.persona) { linea += ` (Pagó: ${item.persona})`; ath += item.precio; }
      else if (item.metodo === "Efectivo") { efectivo += item.precio; }
      body += linea + "\n";
    });

    body += `\nTotal Efectivo: $${efectivo.toFixed(2)}\n`;
    body += `Total ATH Móvil: $${ath.toFixed(2)}\n`;
    body += `Total General: $${(efectivo + ath).toFixed(2)}\n`;

    if (regalos.length > 0) {
      body += `\nProductos Regalados (NO incluidos en total):\n`;
      regalos.forEach(reg => body += `- ${reg.producto} (Regalado a: ${reg.persona})\n`);
    }

    const destinatarios = ["gonzalez.mayacad@gmail.com", "cruz.mayacad@gmail.com"].join(",");
    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(destinatarios) +
      "&su=" + encodeURIComponent("Cuadre") +
      "&body=" + encodeURIComponent(body);

    window.open(gmailUrl, "_blank");
  };

  window.onclick = e => {
    if (e.target === metodoModal) { metodoModal.style.display = "none"; metodoPendiente = null; }
    if (e.target === regaloModal) regaloModal.style.display = "none";
  };

  // PWA SW
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
