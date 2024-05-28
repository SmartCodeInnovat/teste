const closeMessage = document.querySelector("#close-message");
const message = document.querySelector(".message");
const password = document.getElementById("password");
let icon = document.getElementId("icon");


closeMessage.addEventListener("click", () =>{
    message.style.display = "none";
});

setTimeout(() => {
    message.style.display = "none";
},5000);

function showHide(){
    if(password.type === "password"){
        password.setAttribute("type", "text");
        let existe= icon.classList.cotains('bi-eye-fill');
        icon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        console.log(existe);
    }
    else{
        password.setAttribute('type', "password");
        icon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');

    }
};