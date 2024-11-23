import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/output/average_price_and_bookings_by_neighbourhood.csv", "utf8");

const average_price = csvParse(csvData, (d) => ({  
    neighbourhood: d.neighbourhood,
    average_price: +d.mean,
    total_bookings: +d.count
}));

process.stdout.write(csvFormat(average_price));
