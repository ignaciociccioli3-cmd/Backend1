const socket = io();

const createForm = document.getElementById("create-product-form");
const deleteForm = document.getElementById("delete-product-form");
const productsBody = document.getElementById("products-body");
const messageElement = document.getElementById("message");

const showMessage = (message, type = "success") => {
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
};

const renderProducts = (products) => {
  if (!products.length) {
    productsBody.innerHTML = `
      <tr>
        <td colspan="5">No hay productos cargados.</td>
      </tr>
    `;
    return;
  }

  productsBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.id}</td>
          <td>${product.title}</td>
          <td>$${product.price}</td>
          <td>${product.category}</td>
          <td>${product.stock}</td>
        </tr>
      `
    )
    .join("");
};

socket.on("productsUpdated", (products) => {
  renderProducts(products);
});

socket.on("productActionSuccess", (message) => {
  showMessage(message, "success");
});

socket.on("productActionError", (message) => {
  showMessage(message, "error");
});

createForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(createForm);
  const thumbnails = formData
    .get("thumbnails")
    .split(",")
    .map((thumbnail) => thumbnail.trim())
    .filter(Boolean);

  const product = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    code: formData.get("code").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category: formData.get("category").trim(),
    thumbnails,
    status: document.getElementById("status").checked,
  };

  socket.emit("createProduct", product);
  createForm.reset();
  document.getElementById("status").checked = true;
});

deleteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const productId = Number(document.getElementById("productId").value);

  if (!productId) {
    showMessage("Ingresá un ID valido", "error");
    return;
  }

  socket.emit("deleteProduct", productId);
  deleteForm.reset();
});
