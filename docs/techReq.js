"use strict";
const formNode = document.getElementById("formReqs");
const formP = document.getElementById("dumpInput");
const textInput = document.getElementById("text");
const numberInput = document.getElementById("number");
const selectInput = document.getElementById("select");
const deleteInput = document.getElementById("reset");
deleteInput.addEventListener("click", () => {
    formP.textContent =
        "Here's where you'll be able to see everything when you submit it! (as in literally here, like, I'm going to replace this text with all of your inputs)";
});
formNode.addEventListener("submit", (ev) => {
    ev.preventDefault();
    formP.textContent =
        textInput.value + " " + numberInput.value + " " + selectInput.value;
});
//Drag and drop stuff
const draggableNode = document.getElementById("thingToDragNDrop");
draggableNode?.setAttribute("draggable", "true");
const duplicateNode = document.getElementById("duplicateIt");
duplicateNode?.addEventListener("dragover", (ev) => {
    ev.preventDefault();
});
duplicateNode?.addEventListener("drop", () => {
    duplicateNode.append(makeCopyNode());
    console.log("in here");
});
const makeCopyNode = () => {
    const id = Date.now();
    const nodeToReturn = document.createElement("div");
    nodeToReturn.classList.add("thingToDragNDrop");
    nodeToReturn.textContent = "Here's the thing" + "\n And here's its ID: " + id;
    nodeToReturn.setAttribute("draggable", "true");
    nodeToReturn.setAttribute("id", id.toString());
    nodeToReturn.addEventListener("dragstart", (ev) => {
        ev.dataTransfer?.setData("id", id.toString());
    });
    return nodeToReturn;
};
const deleteNode = document.getElementById("deleteIt");
deleteNode?.addEventListener("dragover", (ev) => {
    ev.preventDefault();
});
deleteNode?.addEventListener("drop", (ev) => {
    const thing1 = ev.dataTransfer?.getData("id");
    const thing = document.getElementById(thing1);
    duplicateNode?.removeChild(thing);
});
localStorage.setItem("thing", "Here's how you know I can do this!");
const localStorageItem = localStorage.getItem("thing");
console.log(localStorageItem);
//# sourceMappingURL=techReq.js.map