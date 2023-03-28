const axios = require("axios");
const ToneAnalyzerV3 = require("ibm-watson/tone-analyzer/v3");
const { IamAuthenticator } = require("ibm-watson/auth");

async function main() {
  const prOrIssue = await getPrOrIssue();
  const content = prOrIssue.body || prOrIssue.title;
  const toneAnalyzer = getToneAnalyzer();
  const toneAnalysis = await toneAnalyzer.tone({
    toneInput: { text: content },
    contentType: "application/json",
  });
  const tones = toneAnalysis.result.document_tone.tones;
  tones.forEach((tone) => {
    console.log(`${tone.tone_name}: ${tone.score}`);
  });
}

async function getPrOrIssue() {
  const url = process.env.GITHUB_EVENT_PATH;
  const options = {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  };
  const response = await axios.get(url, options);
  return response.data;
}

function getToneAnalyzer() {
  const authenticator = new IamAuthenticator({
    apikey: process.env.IBM_API_KEY,
  });
  const toneAnalyzer = new ToneAnalyzerV3({
    version: "2021-03-25",
    authenticator,
    serviceUrl: process.env.IBM_URL,
  });
  return toneAnalyzer;
}

main();
