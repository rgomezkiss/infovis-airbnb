import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/output/listings_filtrado.csv", "utf8");

const listings = csvParse(csvData, (d) => ({  
  id: d.id,
  name: d.name,
  hostId: d.host_id,
  hostName: d.host_name,
  neighborhoodGroup: d.neighbourhood_group,
  neighborhood: d.neighbourhood,
  latitude: d.latitude,
  longitude: d.longitude,
  roomType: d.room_type,
  price: +d.price,
  minimumNights: +d.minimum_nights,
  numberOfReviews: +d.number_of_reviews,
  lastReview: d.last_review,
  reviewsPerMonth: +d.reviews_per_month,
  calculatedHostListingsCount: +d.calculated_host_listings_count,
  availability365: +d.availability_365,
  numberOfReviewsLTM: +d.number_of_reviews_ltm,
  license: d.license,
}));

process.stdout.write(csvFormat(listings));
