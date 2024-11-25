import { csvFormat, csvParse } from "d3-dsv";
import { readFileSync } from "fs";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

const csvData = readFileSync("../preprocessing/data/listings_detailed.csv", "utf8");

const listings_detailed = csvParse(csvData, (d) => ({  
    id: d.id,
    name: d.name,
    hostId: d.host_id,
    hostName: d.host_name,
    neighborhood: d.neighbourhood_group_cleansed,
    latitude: d.latitude,
    longitude: d.longitude,
    roomType: d.room_type,
    price: +d.price || 0,  
    minimumNights: +d.minimum_nights || 0,
    numberOfReviews: +d.number_of_reviews || 0,
    lastReview: d.last_review || '', 
    reviewsPerMonth: +d.reviews_per_month || 0,
    calculatedHostListingsCount: +d.calculated_host_listings_count || 0,
    availability365: +d.availability_365 || 0,
    numberOfReviewsLTM: +d.number_of_reviews_ltm || 0,
    license: d.license || '',  
    // Nuevos valores detallados
    amenities: d.amenities || '',  
    hostResponseRate: d.host_response_rate || '',  
    hostResponseTime: d.host_response_time || '',  
    hostIsSuperhost: d.host_is_superhost === 't', 
    rating: +d.review_scores_rating || 0,  
    acurracyRating: +d.review_scores_accuracy || 0,  
    cleanlinessRating: +d.review_scores_cleanliness || 0,
    checkinRating: +d.review_scores_checkin || 0,
    communicationRating: +d.review_scores_communication || 0,
    locationRating: +d.review_scores_location || 0,
    valueRating: +d.review_scores_value || 0,
    hostSince: d.host_since ? new Date(d.host_since) : null  
}));
  
process.stdout.write(csvFormat(listings_detailed));
