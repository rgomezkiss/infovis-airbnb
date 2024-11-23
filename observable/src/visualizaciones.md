---
title: Visualizaciones
toc: false
---

# Visualizaciones

```js
const data = await FileAttachment('./data/listings.csv').csv({typed: true});
const neighborhoods = await FileAttachment('./data/neighborhoods.csv').csv({ typed: true })
const geoNeighborhoods = await FileAttachment('./data/neighbourhoods_geo.json').json()
const average_price_data = await FileAttachment('./data/average_price.csv')

```

## Filtros

```js
let neighborhoodSelected = view(Inputs.select(["Todos", 
  ...Array.from(new Set(neighborhoods.map(d => d.neighborhood).filter(Boolean)))],
  { label: "Selecciona un barrio" }
))
```

```js
let minSlider = d3.min(data, d => +d.price);
let maxSlider = d3.max(data, d => +d.price);
let minPrice = minSlider;
let maxPrice = maxSlider;

minPrice = view(Inputs.range([minSlider, maxSlider], {step: 1, format: x => x.toFixed(0), label: "Precio mínimo", value: minSlider}));
maxPrice = view(Inputs.range([minSlider, maxSlider], {step: 1, format: x => x.toFixed(0), label: "Precio máximo", value: maxSlider}));
```

```js
let filteredData = data;

/* if(short_stay && short_stay.length > 0){
  filteredData = filteredData.filter(d => d.minimumNights <= 15)
} */

filteredData = filteredData.filter(d => d.price >= minPrice && d.price <= maxPrice)

if(neighborhoodSelected != 'Todos'){
  filteredData  = filteredData.filter(d => d.neighborhood == neighborhoodSelected)
}

const selectedNeighborhood = neighborhoodSelected == 'Todos' ? "Buenos Aires": neighborhoodSelected;
```

## Resumen de Datos

<div class="grid grid-cols-4 gap-4">
  <div class="card">
    <h2>Total de listados en ${selectedNeighborhood} 🇦🇷</h2>
    <span class="big"><b>${filteredData.length}
</b></span>
  </div>
  <div class="card">
    <h2>Dinero gastado en Airbnbs de ${selectedNeighborhood} 💸</h2>
    <span class="big"><b>${d3.sum(filteredData, item => (item.price * item.numberOfReviews)).toLocaleString("en-US", {style: "currency", currency: "USD"})} USD</b></span>
  </div>
  <div class="card">
    <h2>Ocupación de Airbnbs del último año de ${selectedNeighborhood} 📊</h2>
    <span class="big"><b>${(d3.mean(filteredData, d => d.reviewsPerMonth / 0.50 / 30) * 100).toFixed(2)} %</b></span>
  </div>
</div>

---

## Precio promedio 
```js
geoData.features.forEach(feature => {
  const name = feature.properties.neighbourhood; 
  const row = data.find(d => d.neighbourhood === name);
  feature.properties.average_price = row?.average_price || 0;
  feature.properties.total_bookings = row?.total_bookings || 0;
});

viewof colorScalePrice = d3.scaleSequential()
  .domain(d3.extent(data, d => d.average_price))
  .interpolator(d3.interpolateBlues);

mapAveragePrice = {
  const svg = d3.create("svg").attr("viewBox", "0 0 800 800");

  const projection = d3.geoMercator().fitSize([800, 800], geoData);
  const path = d3.geoPath(projection);

  svg.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => colorScalePrice(d.properties.average_price))
    .attr("stroke", "white");

  return svg.node();
}
```

<div class="map-container">
  ${mapAveragePrice}
</div>

---

```js
viewof radiusScaleBookings = d3.scaleSqrt()
  .domain([0, d3.max(data, d => d.total_bookings)])
  .range([0, 20]);

mapTotalBookings = {
  const svg = d3.create("svg").attr("viewBox", "0 0 800 800");

  const projection = d3.geoMercator().fitSize([800, 800], geoData);
  const path = d3.geoPath(projection);

  svg.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#ddd")
    .attr("stroke", "white");

  svg.selectAll("circle")
    .data(geoData.features.filter(d => d.properties.total_bookings > 0))
    .join("circle")
    .attr("cx", d => projection(d3.geoCentroid(d))[0])
    .attr("cy", d => projection(d3.geoCentroid(d))[1])
    .attr("r", d => radiusScaleBookings(d.properties.total_bookings))
    .attr("fill", "red")
    .attr("opacity", 0.7);

  return svg.node();
}
```

**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
