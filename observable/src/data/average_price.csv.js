import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/data/average_price_and_bookings_by_neighbourhood.csv", "utf8");

const average_price = csvParse(csvData, (d) => ({  
    neighbourhood: d.neighbourhood,
    average_price: +d.average_price,
    total_bookings: +d.total_bookings
}));

process.stdout.write(csvFormat(average_price));
