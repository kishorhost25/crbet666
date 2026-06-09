import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a045c323aa46701deecf187",
  headers: {
    "api_key": "746dcc2238334a22a026957bec7eea0a"
  },
  serverUrl: "https://api.base44.app"
});

const API_TOKEN = "B62GDoFCT1oxoF2MndHZ3wLub7mFkde160X3Bkkvl6rWkZQ12s";
const API_DOMAIN = "crbet666.com";
const API_BASE = 'https://slotslaunch.com/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': API_DOMAIN
};

async function syncGames() {
  console.log("Starting SlotsLaunch sync...");
  let allGames = [];
  let page = 1;
  let hasMore = true;

  try {
    // Fetch all games paginated
    while (hasMore) {
      console.log(`Fetching page ${page}...`);
      const url = `${API_BASE}/games?token=${API_TOKEN}&page=${page}&per_page=150&order_by=updated_at&order=desc`;
      const response = await fetch(url, { method: 'GET', headers });
      
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error ${response.status}: ${err}`);
      }

      const data = await response.json();
      const games = Array.isArray(data) ? data : (data.data || data.games || []);
      
      console.log(`Received ${games.length} games on page ${page}`);
      
      if (!Array.isArray(games) || games.length === 0) {
        hasMore = false;
      } else {
        allGames = [...allGames, ...games];
        page++;
      }
    }

    console.log(`Total games fetched from SlotsLaunch: ${allGames.length}`);

    if (allGames.length === 0) {
      console.log("No games found. Exiting.");
      return;
    }

    // Get existing games to avoid duplicate insertion
    console.log("Fetching existing games from database...");
    const existing = await base44.entities.SlotGame.list();
    const existingIds = new Set(existing.map(g => g.external_id));

    console.log(`Found ${existingIds.size} existing games in DB.`);

    // Filter out games that already exist
    const gamesToCreate = allGames
      .filter(g => !existingIds.has(g.id))
      .map(g => {
        const embedUrl = g.url ? `https://slotslaunch.com/iframe/${g.id}?token=${API_TOKEN}` : null;
        
        // Ensure themes are converted to string or array properly. The DB expects JSON string if it's a JSON field, but base44 SDK handles object to JSON auto if defined as object array.
        // I will safely stringify arrays to avoid issues if the schema expects text. Let's just pass the objects, sdk usually handles it.
        return {
          external_id: g.id,
          name: g.name,
          slug: g.slug,
          description: g.description,
          url: embedUrl || g.url,
          thumb: g.thumb,
          provider_id: g.provider_id,
          provider: g.provider,
          type_id: g.type_id,
          type: g.type,
          rtp: g.rtp ? Number(g.rtp) : null,
          volatility: g.volatility,
          min_bet: g.min_bet ? Number(g.min_bet) : null,
          max_bet: g.max_bet ? Number(g.max_bet) : null,
          published: g.published,
          featured: g.featured,
          last_synced: new Date().toISOString()
        };
      });

    console.log(`Games to insert into DB: ${gamesToCreate.length}`);

    // Bulk create
    if (gamesToCreate.length > 0) {
      // Chunking if the array is too large to avoid Payload Too Large errors
      const chunkSize = 100;
      for (let i = 0; i < gamesToCreate.length; i += chunkSize) {
        const chunk = gamesToCreate.slice(i, i + chunkSize);
        console.log(`Inserting chunk ${i / chunkSize + 1} (${chunk.length} games)...`);
        await base44.entities.SlotGame.bulkCreate(chunk);
      }
      console.log("✅ All new games successfully inserted into database!");
    } else {
      console.log("No new games to insert.");
    }
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}

syncGames();
