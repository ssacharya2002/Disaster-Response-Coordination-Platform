import WebScrapingService from './services/webScrapingService.js';

async function testWebScraping() {
  console.log('Testing Web Scraping Service...\n');

  try {
    // Test 1: Get all official updates
    console.log('1. Testing getAllOfficialUpdates...');
    const allUpdates = await WebScrapingService.getAllOfficialUpdates(5);
    console.log(`Found ${allUpdates.length} updates`);
    if (allUpdates.length > 0) {
      console.log('Sample update:', allUpdates[0]);
    }
    console.log('');

    // Test 2: Get updates by disaster type
    console.log('2. Testing getUpdatesByDisasterType for flood...');
    const floodUpdates = await WebScrapingService.getUpdatesByDisasterType('flood', 5);
    console.log(`Found ${floodUpdates.length} flood-related updates`);
    if (floodUpdates.length > 0) {
      console.log('Sample flood update:', floodUpdates[0]);
    }
    console.log('');

    // Test 3: Get updates by disaster type
    console.log('3. Testing getUpdatesByDisasterType for hurricane...');
    const hurricaneUpdates = await WebScrapingService.getUpdatesByDisasterType('hurricane', 5);
    console.log(`Found ${hurricaneUpdates.length} hurricane-related updates`);
    if (hurricaneUpdates.length > 0) {
      console.log('Sample hurricane update:', hurricaneUpdates[0]);
    }
    console.log('');

    // Test 4: Test individual source scraping
    console.log('4. Testing individual source scraping...');
    const femaUpdates = await WebScrapingService.scrapeFEMAUpdates(3);
    console.log(`FEMA updates: ${femaUpdates.length}`);
    
    const redCrossUpdates = await WebScrapingService.scrapeRedCrossUpdates(3);
    console.log(`Red Cross updates: ${redCrossUpdates.length}`);
    
    const noaaUpdates = await WebScrapingService.scrapeNOAAUpdates(3);
    console.log(`NOAA updates: ${noaaUpdates.length}`);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testWebScraping(); 