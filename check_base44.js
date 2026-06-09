import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a045c323aa46701deecf187",
  headers: {
    "api_key": "746dcc2238334a22a026957bec7eea0a"
  },
  serverUrl: "https://api.base44.app" // bypassing local proxy
});

async function analyze() {
  try {
    const guesses = ['matches', 'sports', 'games', 'events', 'odds', 'tournaments'];
    for (const entityName of guesses) {
      try {
        const res = await base44.entities[entityName].findMany({ limit: 1 });
        console.log(`Found entity '${entityName}':`, JSON.stringify(res));
      } catch (e) {
        // console.log(`Entity '${entityName}' not found or error.`);
      }
    }
    console.log("Analysis complete.");
  } catch(e) {
    console.error(e);
  }
}

analyze();
