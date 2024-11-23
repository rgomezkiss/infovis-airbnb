---
title: Datos
toc: false
---

# Datos

Aquí puedes explorar estadísticas generales de Airbnb en Capital Federal. Utiliza los filtros para profundizar en diferentes aspectos de los alojamientos.

```js
const data = await FileAttachment('./data/listings.csv').csv({typed: true});
const neighborhoods = await FileAttachment('./data/neighborhoods.csv').csv({ typed: true })
const geoNeighborhoods = await FileAttachment('./data/neighbourhoods_geo.json').json()
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
**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
