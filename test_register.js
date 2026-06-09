import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a045c323aa46701deecf187",
  headers: {
    "api_key": "746dcc2238334a22a026957bec7eea0a"
  },
  serverUrl: "https://api.base44.app"
});

async function testRegistration() {
  const phone = "01799999999";
  const email = `${phone}@crbet666.com`;
  const password = "password123";

  try {
    console.log(`[1] Registering account for ${email}...`);
    // Pass as an object
    await base44.auth.register({ email, password });
    console.log(`✅ Registration successful!`);

    console.log(`[2] Logging in to get token...`);
    // Try passing as an object if login also expects an object, else try as positional
    try {
        await base44.auth.login(email, password);
    } catch(e) {
        await base44.auth.login({ email, password });
    }
    console.log(`✅ Login successful!`);

    console.log(`[3] Fetching current user...`);
    const user = await base44.auth.me();
    console.log(`✅ User fetched: ID=${user.id}`);

    console.log(`[4] Creating UserProfile entity...`);
    const profile = await base44.entities.UserProfile.create({
      phone,
      referral_code: null,
      balance: 0,
      is_active: true,
    });
    console.log(`✅ UserProfile created: ID=${profile.id}`);

    console.log(`[5] Updating full_name...`);
    await base44.auth.updateMe({
      full_name: phone
    });
    console.log(`✅ Full name updated to ${phone}`);

    console.log(`\n🎉 All registration steps completed successfully!`);
  } catch (error) {
    console.error("❌ Registration failed:", error.response?.data || error.message || error);
  }
}

testRegistration();
