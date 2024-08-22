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
            if (form) {
              form.removeChild(hiddenInput);
            }
            target.parentElement?.parentElement?.remove();
            toggleCartFooter(quoteItems);
            toggleCartEmptyListState();
            setCartItemsQuantity();
          }
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
    hiddenInput.name = "Item: " + item["name"]; // Use product name instead of slug
    hiddenInput.id = item["slug"];
    hiddenInput.type = "hidden";
    hiddenInput.value = `Quantity: ${item["quantity"]}, Category: ${item["category"]}`; // Add category to hidden input value
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
            `product-quantity-${slug}`
          );
          const productQuantity = productQuantityInput.value;
          if (productQuantity === "" || productQuantity == null) {
            productQuantityInput.setCustomValidity("Please enter a number!");
            productQuantityInput.reportValidity();
            productQuantity 1