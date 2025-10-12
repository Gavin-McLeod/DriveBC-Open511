const dmsApiUrl = 'dms.json';
const out = document.querySelector("#output");
async function fetchDriveBCDMS() {
  try {
    const response = await fetch(dmsApiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Limit to first 5 responses
    const limitedResults = Array.isArray(data) ? data.slice(0, 5) : [];
    // const limitedResults = data; //Array.isArray(data) ? data.slice(0, 5) : [];

    console.log('✅ Successfully fetched DriveBC DMS data:');
    limitedResults.forEach((dms, idx) => {
      const dmsData = dms.location;

      out.innerHTML += formatSign(dmsData);

    });
  } catch (error) {
    console.error('❌ Error fetching DriveBC DMS data:', error);
  }
}

function formatSign(index) {
  // format the contents of a sign for HTML output
  const decodedText = atob(index.content.pages[0].lines[0].text);
  let out = ""
  out += `<span class="boldlead">Sign Number:</span> ${index.signNo}<br>`;
  out += `<span class="boldlead">Description:</span> ${index.description}<br>`;
  out += `<span class="boldlead">Updated:</span> ${index.content.updated}<br>`;
  out += `<span class="boldlead"><br>LINES:</span> ${decodedText}<br><hr>`;
  // console.log(out);
  return out;
}


fetchDriveBCDMS();