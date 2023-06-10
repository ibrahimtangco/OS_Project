document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault();

    //* Store the data from the form
    const stream = document.getElementById("stream").value;
    const pages = document.getElementById("page").value.split(" ");
    const numFrames = parseInt(document.getElementById("frames").value);
    const policy = document.getElementById("policy").value;

    //* Check if the inputted data
    //! If it's invalid, alert message will be displayed
    if (!stream || typeof pages === "string") {
        alert("Invalid Input");
        return;
    }

    //* Create a storage for the following
    let pageFaults = 0;
    let pageHits = 0;
    let pageTable = [];
    let tableData = [];
    let algorithmName = "";
    let output = "";

    // TODO: FIFO code

    //* Check if the chosen policy is FIFO
    if (policy === "fifo") {
        //* Store 'FIFO' as a value for the algorithmName, this will be displayed in the result
        algorithmName = "FIFO";

        //* Iterate through the array of page
        for (let i = 0; i < pages.length; i++) {
            //* Store each page in a temporary variable
            let page = parseInt(pages[i]);

            //* Check if the current page is already in the page table
            //* If the current page is already in the page table, page hit will be incremented
            //* If not, page fault will be incremented
            if (pageTable.includes(page)) {
                pageHits++;
            } else {
                pageFaults++;

                //* If all table is occupied, it removes the first value
                if (pageTable.length === numFrames) {
                    pageTable[oldestPageIndex] = page; // Replace the oldest page with the new page
                    oldestPageIndex = (oldestPageIndex + 1) % numFrames; // Update the oldestPageIndex
                } else {
                    pageTable.push(page); // Insert the new page into the page table
                }
                //* Insert the page into the end of the table
                pageTable.push(page);
            }

            //* Object for the references and frames
            let row = {
                reference: page,
                //* Store the array of pages as a String concatinated with blank space
                frames: pageTable.join("\n"),
            };
            //* Push the
            tableData.push(row);
        }
    }

    // TODO: LRU code
    else if (policy === "lru") {
        algorithmName = "LRU";

        const indexes = new Map();

        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            if (pageTable.includes(page)) {
                // Page hit
                pageHits++;

                // Update the page's position in the pageTable
                const pageIndex = pageTable.indexOf(page);
                pageTable.splice(pageIndex, 1);
                pageTable.push(page);

                // Update the page's index in the indexes map
                indexes.set(page, i);
            } else {
                // Page fault
                pageFaults++;

                if (pageTable.length === numFrames) {
                    // Find the least recently used page
                    let lruPage = pageTable[0];
                    let lruIndex = indexes.get(lruPage);

                    for (let j = 1; j < pageTable.length; j++) {
                        const currentPage = pageTable[j];
                        const currentIndex = indexes.get(currentPage);

                        if (currentIndex < lruIndex) {
                            lruPage = currentPage;
                            lruIndex = currentIndex;
                        }
                    }

                    // Remove the least recently used page
                    const pageIndex = pageTable.indexOf(lruPage);
                    pageTable.splice(pageIndex, 1);
                    indexes.delete(lruPage);
                }

                // Add the new page to the pageTable
                pageTable.push(page);
                indexes.set(page, i);
            }

            let row = {
                reference: page,
                frames: Array.from(pageTable),
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
                frames: pageTable.join("\n"),
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
      <li class="list-disc py-px"><strong>Reference Stream:</strong> ${stream}</li>
      <li class="list-disc py-px"><strong>Pages:</strong> ${pages.join(
          ", "
      )}</li>
    </ul>
    <h2 class="text-xl font-bold pt-4">Solution Visualization</h2>
    <table class="w-full bg-myGray my-8">
   
    <tbody>
    <tr>
    <th class="border text-center py-4">Reference</th>

        ${tableData

            .map(
                (row) => `
                
                <td class="border text-center py-4 font-bold">${row.reference}</td>
            
        `
            )
            .join("")}
            </tr>
            <tr>
            <th class="border text-center py-4">Frames</th>

        ${tableData
            .map(
                (row) => `
                
                <td class="border text-center py-4">
                    <div>
                        ${row.frames}
                    </div>
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
