document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const stream = document.getElementById("stream").value;
    const pages = document.getElementById("page").value.split(" ");
    const numFrames = parseInt(document.getElementById("frames").value);
    const policy = document.getElementById("policy").value;

    if (!stream || typeof pages === "string") {
        Swal.fire({
            icon: "error",
            title: "Invalid Input",
        });
        return;
    }

    let pageFaults = 0;
    let pageHits = 0;
    let pageTable = [];
    let tableData = [];
    let algorithmName = "";
    let output = "";

    // TODO: FIFO code
    if (policy === "fifo") {
        algorithmName = "FIFO";

        for (let i = 0; i < pages.length; i++) {
            let page = parseInt(pages[i]);

            if (pageTable.includes(page)) {
                pageHits++;
            } else {
                pageFaults++;

                if (pageTable.length === numFrames) {
                    pageTable.shift();
                }

                pageTable.push(page);
            }

            let row = {
                reference: page,
                frames: pageTable.join(", "),
            };

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
                frames: pageTable.join("\n"),
            };

            tableData.push(row);
        }
    }
    // TODO: LFU code
    else {
        algorithmName = "LFU ";

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
                frames: pageTable.join(", "),
            };

            tableData.push(row);
        }

        const pageFrequencyVisualization = Array.from(pageFrequency.entries())
            .map(([page, frequency]) => `${page}: ${frequency}`)
            .join(", ");

        output += `
            <h2 class="text-xl font-bold pt-4">Page Frequencies</h2>
            <p>${pageFrequencyVisualization}</p>
        `;
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
    <thead>
        <tr>
            <th class="border px-4 py-2">Reference</th>
            <th class="border px-4 py-2">Frames</th>
        </tr>
    </thead>
    <tbody>
    <tr>
        ${tableData
            .map(
                (row) => `
                
                <td class="border px-4 py-2">${row.reference}</td>
            
        `
            )
            .join("")}
            </tr>
            <tr>
        ${tableData
            .map(
                (row) => `
                
                <td class="border px-4 py-2">${row.frames}</td>
            
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
