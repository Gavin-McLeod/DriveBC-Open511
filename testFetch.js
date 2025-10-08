const dmsApiUrl = 'https://prd.th.gov.bc.ca/DriveBC_DMS/v1/dms?format=json';

async function fetchDriveBCDMS() {
  try {
    const response = await fetch(dmsApiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Limit to first 5 responses
    const limitedResults = Array.isArray(data) ? data.slice(0, 5) : [];

    console.log('✅ Successfully fetched DriveBC DMS data:');
    limitedResults.forEach((dms, idx) => {
      console.log(`\nDMS ${idx + 1}:`);
      console.log(`- ID: ${dms.dms_id}`);
      console.log(`- Location: ${dms.location}`);
      console.log(`- Message: ${dms.message}`);
      // Add more fields as needed
    });
  } catch (error) {
    console.error('❌ Error fetching DriveBC DMS data:', error);
  }
}

fetchDriveBCDMS();