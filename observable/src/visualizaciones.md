---
title: Visualizaciones
toc: false
---

```js
//const listings = await FileAttachment('./data/listings.csv').csv({typed: true});
const listings_filtrado = await FileAttachment('./data/listings_filtrado.csv').csv({typed: true});
const listings_detailed = await FileAttachment('./data/listings_detailed.csv').csv({typed: true});
const neighborhoods = await FileAttachment('./data/neighborhoods.csv').csv({ typed: true })
const geoNeighborhoods = await FileAttachment('./data/neighbourhoods_geo.json').json()

const listings = listings_filtrado.map(listing => {
  const detailedData = listings_detailed.find(detail => detail.id === listing.id);

  return {
    ...listing, // Datos originales de listings_filtrado
    ...(detailedData || {}) // Datos adicionales de listings_detailed (si existe)
  };
});
```

# Visualizaciones de barrios y precios


```js
const neighborhoodStats = Object.values(
  listings.reduce((acc, curr) => {
    const { neighborhood, price } = curr;

    if (!acc[neighborhood]) {
      acc[neighborhood] = { neighborhood, totalPrice: 0, totalCount: 0 };
    }

    acc[neighborhood].totalPrice += price;
    acc[neighborhood].totalCount += 1;

    return acc;
  }, {})
)
  .map(({ neighborhood, totalPrice, totalCount }) => ({
    neighbourhood: neighborhood,
    average_price: Math.round(totalPrice / totalCount),
    total_listings: totalCount,
  }))
  .sort((a, b) => b.average_price - a.average_price);
```

---

```js
let [minPriceSlider, maxPriceSlider] = d3.extent(neighborhoodStats, (d) => d.average_price);
minPriceSlider = Math.ceil(minPriceSlider); 
maxPriceSlider = Math.ceil(maxPriceSlider);  

let [minListingsSlider, maxListingsSlider] = d3.extent(neighborhoodStats, (d) => d.total_listings);
minListingsSlider = Math.ceil(minListingsSlider);  
maxListingsSlider = Math.ceil(maxListingsSlider); 

// Aplicar los rangos a los sliders
let minPrice = view(Inputs.range([minPriceSlider, maxPriceSlider], {
  step: 1,
  format: x => Math.ceil(x).toFixed(0),
  label: "Precio mínimo",
  value: minPriceSlider
}));

let maxPrice = view(Inputs.range([minPriceSlider, maxPriceSlider], {
  step: 1,
  format: x => Math.ceil(x).toFixed(0),
  label: "Precio máximo",
  value: maxPriceSlider
}));

let minListings = view(Inputs.range([minListingsSlider, maxListingsSlider], {
  step: 1,
  format: x => x.toFixed(0),
  label: "Listings mínimo",
  value: minListingsSlider
}));

let maxListings = view(Inputs.range([minListingsSlider, maxListingsSlider], {
  step: 1,
  format: x => x.toFixed(0),
  label: "Listings máximo",
  value: maxListingsSlider
}));
```

```js
let filteredData = neighborhoodStats.filter((d) => 
  d.average_price >= minPrice && 
  d.average_price <= maxPrice &&
  d.total_listings >= minListings && 
  d.total_listings <= maxListings
);
```

