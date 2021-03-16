const products = [];
let favoritos = [];
let selectedFavs = [];

window.onload = () => {
  let favTitle = document.getElementById("favoritosFrame");
  favTitle.hidden = true;
  let favsBox = document.getElementById("favsBox");
  favsBox.hidden = true;
  let checkAll = document.getElementById("checkAll");
  checkAll.hidden = true;

  const fetchData = fetch(
    "https://gist.githubusercontent.com/jhonatan89/719f8a95a8dce961597f04b3ce37f97b/raw/4b7f1ac723a14b372ba6899ce63dbd7c2679e345/products-ecommerce",
  );
  fetchData
    .then((resp) => resp.json())
    .then((json) => {
      saveProducts(json.items);
      renderProducts(json.items);
    });
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function saveProducts(json) {
  for (i in json) {
    products.push(json[i]);
  }
}

function contains(array, element) {
  for (i in array) {
    if (array[i].title == element.title) return i;
  }
  return -1;
}

function clean() {
  let main = document.getElementById("main");
  for (i in main.children) {
    main.children[i].hidden = true;
  }
}

function home() {
  clean();
  renderProducts(products);
}

function closeModal() {
  let modal = document.getElementById("myModal");
  modal.style.display = "none";
}

function checkFav(e) {
  let card;
  if (e.target.className == "check") {
    e.target.hidden = !e.target.hidden;
    card = e.target.parentNode.parentNode;
  } else if (e.target.className == "checkFav") {
    e.target.firstChild.hidden = !e.target.firstChild.hidden;
    card = e.target.parentNode;
  }

  let cel = JSON.parse(card.getAttribute("product"));
  let pos = contains(selectedFavs, cel);
  if (pos == -1) {
    selectedFavs.push(cel);
  } else {
    selectedFavs.splice(pos, 1);
  }

  let butElim = document.getElementById("butEliminar");
  if (selectedFavs.length == 0) {
    butElim.style.background = "#ECE9E9";
  } else {
    butElim.style.background = "#E1677D";
  }
}

function selectAll() {
  let checkAll = document.getElementById("checkAll");

  if (checkAll.hidden) {
    for (let i = 0; i < favoritos.length; i++) {
      if (contains(selectedFavs, favoritos[i]) == -1) {
        selectedFavs.push(favoritos[i]);
      }
    }
  } else {
    selectedFavs = [];
  }

  checkAll.hidden = !checkAll.hidden;
  renderFavs();
}

function deleteSelected() {
  if (selectedFavs.length > 0) {
    document.getElementById("checkAll").hidden = true;
    let newFavs = [];
    for (let i = 0; i < favoritos.length; i++) {
      if (contains(selectedFavs, favoritos[i]) == -1) {
        newFavs.push(favoritos[i]);
      }
    }
    favoritos = newFavs;
    selectedFavs = [];

    renderFavs();
  }
}

function renderProducts(json) {
  clean();
  let contenedor = document.getElementById("cellCards");
  contenedor.innerHTML = "";

  if (json.length == 0) {
    let warn = document.createElement("div");
    warn.className = "alert alert-warning";
    warn.id = "warn";
    warn.innerHTML =
      "No se encontraron productos para esta categoría. Por favor intente nuevamente.";
    contenedor.appendChild(warn);
  } else {
    for (let i = 0; i < json.length; i++) {
      let tarjeta = document.createElement("div");
      tarjeta.className = "container tarjetaCel";

      let photo = document.createElement("img");
      photo.className = "cellPhoto";
      photo.setAttribute("src", json[i].picture);
      photo.onclick = renderInfo;
      tarjeta.appendChild(photo);

      let price = document.createElement("div");
      price.className = "priceTag";
      price.innerHTML = formatter.format(json[i].price.amount);
      tarjeta.appendChild(price);

      let name = document.createElement("div");
      name.className = "nombreCel";
      name.innerHTML = json[i].title;
      tarjeta.appendChild(name);

      if (json[i].free_shipping) {
        let free = document.createElement("img");
        free.className = "freeShipping";
        free.setAttribute("src", "./img/free_shipping.png");
        tarjeta.appendChild(free);
      }

      let city = document.createElement("div");
      city.className = "cityTag";
      city.innerHTML = json[i].location;
      tarjeta.appendChild(city);

      tarjeta.setAttribute("product", JSON.stringify(json[i]));
      contenedor.appendChild(tarjeta);
    }
  }

  contenedor.hidden = false;
}

function renderInfo(e) {
  clean();
  let cel = JSON.parse(e.target.parentNode.getAttribute("product"));
  let main = document.getElementById("main");

  let div = document.createElement("div");
  div.style = "--bs-breadcrumb-divider: '>'";
  div.setAttribute("aria-label", "breadcrumb");

  let ol = document.createElement("ol");
  ol.className = "breadcrumb";
  for (i in cel.categories) {
    let li = document.createElement("li");
    li.className = "breadcrumb-item";
    li.innerHTML = cel.categories[i];
    ol.appendChild(li);
  }
  div.appendChild(ol);

  let infoBox = document.createElement("div");
  infoBox.id = "detailFrame";

  let img = document.createElement("img");
  img.src = cel.picture;
  img.id = "detPhoto";
  infoBox.appendChild(img);

  let status = document.createElement("div");
  status.id = "status";
  status.innerHTML =
    (cel.condition == "new" ? "Nuevo " : "Usado ") +
    "| " +
    cel.sold_quantity +
    " vendidos";
  infoBox.appendChild(status);

  let panel = document.createElement("div");
  panel.id = "panel";

  let name = document.createElement("div");
  name.id = "nombreDet";
  name.innerHTML = cel.title;
  panel.appendChild(name);

  let price = document.createElement("div");
  price.id = "priceDet";
  price.innerHTML = formatter.format(cel.price.amount);
  panel.appendChild(price);

  let butRosa = document.createElement("div");
  butRosa.id = "butRosa";
  butRosa.innerHTML = "Comprar";
  butRosa.onclick = () => {
    let modal = document.getElementById("myModal");
    let modaltext = document.getElementById("modalName2");

    modal.style.display = "contents";
    modaltext.innerText = cel.title;
  };
  panel.appendChild(butRosa);

  let butMorado = document.createElement("div");
  butMorado.id = "butMorado";
  butMorado.innerHTML =
    contains(favoritos, cel) == -1
      ? "Añadir a favoritos"
      : "Quitar de favoritos";
  butMorado.onclick = () => {
    let pos = contains(favoritos, cel);
    if (pos > -1) {
      favoritos.splice(contains(favoritos, cel), 1);
      let selected = contains(selectedFavs, cel);
      if (selected > -1) {
        selectedFavs.splice(selected, 1);
      }
      butMorado.innerHTML = "Añadir a favoritos";
    } else {
      favoritos.push(cel);
      butMorado.innerHTML = "Quitar de favoritos";
    }
  };
  panel.appendChild(butMorado);

  infoBox.appendChild(panel);

  let h1 = document.createElement("h1");
  h1.id = "descTitle";
  h1.innerHTML = "Descripción del producto";
  infoBox.appendChild(h1);

  let p = document.createElement("p");
  p.id = "description";
  p.innerHTML = cel.description;
  infoBox.appendChild(p);

  main.appendChild(div);
  main.appendChild(infoBox);
}

function renderFavs() {
  clean();
  let butElim = document.getElementById("butEliminar");
  if (selectedFavs.length == 0) {
    butElim.style.background = "#ECE9E9";
  } else {
    butElim.style.background = "#E1677D";
  }
  let favTitle = document.getElementById("favoritosFrame");
  favTitle.hidden = false;

  let favsBox = document.getElementById("favsBox");
  favsBox.innerHTML = "";
  favsBox.hidden = false;

  for (let i = 0; i < favoritos.length; i++) {
    let card = document.createElement("div");
    card.className = "cardFavorito";

    let check = document.createElement("img");
    check.className = "check";
    check.src = "./img/check.png";
    // check.onclick = checkFav;
    if (contains(selectedFavs, favoritos[i]) == -1) {
      check.hidden = true;
    } else check.hidden = false;

    let checkBox = document.createElement("div");
    checkBox.className = "checkFav";
    checkBox.onclick = checkFav;
    checkBox.appendChild(check);
    card.appendChild(checkBox);

    let img = document.createElement("img");
    img.className = "fotoCard";
    img.src = favoritos[i].picture;
    card.appendChild(img);

    let pricetag = document.createElement("div");
    pricetag.className = "ptag";
    pricetag.innerHTML = formatter.format(favoritos[i].price.amount);
    card.appendChild(pricetag);

    if (favoritos[i].free_shipping) {
      let shipping = document.createElement("img");
      shipping.src = "./img/free_shipping.png";
      shipping.className = "shipping";
      card.appendChild(shipping);
    }

    let name = document.createElement("div");
    name.className = "favName";
    name.innerHTML = favoritos[i].title;
    card.appendChild(name);

    let boton = document.createElement("div");
    boton.className = "butArt";
    boton.innerText = "Ver artículo";
    boton.onclick = renderInfo;
    card.appendChild(boton);

    card.setAttribute("product", JSON.stringify(favoritos[i]));

    favsBox.appendChild(card);
  }
}

function filter() {
  clean();
  let input = document.getElementById("input");
  let results = [];
  if (input.value != "") {
    for (let i = 0; i < products.length; i++) {
      let categories = products[i].categories;
      for (let j = 0; j < categories.length; j++) {
        if (input.value == categories[j]) {
          results.push(products[i]);
          break;
        }
      }
    }
  } else results = products;
  renderProducts(results);
}
