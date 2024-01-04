const { app } = require("@azure/functions");

app.timer("send_tweet_cron_job", {
  schedule: "0 0 10 * * *",
  // '0 0 0 * * *',
  handler: (myTimer, context) => {
    (async () => {
      await fetch("https://tweeterbot.azurewebsites.net/api/create_tweet");
    })();
    context.log("Timer function processed request.");
  },
});
