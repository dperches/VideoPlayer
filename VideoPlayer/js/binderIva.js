//First option: without an object and defining the value on bind.
function getTotalPrice1() {
    if (this.country === "ES") {
        return (this.country + "->" + " Price: " + this.value + "  Total price: " + this.value * 1.21);
    } else {
        return (this.country + "->" + " Price: " + this.value + "  Total price: " + this.value * this.iva);
    }
}

var espIVA1 = getTotalPrice1.bind({value: 1000, country: "ES"});
var usaIVA1 = getTotalPrice1.bind({value: 1000, country: "US", iva: 1.18});

console.log("First option - Without an object, defining the value on bind function \n\n");
console.log(espIVA1());
console.log(usaIVA1());
console.log("\n");

//Second option: without an object and defining the value on function call.
function getTotalPrice2(value) {
    if (this.country === "ES") {
        return (this.country + "->" + " Price: " + value + "  Total price: " + value * 1.21);
    } else {
        return (this.country + "->" + " Price: " + value + "  Total price: " + value * this.iva);
    }
}

var espIVA2 = getTotalPrice2.bind({country: "ES"});
var usaIVA2 = getTotalPrice2.bind({country: "US", iva: 1.18});

console.log("Second option - Without an object, defining the value on function call \n\n");
console.log(espIVA2(10000));
console.log(usaIVA2(10000));
console.log("\n");


//Third option: with an object.
var carrito = {
    country : "ES",
    iva: 1.21,
    totalPrice: function(value) {
        if (this.country === "ES") {
            return (this.country + "->" + " Price: " + value + "  Total price: " + value * 1.21);
        } else {
            return (this.country + "->" + " Price: " + value + "  Total price: " + value * this.iva);
        }
    }
};

var espIVA3 = carrito.totalPrice.bind({country: "ES"});
var usaIVA3 = carrito.totalPrice.bind({country: "US", iva: 1.18});

console.log("Third option - With an object, defining the value on bind function \n\n");
console.log(espIVA3(100));
console.log(usaIVA3(100));
console.log("\n");
