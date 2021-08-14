document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", ready)
  : ready()

function ready() {
  const addToCart = document.querySelectorAll(".shop-item-button")
  const removeItemsBtn = document.querySelectorAll(".btn-danger")
  const quantityInputs = document.querySelectorAll(".cart-quantity-input")
  const purchaseBtn = document.querySelector(".btn-purchase")

  for (let i = 0; i < addToCart.length; i++) {
    const btn = addToCart[i]
    btn.addEventListener("click", selectItem)
  }

  for (let i = 0; i < removeItemsBtn.length; i++) {
    const btn = removeItemsBtn[i]
    btn.addEventListener("click", removeItem)
  }

  for (let i = 0; i < quantityInputs.length; i++) {
    const input = quantityInputs[i]
    input.addEventListener("change", quantityChanged)
  }

  purchaseBtn.addEventListener("click", purchaseItems)
}

function selectItem(e) {
  const button = e.target
  const selectedItem = button.parentElement.parentElement
  const title =
    selectedItem.getElementsByClassName("shop-item-title")[0].innerText
  const price =
    selectedItem.getElementsByClassName("shop-item-price")[0].innerText
  const imgSrc = selectedItem.getElementsByClassName("shop-item-image")[0].src
  const id = selectedItem.dataset.itemId
  addItemToCart(title, price, imgSrc, id)
  updateTotal()
}

function removeItem(e) {
  const btn = e.target
  const selectedItem = btn.parentElement.parentElement.remove()
  updateTotal()
}

function quantityChanged(e) {
  const input = e.target
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1
  }
  updateTotal()
}

function addItemToCart(title, price, imageSrc, id) {
  const cartRow = document.createElement("div")
  cartRow.classList.add("cart-row")
  cartRow.dataset.itemId = id
  const cartItems = document.getElementsByClassName("cart-items")[0]
  const cartItemNames = cartItems.getElementsByClassName("cart-item-title")
  for (let i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart")
      return
    }
  }
  const cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
  cartRow.innerHTML = cartRowContents
  cartItems.append(cartRow)
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeItem)
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged)
}

const stripeCheckout = StripeCheckout.configure({
  key: stripePublicKey,
  locale: "en",
  token: function (token) {
    let items = []
    const cartItemContainer = document.getElementsByClassName("cart-items")[0]
    const cartRows = cartItemContainer.getElementsByClassName("cart-row")
    for (let i = 0; i < cartRows.length; i++) {
      const cartRow = cartRows[i]
      const quantityElement = cartRow.getElementsByClassName(
        "cart-quantity-input"
      )[0]
      const quantity = quantityElement.value
      const id = cartRow.dataset.itemId
      items.push({
        id: id,
        quantity: quantity,
      })
    }
    fetch('/purchase', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
		'Accept': 'application/json'
      },
      body: JSON.stringify({stripeTokenId: token.id,items:items})
    })
      .then(res => {
        return res.json()
      })
      .then(data => {
        alert(data.message)
        const cartItems = document.getElementsByClassName("cart-items")[0]
        while (cartItems.hasChildNodes()) {
          cartItems.removeChild(cartItems.firstChild)
        }
        updateTotal()
      })
      .catch(error => console.error(error))
  },
})

function purchaseItems(e) {
  const price =
    parseFloat(
      document
        .getElementsByClassName("cart-total-price")[0]
        .innerText.replace("$", "")
    ) * 100
  stripeCheckout.open({
    amount: price,
  })
}

function updateTotal() {
  const cartItemContainer = document.getElementsByClassName("cart-items")[0]
  const cartRows = cartItemContainer.getElementsByClassName("cart-row")
  let total = 0
  for (let i = 0; i < cartRows.length; i++) {
    const cartRow = cartRows[i]
    const priceElement = cartRow.getElementsByClassName("cart-price")[0]
    const quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0]
    const price = parseFloat(priceElement.innerText.replace("$", ""))
    const quantity = quantityElement.value
    total = total + price * quantity
  }
  total = Math.round(total * 100) / 100
  document.getElementsByClassName("cart-total-price")[0].innerText = "$" + total
}

//console.log(stripeCheckout)