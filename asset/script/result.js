document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the output from the browser's local storage
    const output = localStorage.getItem("output");

    // Display the output in the output div
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = output;

    // Clear the output from the local storage
    localStorage.removeItem("output");
});
