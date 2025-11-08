interface ExampleWorkflowParmas {
  dataToPassIn;
}

interface Env extends Cloudflare.Env {
  // Spotify API credentials
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;

  // Database
  DB: D1Database;

  // Workflows
  SYNC_ARTIST_WORKFLOW: Workflow;
}
