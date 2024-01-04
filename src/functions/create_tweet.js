const { app } = require("@azure/functions");

app.http("create_tweet", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log(`Http function processed request for url "${request.url}"`);

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
      const { refreshToken } = dbSnapshot.data();
      const TwitterApi = require("twitter-api-v2").default;
      const twitterClient = new TwitterApi({
        clientId: "VlR2M3hVVkxaUjhZbEtNcTVuZDE6MTpjaQ",
        clientSecret: "kKJzmVgjf68xgdQANtxxgOEwd4ybu1W4aLE7WRE3iymjAr-2XL",
      });
      const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken,
      } = await twitterClient.refreshOAuth2Token(refreshToken);

      const stoicQuote = require("stoic-quotes");

      const nextTweet = stoicQuote();

      const { data } = await refreshedClient.v2.tweet(
        nextTweet.quote + "\n" + "\t-" + nextTweet.author
      );
      await docRef.set({ accessToken, refreshToken: newRefreshToken });
      return { body: JSON.stringify(data) };
    } catch (err) {
      console.log(err);
      return { body: "Error" + JSON.stringify(err) };
    }
  },
});
