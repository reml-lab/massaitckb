function do_search(text){
    const searchInput = document.querySelector('.gridjs-input');
    if (searchInput) {
        searchInput.value = text;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

const csvUrl = "data/data.csv"; // Example CSV URL

// Fetch and parse the CSV
fetch(csvUrl)
    .then(response => response.text())
    .then(csv => {

    //Get and parse data
    const parsed = Papa.parse(csv, { header: true });
    var columns = Object.keys(parsed.data[0]).filter(k => k !== ""); // Remove empty headers        
    var data = parsed.data

    //Filter and format columsn
    for(row in data){
        data[row]["Links"]=`<A HREF="${data[row]["DOI"]}" target="_blank"><IMG width="24" SRC="img/doi.png" title="Open DOI"></A>`;
        data[row]["Links"]+=`<A HREF="${data[row]["OpenAlex"]}" target="_blank"><IMG width="24" SRC="img/openalex.png" title="Open in OpenAlex"></A>`;
        if(data[row]["PMID"]!=null && data[row]["PMID"]!=""){
        data[row]["Links"]+=`<A HREF="${data[row]["PMID"]}" target="_blank"><IMG width="24" SRC="img/pubmed.png" title="Open in PubMed"></A>`;
        }
        if(data[row]["PMCID"]!=null && data[row]["PMCID"]!=""){
        data[row]["Links"]+=`<A HREF="${data[row]["PMCID"]}" target="_blank"><IMG width="24" SRC="img/pmc.png" title="Open PubMed Central"></A>`;
        }
        if(data[row]["Mendeley"]!=null && data[row]["Mendeley"]!=""){
        data[row]["Links"]+=`<A HREF="${data[row]["Mendeley"]}" target="_blank"><IMG width="24" SRC="img/mendeley.png" title="Open in Mendeley"></A>`;
        }
        data[row]["Links"]=`<div style="white-space: nowrap;">${data[row]["Links"]}</div>`


        authors = data[row]["Authors"].split(",")
        author_links=[]
        for (var author of authors){
        author_links.push(`<A HREF="#" onclick="do_search('${author}')">${author}</A>`);
        }
        //data[row]["Authors"] = data[row]["Authors"].replaceAll(",", ", "); 
        data[row]["Authors"] = author_links.join(", ")

        data[row]["Year"] = data[row]["Publication Year"]
        data[row]["Citations"] = data[row]["Citation Count"];

        var id = data[row]["Paper ID"]
        data[row]["Paper"] =`${data[row]["Authors"]}. <em>${data[row]["Title"]}.</em> ${data[row]["Venue"]}. ${data[row]["Publication Year"]}.` 

        
        //Get paper details if available
        var detail_fields=["Topic","Study Settings","Total Sample Size", "Tasks", "Performance Measures","Devices"];
        detail="";
        
        for(var field of  detail_fields){
        if (data[row][field]!=null && String(data[row][field])!="" && String(data[row][field]).trim()!="undefined"){
            detail+=`<LI><B>${field}:</B> ${data[row][field]}</LI>`;
        }
        }
        
        if(detail!=""){
        data[row]["Paper"] +=`
            <A HREF="#expandableDiv-${id}"  role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="expandableDiv-${id}">[More]</A>
            <div class="collapse" id="expandableDiv-${id}">
                <div class="card border-0 bg-transparent">
                    <div class="card-body mt-2">
                    <UL>
                    ${detail}
                    </UL>
                    </div>
                </div>
            </div>`
        }
        

    }

    //Select Columns 
    columns= [
            {name: "Paper",formatter: (cell) => gridjs.html(cell)},
            {name: "Year",formatter: (cell) => gridjs.html(cell)},
            {name: "Citations"},
            {name: "Links", formatter: (cell) => gridjs.html(cell)}
        ]

    //Select Data
    griddata = data.map(row => columns.map(col => row[col.name]));
        
    // Initialize Grid.js
    new gridjs.Grid({
        columns: columns,
        data: griddata,
        search: true,
        sort: true,
        pagination: false
    }).render(document.getElementById("grid"));
    })
    .catch(error => {
    console.error("Error loading CSV:", error);
    });

// Customize the search bar once it's rendered
setTimeout(() => {
    const searchContainer = document.querySelector('.gridjs-search');
    const input = searchContainer.querySelector('.gridjs-input');

    // Create label
    const label = document.createElement('span');
    label.textContent = 'Search: ';
    label.style.marginRight = '8px';

    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.marginLeft = '8px';
    clearBtn.className = 'btn ';

    clearBtn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Insert label and clear button
    searchContainer.insertBefore(label, input);
    searchContainer.appendChild(clearBtn);
}, 100);

