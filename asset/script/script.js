document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault();

    //* Store the data from the form
    const stream = document.getElementById("stream").value; // Get the value of the 'stream' input field
    const pages = document.getElementById("page").value; // Get the value of the 'page' input field
    const pagesSplitted = pages.split(" "); // Split the 'pages' value into an array of individual pages
    const numFrames = parseInt(document.getElementById("frames").value); // Get the value of the 'frames' input field and parse it as an integer
    const policy = document.getElementById("policy").value; // Get the value of the 'policy' input field
    const pattern = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // Regular expression pattern to match letters and special characters
    let hasLetters = false; // Variable to track if the 'pages' input contains letters or special characters

    for (let i = 0; i < pagesSplitted.length; i++) {
        if (pattern.test(pagesSplitted[i])) {
            hasLetters = true; // Set 'hasLetters' to true if any of the pages contain letters or special characters
            break;
        }
    }

    //* Check if the inputted data is invalid
    if (!stream) {
        // If 'stream' is empty
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Pages cannot be empty!",
        }).then((result) => {
            if (result.isConfirmed) {
                location.reload(); // Refresh the page
            }
        });
    } else if (hasLetters) {
        // If 'pages' contain letters or special characters
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Reference stream cannot contain characters!",
        }).then((result) => {
            if (result.isConfirmed) {
                location.reload(); // Refresh the page
            }
        });
    }

    //* Create storage variables for the following
    let pageFaults = 0;
    let pageHits = 0;
    let pageTable = [];
    let tableData = [];
    let algorithmName = "";
    let output = "";

    // TODO: FIFO code

    //* Check if the chosen policy is FIFO
    if (policy === "fifo") {
        //* Store 'FIFO' as the value for 'algorithmName', this will be displayed in the result
        algorithmName = "FIFO";

        let oldestPageIndex = 0; // Track the index of the oldest page in the page table

        //* Iterate through the array of pages
        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            //* Check if the current page is already in the page table
            //* If the current page is already in the page table, page hit will be incremented
            //* If not, page fault will be incremented
            if (pageTable.includes(page)) {
                pageHits++;
            } else {
                pageFaults++;

                //* If all frames are occupied, remove the oldest page from the page table
                if (pageTable.length === numFrames) {
                    pageTable[oldestPageIndex] = page; // Replace the oldest page with the new page
                    oldestPageIndex = (oldestPageIndex + 1) % numFrames; // Update the oldestPageIndex
                } else {
                    pageTable.push(page); // Insert the new page into the page table
                }
            }

            //* Object for the references and frames
            let row = {
                reference: page,
                //* Store the array of pages as a string concatenated with a line break
                frames: pageTable.join("<br><hr>"),
            };
            //* Push the row object to the tableData array
            tableData.push(row);
        }
    }

    // TODO: LRU code
    else if (policy === "lru") {
        algorithmName = "LRU";
        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            if (pageTable.includes(page)) {
                // Page hit
                pageHits++;

                // Update the page's position in the pageTable
                const pageIndex = pageTable.indexOf(page);
                pageTable.splice(pageIndex, 1);
                pageTable.push(page);
            } else {
                // Page fault
                pageFaults++;

                if (pageTable.length === numFrames) {
                    // Remove the least recently used page
                    pageTable.shift();
                }

                // Add the new page to the pageTable
                pageTable.push(page);
            }

            let row = {
                reference: page,
                frames: pageTable.join("<br><hr>"),
            };

            tableData.push(row);
        }
    }

    // TODO: LFU code
    else {
        algorithmName = "LFU";

        const pageFrequency = new Map();

        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            if (pageTable.includes(page)) {
                // Page hit
                pageHits++;

                // Increment the page's frequency
                pageFrequency.set(page, (pageFrequency.get(page) || 0) + 1);
            } else {
                // Page fault
                pageFaults++;

                if (pageTable.length === numFrames) {
                    // Find the page with the minimum frequency
                    let minFrequencyPage = pageTable[0];
                    let minFrequency =
                        pageFrequency.get(minFrequencyPage) || Infinity;

                    for (let j = 1; j < pageTable.length; j++) {
                        const currentPage = pageTable[j];
                        const currentFrequency =
                            pageFrequency.get(currentPage) || Infinity;

                        if (currentFrequency < minFrequency) {
                            minFrequencyPage = currentPage;
                            minFrequency = currentFrequency;
                        }
                    }

                    // Remove the page with the minimum frequency
                    const pageIndex = pageTable.indexOf(minFrequencyPage);
                    pageTable.splice(pageIndex, 1);
                    pageFrequency.delete(minFrequencyPage);
                }

                // Add the new page to the pageTable
                pageTable.push(page);
                pageFrequency.set(page, 1);
            }

            let row = {
                reference: page,
                frames: pageTable.join("<br><hr>"),
            };

            tableData.push(row);
        }
    }

    const pageHitRatio = (pageHits / pages.length) * 100;
    const pageFaultRatio = (pageFaults / pages.length) * 100;

    // Assigning value to the output variable that will be displayed as the result
    output = `
    <h2 class="text-xl font-bold py-2">Summary - ${algorithmName} Algorithm</h2>
  
    <ul class="pl-4 font-regular">
      <li class="list-disc py-px"><strong>Algorithm:</strong> ${algorithmName}</li>
      <li class="list-disc py-px"><strong>Reference Stream:</strong> ${stream}</li>
      <li class="list-disc py-px"><strong>Pages:</strong> ${pages.join(
          ", "
      )}</li>
    </ul>
    <h2 class="text-xl font-bold pt-4">Solution Visualization</h2>
    <table class="w-full bg-myGray my-8">
      <tbody>
        <tr>
          <th class="border text-center py-4 w-2/12">Reference</th>
  
          ${tableData
              .map(
                  (row) => `
              <td class="border text-center py-4 font-bold">${row.reference}</td>
          `
              )
              .join("")}
        </tr>
  
        <tr>
          <th class="border text-center py-4 w-2/12">Frames</th>
  
          ${tableData
              .map(
                  (row) => `
              <td class="border text-center align-top py-4">
                ${row.frames}
              </td>
          `
              )
              .join("")}
        </tr>
      </tbody>
    </table>
  
    <ul class="pl-4 font-regular">
      <li class="list-disc py-px"><strong>Total Page Hit:</strong> ${pageHits}</li>
      <li class="list-disc py-px"><strong>Total Page Fault:</strong> ${pageFaults}</li>
      <li class="list-disc py-px"><strong>Hit Rate:</strong> ${pageHits} / ${
        pages.length
    } = ${pageHitRatio.toFixed(2)}%</li>
      <li class="list-disc"><strong>Fault Rate:</strong> ${pageFaults} / ${
        pages.length
    } = ${pageFaultRatio.toFixed(2)}%</li>
    </ul>
    `;

    // Store the output in the browser's local storage
    localStorage.setItem("output", output);

    // Redirect to the result.html page
    window.location.href = "result.html";
});

