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
    ...(detailedData || {}) // Datos adicionales de listings_detailed
  };
});

const ROOM_TYPES = Array.from(new Set(listings.map(d => d.roomType)))
const NEIGHBORHOODS = Array.from(new Set(neighborhoods.map(d => d.neighborhood)))
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
let maxPrice = view(Inputs.range([minPriceSlider, maxPriceSlider], {
  step: 1,
  format: x => Math.ceil(x).toFixed(0),
  label: "Precio máximo",
  value: maxPriceSlider
}));

let maxListings = view(Inputs.range([minListingsSlider, maxListingsSlider], {
  step: 1,
  format: x => x.toFixed(0),
  label: "Propiedades máximo",
  value: maxListingsSlider
}));
```

```js
let filteredData = neighborhoodStats.filter((d) => 
  d.average_price <= maxPrice &&
  d.total_listings <= maxListings
);
```

```js
let propiedades = filteredData.reduce((acc, d) => acc + d.total_listings, 0).toLocaleString("en-US");

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


<div class="grid grid-cols-4">
  <div class="card">
    <h2>Propiedades</h2>
    <span class="big">${propiedades}</span>
  </div>
  <div class="card">
    <h2>Precio Promedio</h2>
    <span class="big">${precio_promedio}</span>
  </div>
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
        title: "Mapa de propiedades por barrio",
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

## Propiedades por ubicación

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

<div class="grid grid-cols-2">
    <div class="card">
      ${resize((width) => scatterPlotCountMean(filteredData, {width}))}
    </div>
</div>

---

```js
function pricePerNeighbourhood(data, {width} = {}) {
    const sortedData = [...data].sort((a, b) => b.average_price - a.average_price);
    
    const height = sortedData.length * 40;

    return Plot.plot({
        title: "Precio promedio por barrio",
        width,
        height,
        y: {
            grid: true,
            domain: sortedData.map(d => d.neighbourhood),
            axis: null
        },
        x: {
            label: "Precio promedio",
            grid: true,
        },
        color: { 
          legend: true, 
          type: "linear", 
          scheme: "blues",
          label: "Cantidad de propiedades"
        },
        marks: [
            Plot.barX(sortedData, {
                y: "neighbourhood",
                x: "average_price",
                fill: "total_listings",
                title: d => `Precio promedio: $${d.average_price}\nNúmero de propiedades: ${d.total_listings}`,
                tip: true,
                stroke: "black",      
                strokeWidth: 1, 
            }),
            Plot.text(sortedData, {
                y: "neighbourhood",
                x: "average_price",
                text: d => d.neighbourhood,
                fill: "black",
                dx: -10,
                dy: 0,
                textAnchor: "end",
                fontSize: 14
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

# Visualizaciones de barrios, ratings y commodities

```js
const RATINGS = [
  { label: "Limpieza", value: "avgCleanliness" },
  { label: "Check-in", value: "avgCheckin" },
  { label: "Comunicación", value: "avgCommunication" },
  { label: "Ubicación", value: "avgLocation" },
  { label: "Valor", value: "avgValue" }
]

let selectedRatingView = view(Inputs.select(
  RATINGS.map(d => d.label)
, {
  label: "Selecciona el rating",
  value: "avgValue" // Valor por defecto
}))
```

```js
let selectedRating = RATINGS.find(
  c => c.label === selectedRatingView
).value;
```

```js
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
    title: `Mapa de rating '${RATINGS.find(c => c.value === selectedRating).label}' por barrio`,
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

<div class="grid grid-cols-1">
    <div class="card">
        ${plotMapRatingsByLocation(geoNeighborhoods, ratingStats, selectedRating)}
    </div>
</div>

## Commodities por ubicación

```js
const COMMODITIES = [
  { label: "Baños", value: "avgBathrooms" },
  { label: "Camas", value: "avgBeds" },
];

let selectedCommoditieView = view(Inputs.select(
  COMMODITIES.map(c => c.label),
  {
    label: "Selecciona la métrica",
    value: "Baños" // Valor por defecto
  }
));
```

```js
let selectedCommoditie = COMMODITIES.find(
  c => c.label === selectedCommoditieView
).value;
```