```js
let anuncios = filteredData.reduce((acc, d) => acc + d.total_listings, 0).toLocaleString("en-US");

let barrios = d3.group(filteredData, (d) => d.neighbourhood).size || 0; 

let precio_promedio = filteredData.length > 0 
  ? d3.mean(filteredData, (d) => d.average_price).toLocaleString("en-US", {style: "currency", currency: "USD"}) 
  : "N/A";

let maxPrecio = filteredData.length > 0 ? d3.max(filteredData, (d) => d.average_price) : 0;
let barrio_mas_caro = filteredData.find((d) => d.average_price === maxPrecio)?.neighbourhood || "N/A";
let precio_barrio_mas_caro = maxPrecio ? maxPrecio.toLocaleString("en-US", {style: "currency", currency: "USD"}) : "N/A";

let minPrecio = filteredData.length > 0 ? d3.min(filteredData, (d) => d.average_price) : 0;
let barrio_mas_barato = filteredData.find((d) => d.average_price === minPrecio)?.neighbourhood || "N/A";
let precio_barrio_mas_barato = minPrecio ? minPrecio.toLocaleString("en-US", {style: "currency", currency: "USD"}) : "N/A";
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Anuncios 🏠</h2>
    <span class="big">${anuncios}</span>
  </div>
  <div class="card">
    <h2>Barrios 📌</h2>
    <span class="big">${barrios}</span>
  </div>
  <div class="card">
    <h2>Precio Promedio 💰</h2>
    <span class="big">${precio_promedio}</span>
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Barrio más caro <span class="muted">/ ${barrio_mas_caro}</span></h2>
    <span class="big">${precio_barrio_mas_caro}</span>
  </div>
    <div class="card">
        <h2>Barrio más barato <span class="muted">/ ${barrio_mas_barato}</span></h2>
        <span class="big">${precio_barrio_mas_barato}</span>
    </div>  
</div>

---


```js
function plotMapListingsByLocation(neighbourhoods, data) {
    const height = 610;

    const projection = d3.geoMercator();
    projection.fitExtent([[0, 0], [width, height]], neighbourhoods);

    const dataMap = new Map(data.map(d => [d.neighbourhood, {
        total_listings: d.total_listings
    }]));

    return Plot.plot({
        title: "Mapa de listings por barrio",
        projection,
        width,
        height,
        color: {
            legend: true,
            scheme: "blues",
        },
        marks: [
            Plot.geo(neighbourhoods, {
                stroke: "black",
                strokeWidth: 1,
                fill: d => dataMap.get(d.properties.neighbourhood)?.total_listings || 0,
                title: d => {
                    const total_listings = dataMap.get(d.properties.neighbourhood)?.total_listings || 0;
                    return `Barrio: ${d.properties.neighbourhood}\nNúmero de propiedades: ${total_listings}`;
                },
                tip: true
            }),
        ]
    });
}
```

## Listings por ubicación

<div class="grid grid-cols-1">
    <div class="card">
        ${plotMapListingsByLocation(geoNeighborhoods, filteredData)}
    </div>
</div>

```js
function plotMapPriceByLocation(neighbourhoods, data) {
    const height = 610;

    const projection = d3.geoMercator();
    projection.fitExtent([[0, 0], [width, height]], neighbourhoods);

    const dataMap = new Map(data.map(d => [d.neighbourhood, {
        average_price: d.average_price,
        total_listings: d.total_listings
    }]));

    return Plot.plot({
        title: "Mapa de precios promedio por barrio",
        projection,
        width,
        height,
        color: {
            legend: true,
            scheme: "blues",
            domain: [Math.min(...data.map(d => d.average_price)), Math.max(...data.map(d => d.average_price))]
        },
        marks: [
            Plot.geo(neighbourhoods, {
                stroke: "black",
                strokeWidth: 1,
                fill: d => dataMap.get(d.properties.neighbourhood)?.average_price || 0,
                title: d => {
                    const average_price = dataMap.get(d.properties.neighbourhood)?.average_price || 0;
                    const total_listings = dataMap.get(d.properties.neighbourhood)?.total_listings || 0;
                    return `Barrio: ${d.properties.neighbourhood}\nPrecio promedio: $${average_price}\nNúmero de propiedades: ${total_listings}`;
                },
                tip: true
            }),
        ]
    });
}
```

## Precio promedio por ubicación

<div class="grid grid-cols-1">
    <div class="card">
        ${plotMapPriceByLocation(geoNeighborhoods, filteredData)}
    </div>
</div>

---

```js
function scatterPlotCountMean(data, {width} = {}) {
    const sortedData = [...data].sort((a, b) => a.total_listings - b.total_listings);

    const height = 400;

    return Plot.plot({
        title: "Número de propiedades vs. Precios promedio",
        width,
        height,
        x: {
            label: "Número de propiedades",
            grid: true
        },
        y: {
            label: "Promedio",
            grid: true
        },
        marks: [
            Plot.dot(sortedData, {
                x: "total_listings",
                y: "average_price",
                title: d => `Barrio: ${d.neighbourhood}\nNúmero de propiedades: ${d.total_listings}\nPrecio promedio: $${d.average_price}`,
                stroke: "black", 
                fill: "steelblue", 
                tip: true 
            })
        ],
    });
}
```
## Relacion entre la cantidad de propiedades y el precio en los barrios

<div class="grid grid-cols-2">
    <div class="card">
      ${resize((width) => scatterPlotCountMean(filteredData, {width}))}
    </div>
</div>

---

```js
function pricePerNeighbourhood(data, {width} = {}) {
    const sortedData = [...data].sort((a, b) => b.average_price - a.average_price);
    
    const height = sortedData.length * 20;

    return Plot.plot({
        title: "Precio promedio por barrio",
        width,
        height,
        y: {
            label: "",
            grid: true,
            domain: sortedData.map(d => d.neighbourhood),
            axis: null
        },
        x: {
            label: "Precio promedio"
        },
        color: { 
          legend: true, 
          type: "linear", 
          scheme: "blues",
          label: "Cantidad de listings"
        },
        marks: [
            Plot.barX(sortedData, {
                y: "neighbourhood",
                x: "average_price",
                fill: "total_listings",
                title: d => `Precio promedio: $${d.average_price}\nNúmero de propiedades: ${d.total_listings}`,
                tip: true
            }),
            Plot.text(sortedData, {
                y: "neighbourhood",
                x: "average_price",
                text: d => d.neighbourhood,
                fill: "black",
                dx: -10,
                dy: 0,
                textAnchor: "end"
            }),
            Plot.ruleY([0])
        ],
    });
}
```

<div class="grid grid-cols-1">
    <div class="card">
        ${resize((width) => pricePerNeighbourhood(filteredData, {width}))}
    </div>
</div>

---
---

# Visualizaciones de barrios y ratings

```js
const RATINGS = [
  { label: "Limpieza", value: "avgCleanliness" },
  { label: "Check-in", value: "avgCheckin" },
  { label: "Comunicación", value: "avgCommunication" },
  { label: "Ubicación", value: "avgLocation" },
  { label: "Valor", value: "avgValue" }
]