// The code defines an event listener for the "submit" event on an HTML form with the id "myForm".
// When the form is submitted, the event listener function is executed.
// The function prevents the default form submission behavior using event.preventDefault().

// The code retrieves the values of various form elements such as "stream", "page", "frames", and "policy".

// The code checks for invalid input by verifying if the "stream" value is empty or if the "pages" value contains any characters.

// If the input is invalid, an error message is displayed using the Swal.fire() function from the SweetAlert library,
// and the page is reloaded using location.reload().

// If the input is valid, the code initializes variables to store page faults, page hits, page table, table data, algorithm name, and output.

// The code then checks the chosen policy (FIFO, LRU, or LFU) and executes the corresponding code block.

// The FIFO (First-In-First-Out) code block iterates through the pages and checks if each page is already in the page table.
// If a page is present, it counts as a page hit; otherwise, it counts as a page fault.
// If all frames are occupied, the oldest page is replaced with the new page.
// The references and frames for each step are stored in an object, which is pushed to the tableData array.
// After the iteration, the page hit ratio and page fault ratio are calculated.

// The LRU (Least Recently Used) code block follows a similar logic as FIFO.
// The page table is maintained in the order of most recently used to least recently used.
// When a page is accessed, it is moved to the end of the page table, simulating its recent usage.

// The LFU (Least Frequently Used) code block maintains a frequency count for each page using a Map.
// When a page is accessed, its frequency is incremented.
// When a page fault occurs and all frames are occupied, the page with the minimum frequency is replaced.
// The references and frames are stored in tableData, and the page hit ratio and fault ratio are calculated.

// Finally, the code generates the output HTML, stores it in the browser's local storage, and redirects to the result.html page.