```js
const commoditiesStats = Object.values(
  listings.reduce((acc, curr) => {
    const {
      neighborhood,
      bathrooms,
      beds,
    } = curr;

    if (!acc[neighborhood]) {
      acc[neighborhood] = {
        neighborhood,
        totalBathrooms: 0,
        totalBeds: 0,
        totalCount: 0
      };
    }

    acc[neighborhood].totalBathrooms += bathrooms || 0;
    acc[neighborhood].totalBeds += beds || 0;
    acc[neighborhood].totalCount += 1;

    return acc;
  }, {})
)
  .map(({ neighborhood, totalBathrooms, totalBedrooms, totalBeds, totalAccommodates, totalCount }) => ({
    neighborhood,
    total_listings: totalCount,
    avgBathrooms: (totalBathrooms / totalCount).toFixed(2),
    avgBeds: (totalBeds / totalCount).toFixed(2),
  }))
  .sort((a, b) => b.total_listings - a.total_listings);
```

```js
function plotMapCommoditiesByLocation(neighbourhoods, data, selectedCommoditie) {
  const height = 610;

  const projection = d3.geoMercator();
  projection.fitExtent([[0, 0], [width, height]], neighbourhoods);

  const dataMap = new Map(data.map(d => [
    d.neighborhood,
    {
      commoditie: d[selectedCommoditie],
      total_listings: d.total_listings
    }
  ]));

  return Plot.plot({
    title: `Mapa de ${COMMODITIES.find(c => c.value === selectedCommoditie).label} promedio por barrio`,
    projection,
    width,
    height,
    color: {
      legend: true,
      scheme: "blues",
      domain: [
        Math.min(...data.map(d => parseFloat(d[selectedCommoditie]))),
        Math.max(...data.map(d => parseFloat(d[selectedCommoditie]))),
      ]
    },
    marks: [
      Plot.geo(neighbourhoods, {
        stroke: "black",
        strokeWidth: 1,
        fill: d => dataMap.get(d.properties.neighbourhood)?.commoditie || 0,
        title: d => {
          const commoditie = dataMap.get(d.properties.neighbourhood)?.commoditie || 0;
          const total_listings = dataMap.get(d.properties.neighbourhood)?.total_listings || 0;
          return `Barrio: ${d.properties.neighbourhood}\n${selectedCommoditie}: ${commoditie}\nNúmero de propiedades: ${total_listings}`;
        },
        tip: true
      }),
    ]
  });
}
```

<div class="grid grid-cols-1">
    <div class="card">
        ${plotMapCommoditiesByLocation(geoNeighborhoods, commoditiesStats, selectedCommoditie)}
    </div>
</div>

---

```js
const roomTypeCounts = listings.reduce((acc, curr) => {
  const { roomType } = curr;
  acc[roomType] = (acc[roomType] || 0) + 1;
  return acc;
}, {});

const sortedRoomTypes = Object.entries(roomTypeCounts)
  .sort((a, b) => b[1] - a[1])  
  .map(([roomType, count]) => ({ roomType, count }));

const roomTypes = sortedRoomTypes.map(item => item.roomType);
const counts = sortedRoomTypes.map(item => item.count);
const totalRooms = counts.reduce((acc, curr) => acc + curr, 0);
const percentages = counts.map(count => ((count / totalRooms) * 100).toFixed(2));
const roomStatsHTML = roomTypes.map((roomType, index) => {
    return `${roomType}: ${counts[index]} (${percentages[index]}%)`;
  }).join(' --- ');
```

```js
function plotRoomType(sortedRoomTypes) {
  return Plot.plot({
    marks: [
      Plot.barX(sortedRoomTypes, { 
        x: counts, 
        y: roomTypes, 
        fill: "steelblue", 
        stroke: "white" ,
        sort: { y: "x", reverse: true }, 
        title: (d, i) => `${roomTypes[i]}: ${counts[i]} (${percentages[i]}%)`
      })
    ],
    marginLeft: 100,
    width: 600,
    height: 400,
    x: { 
      label: "Cantidad",
      grid: true
    },
    title: "Distribución de los tipos de habitación"
  });
}

```

<div class="grid grid-cols-1">
    <div class="card">
        ${plotRoomType(sortedRoomTypes)}
    </div>
</div>

---

# Visualizaciones de propiedades y propietarios

```js
let neighborhoodsSelectedForMap = view(Inputs.select(
  ["Todos", ...NEIGHBORHOODS],
  { 
    label: "Barrios",
    multiple: true, 
    value: ["Todos"] 
  }
));
```

```js
let listingsFiltradoForMap = listings;
if (!neighborhoodsSelectedForMap.includes("Todos")) {
  listingsFiltradoForMap = listings.filter(d => neighborhoodsSelectedForMap.includes(d.neighborhood));
}
```

