const { app } = require("@azure/functions");

app.http("auth_url", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    //firestore
    try {
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

      // get the db
      const db = getFirestore();
      const docRef = db.collection("tweeterbot-cred").doc("shrey_bot");

      //intalize tweeter api
      const TwitterApi = require("twitter-api-v2").default;
      const twitterClient = new TwitterApi({
        clientId: "VlR2M3hVVkxaUjhZbEtNcTVuZDE6MTpjaQ",
        clientSecret: "kKJzmVgjf68xgdQANtxxgOEwd4ybu1W4aLE7WRE3iymjAr-2XL",
      });
      const callbackURL = "https://tweeterbot.azurewebsites.net/api/callback";

      const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
        callbackURL,
        { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
      );

      await docRef.set({ codeVerifier, state });

      return { body: `copy paste the url: ${url}` };
    } catch (err) {
      context.log(err);
      return { body: "Error" + JSON.stringify(err) };
    }
  },
});
