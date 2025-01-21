
const socket = io();

const productsList = document.getElementById("products-list");

// Recibir la lista inicial de productos
socket.on("productos-actuales", (productos) => {
  productos.forEach((producto) => {
    const li = createProduct(producto);
    productsList.appendChild(li);
  });
});

// Función para crear un elemento de producto
function createProduct(producto) {
  const li = document.createElement("li");
  li.id = `product-${producto.id}`;
  li.className = "collection-item";
  li.innerHTML = `
    <h2>${producto.nombre}</h2>
    <p>${producto.descripcion}</p>
    <p>Precio: $${producto.precio}</p>
    <p>Stock: ${producto.stock}</p>
    <button class="delete-btn">Eliminar</button>
  `; return li;

}
const deleteButton = li.querySelector(".delete-btn");
deleteButton.addEventListener("click", () => {
  socket.emit("delete-product", producto.id); // Enviar evento al servidor
});

return li;