```js
import deck from "npm:deck.gl";

const {DeckGL, GeoJsonLayer, ScatterplotLayer} = deck;

const mainContainer = document.createElement('div');
mainContainer.style.position = 'relative';

const container = document.createElement('div');
container.style.height = '700px';
container.style.width = '100%';
container.style.position = 'relative';
container.style.overflow = 'hidden';
container.style.marginLeft = "100px";
container.style.paddingBottom = "100px";

const initialViewState = {
  longitude: -58.3816,
  latitude: -34.6037,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

const deckInstance = new DeckGL({
  container,
  initialViewState,
  controller: true
});

invalidation.then(() => {
  deckInstance.finalize();
  container.innerHTML = "";
});

deckInstance.setProps({
  layers: [
    new GeoJsonLayer({
      id: 'base-map',
      data: geoNeighborhoods,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [0, 0, 0, 100],
      getFillColor: [200, 200, 200, 50]
    }),
    new ScatterplotLayer({
      id: 'listings',
      data: listingsFiltradoForMap, 
      pickable: true,
      radiusScale: 10, 
      radiusMinPixels: 3,
      radiusMaxPixels: 10,
      getPosition: d => [d.longitude, d.latitude], 
      getFillColor: [176,224,230], 
      getLineColor: [0, 0, 0],
      lineWidthMinPixels: 1
    })
  ]
});

// Attach the container to the DOM
document.body.appendChild(container);
```

```js
container
```


```js
function plotHostSinceHistogram(data) {
  const yearCount = data.reduce((acc, curr) => {
    const year = new Date(curr.hostSince).getFullYear();
    if (!acc[year]) {
      acc[year] = 0;
    } 
    acc[year] += 1;
    return acc;
  }, {});

  const years = Object.keys(yearCount);
  const counts = Object.values(yearCount);

  return Plot.plot({
    marks: [
      Plot.barY(counts, {
        x: years,  
        fill: "steelblue",
        title: (d, i) => `Cantidad: ${counts[i]}`
      })
    ],
    x: {
      label: "Año",
      type: "band"
    },
    y: { 
      label: "Número de propiedades",
      grid: true,
      tickFormat: d3.format("d")
    },
    title: "Distribución de los años de inicio de las propiedades"
  });
}
```

<div class="grid grid-cols-1">
    <div class="card">
        ${plotHostSinceHistogram(listings)}
    </div>
</div>

---

## Top propietarios

```js
let neighborhoodSelected = view(Inputs.select(
  ["Todos", ...NEIGHBORHOODS],
  { 
    label: "Barrio",
    value: "Todos" 
  }
));

let topHostsCount = await view(Inputs.range(
  [10, 1000], 
  {
    step: 5,
    label: "Top hosts",
    value: 10
  }
));

let maxProperties = view(Inputs.range(
  [1, 250], 
  {
    step: 1,
    label: "Propiedades máximas",
    value: 100
  }
));

let listingsByHost = d3.group(listings, d => d.hostId)
let hostRatings = d3.rollup(listings, v => d3.mean(v, d => d.valueRating), d=> d.hostId)
```

```js
let topHosts = Array.from(hostRatings.entries())
  .map(([hostId, avgRating]) => {
    let listings = listingsByHost.get(hostId);
    if(neighborhoodSelected != 'Todos'){
      listings = listings.filter(listing => listing.neighborhood == neighborhoodSelected);
    }
    if(listings.length == 0 || listings.length > maxProperties) return null;

    const hostName = listings[0].hostName;
    const propertyCount = listings.length;

    return { 
      hostId,
      avgRating,
      hostName,
      propertyCount
    };
  })
  .filter(d => d !== null)
  .sort((a, b) => b.propertyCount - a.propertyCount)
  .slice(0,topHostsCount);
```


```js
Plot.plot({
  marginTop: 20,
  marginRight: 20,
  marginBottom: 50,
  marginLeft: 120,
  height: 40 * topHosts.length, 
  color: {
    domain: topHosts.map(d => d.hostName), 
    range: d3.schemeTableau20, 
  },
  marks: [
    Plot.barX(topHosts, {
      x: "propertyCount",
      y: "hostName",
      fill: "hostName",
      sort: { y: "x", reverse: true }, 
      title: d => `Propiedades: ${d.propertyCount}\nRating: ${d.avgRating.toFixed(2)}`
    }),
    Plot.ruleX([0]), 
  ],
  x: {
    label: "Cantidad de propiedades",
    grid: true, 
  },
  y: {
    label: "Nombre del propietario",
    tickSize: 0,
  },
})
```

**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
