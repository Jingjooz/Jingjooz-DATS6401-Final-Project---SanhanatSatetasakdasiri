var G20Image = document.getElementById("mainG20");

var G20collect = ["image/m2.jpg", "image/G20share.png"];

var number = 0;

function changeG20() {
    G20Image.setAttribute("src", G20collect[number]);
    number++;
    if (number >= G20collect.length) {
        number = 0;
    }
}

var loop = setInterval(changeG20, 2500);
G20Image.onclick = function() {
    clearInterval(loop);
}