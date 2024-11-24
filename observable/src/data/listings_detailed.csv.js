import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/data/listings_detailed.csv", "utf8");

const listings = csvParse(csvData, (d) => ({  
  id: d.id,
  name: d.name,
  hostId: d.host_id,
  hostName: d.host_name,
  neighborhood: d.neighbourhood_cleansed,
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
  //New values of detailed
  amenities: d.amenities,
  hostResponseRate: d.host_response_rate,
  hostResponseTime: d.host_response_time,
  hostIsSuperhost: d.host_is_superhost === 't',  // Convert 't'/'f' to boolean
  rating: +d.review_scores_rating,
  cleanlinessRating: +d.review_scores_cleanliness,
  checkinRating: +d.review_scores_checkin,
  communicationRating: +d.review_scores_communication,
  locationRating: +d.review_scores_location,
  valueRating: +d.review_scores_value,
  hostSince: new Date(d.host_since)
}));

process.stdout.write(csvFormat(listings));
