const { app } = require("@azure/functions");

app.http("callback", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const url = require("url");
    const http = require("http");
    const query = url.parse(request.url, true).query;
    const { state, code } = query;
    try {
      context.log(`Http function processed request for url "${request.url}"`);
      //firestore
      const {
        initializeApp,
        applicationDefault,
        cert,
        getApp,
      } = require("firebase-admin/app");
      const {
        getFirestore,
        Timestamp,
        FieldValue,
        Filter,
      } = require("firebase-admin/firestore");

      //get the credition for firestore from serviceAccountkey.json
      const path = require("path");
      const dirPath = path.join(__dirname, "../../serviceAccountKey.json");
      const serviceAccount = require(dirPath);
      const admin = require("firebase-admin");

      if (!admin.apps.length) {
        initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      const db = getFirestore();
      const docRef = db.collection("tweeterbot-cred").doc("shrey_bot");
      const dbSnapshot = await docRef.get();
      const { codeVerifier, state: storedState } = dbSnapshot.data();
      if (state !== storedState) {
        return {
          status: 400,
          body: `Stored tokens do not match! ${state} ${storedState} ${JSON.stringify(
            request
          )}`,
        };
      }
      const TwitterApi = require("twitter-api-v2").default;
      const twitterClient = new TwitterApi({
        clientId: "tweeter-client-id",
        clientSecret: "tweeter-secret",
      });
      const callbackURL = "https://tweeterbot.azurewebsites.net/api/callback";
      const {
        client: loggedClient,
        accessToken,
        refreshToken,
      } = await twitterClient.loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: callbackURL,
      });
      await docRef.set({ accessToken, refreshToken });

      const { data } = await loggedClient.v2.me(); // start using the client if you want
      return { body: JSON.stringify(data) };
    } catch (err) {
      context.log(err);
      return { body: "Error" + JSON.stringify(err) };
    }
  },
});
