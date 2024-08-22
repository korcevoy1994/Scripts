"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/functions.ts
  function clearCartList() {
    const cartList = Array.from(document.getElementsByClassName("nav-cart_list"))[0];
    cartList.replaceChildren();
  }
  function resetCart() {
    clearCartList();
    localStorage.clear();
    toggleCartEmptyListState();
  }
  function onRequestFormSubmit() {
    const button = Array.from(document.getElementsByClassName("nav-cart_list-form-button"))[0];
    button.addEventListener("click", function handleClick(event) {
      const target = event.target;
      if (target) {
        resetCart();
      }
    });
  }
  function addClickEventListenersToRemoveLinks() {
    const removeItemLinks = Array.from(
      document.getElementsByClassName("cart-item-information-remove-link")
    );
    removeItemLinks.forEach((link) => {
      link.addEventListener("click", async (event) => {
        const target = event.target;
        if (target) {
          const quoteItems = await JSON.parse(localStorage?.getItem("quoteItems") || "{}");
          if (target.dataset.slug) {
            delete quoteItems[target.dataset.slug];
            localStorage.setItem("quoteItems", JSON.stringify(quoteItems));
            const form = document.getElementById("wf-form-Request-Quote");
            const hiddenInput = document.getElementById(target.dataset.slug);
            form.removeChild(hiddenInput);
          }
          target.parentElement?.parentElement?.remove();
          toggleCartFooter(quoteItems);
          toggleCartEmptyListState();
          setCartItemsQuantity();
        }
      });
    });
  }
  function toggleCartFooter(quoteItems) {
    const cartFooter = Array.from(
      document.getElementsByClassName("nav-cart_list-footer")
    )[0];
    if (Object.keys(quoteItems).length > 0) {
      cartFooter.style.display = "block";
      onRequestFormSubmit();
    } else {
      cartFooter.style.display = "none";
    }
  }
  function toggleCartEmptyListState() {
    const quoteItems = JSON.parse(localStorage?.getItem("quoteItems") || "{}");
    const cartListEmpty = Array.from(
      document.getElementsByClassName("nav-cart_list-empty")
    )[0];
    if (Object.keys(quoteItems).length > 0) {
      cartListEmpty.style.display = "none";
    } else {
      cartListEmpty.style.display = "block";
    }
  }
  function addQuoteItemsToHiddenInput(item) {
    const hiddenInput = document.createElement("input");
    document.getElementById("wf-form-Request-Quote")?.appendChild(hiddenInput);
    hiddenInput.name = "Item: " + item["slug"];
    hiddenInput.id = item["slug"];
    hiddenInput.type = "hidden";
    hiddenInput.value = " Quantity: " + item["quantity"];
    hiddenInput.className = "quote-item";
    document.getElementById("wf-form-Request-Quote")?.appendChild(hiddenInput);
  }
  function addClickEventListenersToAddToQuoteButtons() {
    const addToQuoteButtons = Array.from(document.getElementsByClassName("add-to-quote-button"));
    addToQuoteButtons.forEach((btn) => {
      btn.addEventListener("click", async function handleClick(event) {
        const target = event.target;
        if (target) {
          const { slug } = target.dataset;
          const productQuantityInput = document.getElementById(
            "product-quantity-" + slug
          );
          const productQuantity = productQuantityInput.value;
          if (productQuantity === "" || productQuantity == null) {
            productQuantityInput.setCustomValidity("Please enter a number!");
            productQuantityInput.reportValidity();
            productQuantityInput.setCustomValidity("");
            return;
          }
          const quoteItems = await JSON.parse(localStorage?.getItem("quoteItems") || "{}");
          if (slug) {
            target.dataset.quantity = productQuantity;
            quoteItems[slug] = target.dataset;
            productQuantityInput.value = "";
          }
          localStorage.setItem("quoteItems", JSON.stringify(quoteItems));
          setUpCartFromLocalStorage();
          openCart();
        }
      });
    });
  }
  function addClickEventListenersToCartItemQuantityInputs() {
    const cartQuantityInputs = Array.from(document.getElementsByClassName("cart-quantity"));
    cartQuantityInputs.forEach((cartQuantityInput) => {
      const originalCartQuantityInput = cartQuantityInput;
      const originalCartQuantityInputValue = originalCartQuantityInput.value;
      cartQuantityInput.addEventListener("input", async (event) => {
        const target = event.target;
        if (target) {
          const quoteItems = await JSON.parse(localStorage?.getItem("quoteItems") || "{}");
          if (target.dataset.slug) {
            if (target.value === "" || target.value == null) {
              target.setCustomValidity("Please enter a number!");
              target.reportValidity();
              target.setCustomValidity("");
              quoteItems[target.dataset.slug]["quantity"] = originalCartQuantityInputValue;
              localStorage.setItem("quoteItems", JSON.stringify(quoteItems));
              addQuoteItemsToHiddenInput(quoteItems[target.dataset.slug]);
              return;
            }
            quoteItems[target.dataset.slug]["quantity"] = target.value;
            localStorage.setItem("quoteItems", JSON.stringify(quoteItems));
            addQuoteItemsToHiddenInput(quoteItems[target.dataset.slug]);
          }
          toggleCartFooter(quoteItems);
          toggleCartEmptyListState();
          setCartItemsQuantity();
        }
      });
    });
  }
  async function setCartItemsQuantity() {
    const quoteItems = await JSON.parse(localStorage?.getItem("quoteItems") || "{}");
    const cartItemsQuantity = document.getElementById("cart-quantity");
    if (cartItemsQuantity) {
      cartItemsQuantity.innerHTML = Object.keys(quoteItems).length.toString();
    }
  }
  async function setUpCartFromLocalStorage() {
    clearCartList();
    const quoteItems = await JSON.parse(localStorage?.getItem("quoteItems") || "{}");
    Object.keys(quoteItems).forEach(function(key) {
      const removeLink = document.createElement("a");
      removeLink.href = "#";
      removeLink.classList.add("cart-item-information-remove-link");
      removeLink.innerText = "Remove";
      removeLink.dataset.slug = quoteItems[key]["slug"];
      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      const cartItem = `
            <div class="cart-item-image-wrapper">
              <img 
                src="${quoteItems[key]["image"]}" 
                loading="lazy" 
                sizes="(max-width: 991px) 
                100vw, 60px" 
                srcset="${quoteItems[key]["image"]} 500w, ${quoteItems[key]["image"]} 540w" 
                alt="" 
                class="cart-item-image"
              >
            </div>
            <div class="cart-item-information">
              <div class="cart-item-information-heading">${quoteItems[key]["name"]}</div>
              <div class="cart-item-information-subheading">${quoteItems[key]["description"]}</div>
              ${removeLink.outerHTML}
            </div>
            <div class="w-embed">
              <input 
                type="number" 
                class="w-commerce-commercecartquantity input cart-quantity" 
                min="1" 
                max="100000000"
                required 
                oninput="validity.valid||(value='');"
                name="quantity" 
                autocomplete="off" 
                value="${quoteItems[key]["quantity"]}"
                data-slug="${quoteItems[key]["slug"]}"
              >
            </div>
          `;
      cartItemDiv.innerHTML = cartItem;
      const cartList = Array.from(document.getElementsByClassName("nav-cart_list"))[0];
      cartList.appendChild(cartItemDiv);
      addQuoteItemsToHiddenInput(quoteItems[key]);
    });
    addClickEventListenersToRemoveLinks();
    addClickEventListenersToCartItemQuantityInputs();
    toggleCartFooter(quoteItems);
    toggleCartEmptyListState();
    setCartItemsQuantity();
  }
  function openCart() {
    const cart = Array.from(
      document.getElementsByClassName("nav-cart_list-container")
    )[0];
    cart.style.display = "block";
  }
  function closeCart() {
    const cart = Array.from(
      document.getElementsByClassName("nav-cart_list-container")
    )[0];
    cart.style.display = "none";
  }
  function addClickEventListenerToNavCartOpen() {
    const cartLink = Array.from(document.getElementsByClassName("nav-cart_button-wrapper"))[0];
    cartLink.addEventListener("click", function handleClick() {
      setUpCartFromLocalStorage();
      openCart();
    });
  }
  function addClickEventListenerToNavCartClose() {
    const closeButton = Array.from(document.getElementsByClassName("close-button"))[0];
    closeButton.addEventListener("click", function handleClick() {
      closeCart();
    });
  }

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(async () => {
    setUpCartFromLocalStorage();
    addClickEventListenerToNavCartOpen();
    addClickEventListenerToNavCartClose();
    addClickEventListenersToAddToQuoteButtons();
    onRequestFormSubmit();
  });
})();
//# sourceMappingURL=index.js.map
