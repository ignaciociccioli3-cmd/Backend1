const cartIdInput = document.getElementById("cartId");
const addToCartButton = document.getElementById("add-to-cart-button");
const messageElement = document.getElementById("cart-message");
const goToCartLink = document.getElementById("go-to-cart-link");

const showMessage = (message, type = "success") => {
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
};

const setCartId = (cartId) => {
  const normalizedCartId = cartId ? cartId.trim() : "";

  if (!normalizedCartId) {
    localStorage.removeItem("cartId");
    cartIdInput.value = "";
    goToCartLink.href = "#";
    goToCartLink.classList.add("hidden");
    return;
  }

  localStorage.setItem("cartId", normalizedCartId);
  cartIdInput.value = normalizedCartId;
  goToCartLink.href = `/carts/${normalizedCartId}`;
  goToCartLink.classList.remove("hidden");
};

const readErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.error || "Request failed";
  } catch {
    return "Request failed";
  }
};

const createCart = async () => {
  const response = await fetch("/api/carts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const cart = data.payload || data;

  if (!cart || !cart._id) {
    throw new Error("Could not create cart");
  }

  return cart;
};

addToCartButton.addEventListener("click", async () => {
  const productId = addToCartButton.dataset.productId;

  if (!productId) {
    showMessage("No se encontro el producto", "error");
    return;
  }

  addToCartButton.disabled = true;

  try {
    let cartId = cartIdInput.value.trim() || localStorage.getItem("cartId") || "";

    if (!cartId) {
      const createdCart = await createCart();
      cartId = createdCart._id;
    }

    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    setCartId(cartId);
    showMessage("Producto agregado al carrito", "success");
  } catch (error) {
    showMessage(error.message || "No se pudo agregar el producto", "error");
  } finally {
    addToCartButton.disabled = false;
  }
});

cartIdInput.addEventListener("change", () => {
  setCartId(cartIdInput.value);
});

const initialCartId = cartIdInput.value.trim() || localStorage.getItem("cartId") || "";
setCartId(initialCartId);