let selectedRating = view(Inputs.select([
  "avgCleanliness",
  "avgCheckin",
  "avgCommunication",
  "avgLocation",
  "avgValue"
], {
  label: "Selecciona el rating",
  value: "avgValue" // Valor por defecto
}))


const ratingStats = Object.values(
  listings.reduce((acc, curr) => {
    const {
      neighborhood,
      cleanlinessRating,
      checkinRating,
      communicationRating,
      locationRating,
      valueRating,
    } = curr;

    if (!acc[neighborhood]) {
      acc[neighborhood] = {
        neighborhood,
        totalCleanliness: 0,
        totalCheckin: 0,
        totalCommunication: 0,
        totalLocation: 0,
        totalValue: 0,
        totalCount: 0,
      };
    }

    acc[neighborhood].totalCleanliness += cleanlinessRating || 0;
    acc[neighborhood].totalCheckin += checkinRating || 0;
    acc[neighborhood].totalCommunication += communicationRating || 0;
    acc[neighborhood].totalLocation += locationRating || 0;
    acc[neighborhood].totalValue += valueRating || 0;
    acc[neighborhood].totalCount += 1;

    return acc;
  }, {})
)
  .map(({ neighborhood, totalCleanliness, totalCheckin, totalCommunication, totalLocation, totalValue, totalCount }) => ({
    neighborhood,
    total_listings: totalCount,
    avgCleanliness: (totalCleanliness / totalCount).toFixed(2),
    avgCheckin: (totalCheckin / totalCount).toFixed(2),
    avgCommunication: (totalCommunication / totalCount).toFixed(2),
    avgLocation: (totalLocation / totalCount).toFixed(2),
    avgValue: (totalValue / totalCount).toFixed(2),
  }))
  .sort((a, b) => b.total_listings - a.total_listings); 
```

```js
function plotMapRatingsByLocation(neighbourhoods, data, selectedRating) {
  const height = 610;

  const projection = d3.geoMercator();
  projection.fitExtent([[0, 0], [width, height]], neighbourhoods);

  const dataMap = new Map(data.map(d => [
    d.neighborhood,
    {
      rating: d[selectedRating],
      total_listings: d.total_listings
    }
  ]));

  return Plot.plot({
    title: `Mapa de ${selectedRating} por barrio`,
    projection,
    width,
    height,
    color: {
      legend: true,
      scheme: "blues",
      domain: [
        Math.min(...data.map(d => parseFloat(d[selectedRating]))),
        Math.max(...data.map(d => parseFloat(d[selectedRating])))
      ]
    },
    marks: [
      Plot.geo(neighbourhoods, {
        stroke: "black",
        strokeWidth: 1,
        fill: d => dataMap.get(d.properties.neighbourhood)?.rating || 0,
        title: d => {
          const rating = dataMap.get(d.properties.neighbourhood)?.rating || 0;
          const total_listings = dataMap.get(d.properties.neighbourhood)?.total_listings || 0;
          return `Barrio: ${d.properties.neighbourhood}\nRating: ${rating}\nNúmero de propiedades: ${total_listings}`;
        },
        tip: true
      }),
    ]
  });
}

```

## Ratings por ubicación

<div class="grid grid-cols-1">
    <div class="card">
        ${plotMapRatingsByLocation(geoNeighborhoods, ratingStats, selectedRating)}
    </div>
</div>


**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
