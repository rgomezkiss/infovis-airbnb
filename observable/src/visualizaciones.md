---
title: Visualizaciones
toc: false
---

# Visualizaciones

```js
const listings = await FileAttachment('./data/listings.csv').csv({typed: true});
const listings_filtrado = await FileAttachment('./data/listings_filtrado.csv').csv({typed: true});
const neighborhoods = await FileAttachment('./data/neighborhoods.csv').csv({ typed: true })
const geoNeighborhoods = await FileAttachment('./data/neighbourhoods_geo.json').json()
```

```js
const neighborhoodStats = Object.values(
  listings_filtrado.reduce((acc, curr) => {
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

let barrios = d3.group(filteredData, (d) => d.neighbourhood).size || 0; // Evitar errores si no hay barrios

let precio_promedio = filteredData.length > 0 
  ? d3.mean(filteredData, (d) => d.average_price).toLocaleString("en-US", {style: "currency", currency: "USD"}) 
  : "N/A"; // Proporcionar "N/A" si no hay datos

// Determinar barrio más caro y más barato
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
function plotMap(neighbourhoods, data) {
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
            domain: [Math.min(...data.map(d => d.average_price)) - 50, Math.max(...data.map(d => d.average_price))]
        },
        marks: [
            Plot.geo(neighbourhoods, {
                stroke: "black",
                strokeWidth: 1,
                fill: d => dataMap.get(d.properties.neighbourhood)?.average_price || 0,
                title: d => {
                    const average_price = dataMap.get(d.properties.neighbourhood)?.average_price || 0;
                    const total_listings = dataMap.get(d.properties.neighbourhood)?.total_listings || 0;
                    return `Barrio: ${d.properties.neighbourhood}\nPrecio promedio: ${average_price}\nNúmero de propiedades: ${total_listings}`;
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
        ${plotMap(geoNeighborhoods, filteredData)}
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
                title: d => `Barrio: ${d.neighbourhood}\nNúmero de propiedades: ${d.total_listings}\nPromedio: ${d.average_price}`,
                stroke: "black", // Contorno negro para destacar los puntos
                fill: "steelblue", // Color de los puntos
                tip: true // Habilita el tip para cada punto
            })
        ],
    });
}
```

```js
function histogramCount(data, {width} = {}) {
    const height = 400;

    return Plot.plot({
        title: "Distribución del número de propiedades",
        width,
        height,
        x: {
            label: "Número de propiedades",
            grid: true
        },
        y: {
            label: "Cantidad de barrios",
            grid: true,
        },
        marks: [
            Plot.rectY(data, Plot.binX({y: "count", thresholds: 8}, {
                x: "total_listings",
                fill: "steelblue",
                title: d => `Número de propiedades: ${d.bin0} - ${d.bin1}\nCantidad de barrios: ${d.total_listings}`,
            }))
        ],
    });
}
```

<div class="grid grid-cols-1">
    <h2>Relacion entre la cantidad de propiedades y el precio en los barrios</h2>
</div>

<div class="grid grid-cols-2">
    <div class="card">
        ${resize((width) => histogramCount(filteredData, {width}))}
    </div>
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
        color: { legend: true, type: "linear", scheme: "blues" },
        marks: [
            Plot.barX(sortedData, {
                y: "neighbourhood",
                x: "average_price",
                fill: "total_listings",
                title: d => `Precio: ${d.average_price}`,
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

## Precio promedio 

```js
geoData.features.forEach(feature => {
  const name = feature.properties.neighbourhood; 
  const row = data.find(d => d.neighbourhood === name);
  feature.properties.average_price = row?.average_price || 0;
  feature.properties.total_listings = row?.total_listings || 0;
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
viewof radiusScaleListings = d3.scaleSqrt()
  .domain([0, d3.max(data, d => d.total_listings)])
  .range([0, 20]);

mapTotalListings = {
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
    .data(geoData.features.filter(d => d.properties.total_listings > 0))
    .join("circle")
    .attr("cx", d => projection(d3.geoCentroid(d))[0])
    .attr("cy", d => projection(d3.geoCentroid(d))[1])
    .attr("r", d => radiusScaleListings(d.properties.total_listings))
    .attr("fill", "red")
    .attr("opacity", 0.7);

  return svg.node();
}
```

**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
