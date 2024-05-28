//Ocultar campo
function mostrarOcultarFullname() {
  var opcaoSelecionada = document.querySelector(
    'input[name="situation"]:checked'
  ).value;
  var campoNome = document.getElementById("fullname");
  var labelNome = document.getElementById("label-fullname");

  if (opcaoSelecionada === "first-time") {
    campoNome.style.display = "block";
  } else {
    campoNome.style.display = "none";
    labelNome.style.display = "none";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  mostrarOcultarFullname();
});
//Footer
window.addEventListener("scroll", function () {
  var footer = document.getElementById("footer");
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    footer.style.display = "block";
  } else {
    footer.style.display = "none";
  }
});
//CPF
function formatarCPF(event) {
  const input = document.getElementById("cpfInput");
  const inputLength = input.value.length; // Corrigido de nodeValue para value
  if (inputLength === 3 || inputLength === 7) {
    // Corrigido de inputlength para inputLength
    input.value += ".";
  } else if (inputLength === 11) {
    input.value += "-";
  }
}
