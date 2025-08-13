const axios = require("axios");
const { env } = require("../config/env");

async function ingestAxiom(events) {
  if (!env.axiomToken || !env.axiomDataset) return;
  const url = `https://api.axiom.co/v1/datasets/${encodeURIComponent(
        env.axiomDataset
  )}/ingest`;
  await axios.post(url, events, {
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.axiomToken}`
    },
    timeout: 5000
  });
}

module.exports = { ingestAxiom };