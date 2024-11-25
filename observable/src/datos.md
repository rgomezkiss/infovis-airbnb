---
title: Datos
toc: false
---

```js
const data = await FileAttachment('./data/listings.csv').csv({typed: true});
const listings_filtrado = await FileAttachment('./data/listings_filtrado.csv').csv({typed: true});
const neighborhoods = await FileAttachment('./data/neighborhoods.csv').csv({ typed: true })

const WIDHT = 800
const boxplot = await FileAttachment('./data/boxplot.png').image({width: WIDHT});
const boxplot_removed = await FileAttachment('./data/boxplot_removed.png').image({width: WIDHT});
```

## Datos

Se utilizaron principalmente dos datasets:

- neighborhoods.csv (${neighborhoods.length} datos)
- listings.csv y listings_detailed.csv (${data.length} datos)
  
`neighborhoods.csv` solo contiene los nombres de los distintos barrios de CABA. Mientras que `listings.csv` cuenta con los siguientes datos:

- **id**: Identificador único de la propiedad en Airbnb.
- **name**: Nombre de la propiedad.
- **host_id**: Identificador único del anfitrión.
- **host_name**: Nombre del anfitrión.
- **neighbourhood_group**: Grupo de barrios o área principal de la ciudad donde se encuentra la propiedad.
- **neighbourhood**: Barrio específico donde está ubicada la propiedad.
- **latitude**: Latitud de la ubicación de la propiedad (coordenada geográfica).
- **longitude**: Longitud de la ubicación de la propiedad (coordenada geográfica).
- **room_type**: Tipo de habitación ofrecida (entera, compartida, etc.).
- **price**: Precio por noche de la propiedad en la moneda local.
- **minimum_nights**: Número mínimo de noches que se puede reservar la propiedad.
- **number_of_reviews**: Total de reseñas que la propiedad ha recibido.
- **last_review**: Fecha de la última reseña recibida.
- **reviews_per_month**: Promedio de reseñas por mes.
- **calculated_host_listings_count**: Cantidad de propiedades que el anfitrión tiene listadas en Airbnb.
- **availability_365**: Días de disponibilidad de la propiedad durante el año.
- **number_of_reviews_ltm**: Número de reseñas en los últimos 12 meses.
- **license**: Número de licencia de la propiedad (si aplica).

Por otro lado, `listings_detailed.csv` cuenta con los siguientes valores adicionales:

- **amenities**: Comodidades de la propiedad (ej. Wi-Fi, aire acondicionado).
- **hostResponseRate**: Tasa de respuesta del anfitrión.
- **hostResponseTime**: Tiempo de respuesta del anfitrión.
- **hostIsSuperhost**: Indica si el anfitrión es Superhost.
- **rating**: Valoración general de la propiedad.
- **accuracyRating**: Valoración de la precisión de la descripción de la propiedad.
- **cleanlinessRating**: Valoración de la limpieza de la propiedad.
- **checkinRating**: Valoración del proceso de check-in.
- **communicationRating**: Valoración de la comunicación con el anfitrión.
- **locationRating**: Valoración de la ubicación de la propiedad.
- **valueRating**: Valoración de la relación calidad-precio.
- **hostSince**: Fecha en que el anfitrión empezó a listar propiedades.

Verificamos que no existan filas duplicadas en `listings.csv` y removimos los outliers de precios que empeoraban la visualización, basandonos en el Rango Intercuartílico (IQR), (quedandonos con ${listings_filtrado.length} datos).

```js
boxplot
```

```js
boxplot_removed
```

---
**Fuente de Datos:** [Inside Airbnb](https://insideairbnb.com/get-the-data/)
