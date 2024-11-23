import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/data/neighbourhoods.csv", "utf8");

const neighborhoods = csvParse(csvData, (d) => ({  
  neighborhood: d.neighbourhood,
}));

process.stdout.write(csvFormat(neighborhoods));
