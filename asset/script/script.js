document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault();

    //* Store the data from the form
    const stream = document.getElementById("stream").value;
    const pageOld = document.getElementById("page").value;
    const pages = pageOld.split(" ");
    const numFrames = parseInt(document.getElementById("frames").value);
    const policy = document.getElementById("policy").value;
    const pattern = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    let hasLetters = false;
    for (let i = 0; i < pages.length; i++) {
        if (pattern.test(pages[i])) {
            hasLetters = true;
            break;
        }
    }

    //* Check if the inputted data is invalid
    if (!stream) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Pages cannot be empty!",
        });
        return;
    } else if (!frames) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Number of frames cannot be empty!",
        });
        return;
    } else if (hasLetters) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Reference stream cannot contain characters",
        });
        return;
    } else if (pageOld.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Reference stream cannot be empty!",
        });
        return;
    }
    //* Create a storage for the following
    let pageFaults = 0;
    let pageHits = 0;
    let pageTable = [];
    let tableData = [];
    let algorithmName = "";
    let output = "";
    let pageFaultCounter = [];
    // TODO: FIFO code

    //* Check if the chosen policy is FIFO
    if (policy === "fifo") {
        //* Store 'FIFO' as a value for the algorithmName, this will be displayed in the result
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
                pageFaultCounter.push(0);
            } else {
                pageFaults++;
                pageFaultCounter.push(1);

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
                //* Store the array of pages as a String concatenated with a line break
                frames: pageTable.join("<br><hr>"),
                faults: pageFaultCounter,
            };
            //* Push the row object to the tableData array
            tableData.push(row);
        }
    }

    // TODO: LRU code
    else if (policy === "lru") {
        algorithmName = "LRU";
        const indexes = new Map(); // Map to store the indexes of pages
        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            if (pageTable.includes(page)) {
                // Page hit
                pageHits++;
                pageFaultCounter.push(0);

                // Update the page's position in the pageTable
                const pageIndex = pageTable.indexOf(page);
                pageTable.splice(pageIndex, 1);
                pageTable.push(page);
            } else {
                // Page fault
                pageFaults++;
                pageFaultCounter.push(1);

                if (pageTable.length === numFrames) {
                    // Find the page that was least recently used
                    let leastRecentlyUsed = Infinity;
                    let leastRecentlyUsedIndex;
                    for (let j = 0; j < pageTable.length; j++) {
                        if (indexes.get(pageTable[j]) < leastRecentlyUsed) {
                            leastRecentlyUsed = indexes.get(pageTable[j]);
                            leastRecentlyUsedIndex = j;
                        }
                    }

                    // Replace the least recently used page with the new page
                    pageTable.splice(leastRecentlyUsedIndex, 1);
                }

                // Add the new page to the pageTable
                pageTable.push(page);
            }

            // Update the index of the current page
            indexes.set(page, i);

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
                pageFaultCounter.push(0);

                // Increment the page's frequency
                pageFrequency.set(page, (pageFrequency.get(page) || 0) + 1);
            } else {
                // Page fault
                pageFaults++;
                pageFaultCounter.push(1);

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

    output = `
    <h2 class="text-xl font-bold py-2">Summary - ${algorithmName} Algorithm</h2>

    <ul class="pl-4 font-regular">
      <li class="list-disc py-px"><strong>Algorithm:</strong> ${algorithmName}</li>
      <li class="list-disc py-px"><strong>Pages:</strong> ${stream}</li>
      <li class="list-disc py-px"><strong>Reference Stream:</strong> ${pages.join(
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

    <tr>
    <th class="border text-center py-4 w-2/12">Hit</th>


            
            
            ${pageFaultCounter
                .map((value) =>
                    value === 1
                        ? `<td class="border text-center align-top py-4 bg-red-500 font-semibold text-white">
                        <i class="fa-solid fa-xmark"></i>
                    </td>`
                        : `<td class="border text-center align-top py-4 bg-green-500 font-semibold text-white">
                        <i class="fa-solid fa-check"></i>
                    </td>`
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
