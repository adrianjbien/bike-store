

let updateTable = async function () {
    let products_table = document.getElementById('products_table');
    let response= await fetch('http://localhost:3000/products')

    // todo TRZEBA WYMYSLEC JAK TEN ZAJEBANY TOKEN PRZEKAZYWAC BO NIE MOZNA SIE DOSTAC DO NICZEGO Z API

    const listOfProducts = await response.json();

    console.log(listOfProducts);

    let tableHead = document.createElement("thead");
    let row = document.createElement('tr');
    const headers = ["Name", "Description", "Price"];

    headers.forEach((headerText) => {
        let th = document.createElement("th");
        th.textContent = headerText;
        row.appendChild(th);
    });

    tableHead.appendChild(row);

    //remove all elements
    while (products_table.firstChild) {
        products_table.removeChild(products_table.firstChild);
    }

    products_table.appendChild(tableHead);

    // for (let i = 0; i < listOfProducts.length; i++) {
    //
    // }
}

setInterval(updateTable, 1000)
