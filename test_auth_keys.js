import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a045c323aa46701deecf187",
  headers: {
    "api_key": "746dcc2238334a22a026957bec7eea0a"
  },
  serverUrl: "https://api.base44.app"
});

console.log(Object.keys(base44.auth));
console.log(typeof base44.auth.login);
