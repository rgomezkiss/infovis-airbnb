import pandas as pd
import os
from datetime import datetime

LISTINGS_INPUT_PATH = "./data/listings.csv"  # Archivo de entrada para precios y bookings
DETAILED_INPUT_PATH = "./data/listings_detailed.csv"  # Archivo de entrada para ratings, host_since y amenities
OUTPUT_DIR = "./output"  # Carpeta para guardar los resultados

os.makedirs(OUTPUT_DIR, exist_ok=True)

def analizar_precios_y_bookings(df):
    """
    Analiza el precio promedio y la cantidad de bookings por vecindario.
    """
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['number_of_reviews'] = pd.to_numeric(df['number_of_reviews'], errors='coerce')

    price_and_bookings = df.groupby("neighbourhood").agg(
        average_price=("price", "mean"),
        total_bookings=("number_of_reviews", "sum")
    ).reset_index()

    price_and_bookings["average_price"] = price_and_bookings["average_price"].round(2)

    price_and_bookings.to_csv(f"{OUTPUT_DIR}/average_price_and_bookings_by_neighbourhood.csv", index=False)
    print("Archivo creado: average_price_and_bookings_by_neighbourhood.csv")

def analizar_host_listings_count(df):
    """
    Calcula el máximo y promedio de calculated_host_listings_count por vecindario.
    """
    df['calculated_host_listings_count'] = pd.to_numeric(df['calculated_host_listings_count'], errors='coerce')

    host_listings_count = df.groupby("neighbourhood").agg(
        average_listings_count=("calculated_host_listings_count", "mean"),
        max_listings_count=("calculated_host_listings_count", "max")
    ).reset_index()

    host_listings_count["average_listings_count"] = host_listings_count["average_listings_count"].round(2)

    host_listings_count.to_csv(f"{OUTPUT_DIR}/host_listings_count_by_neighbourhood.csv", index=False)
    print("Archivo creado: host_listings_count_by_neighbourhood.csv")

def calcular_promedio_ratings(df):
    """
    Calcula el promedio de review_scores_rating por vecindario.
    """
    ratings = df.groupby("neighbourhood_cleansed")["review_scores_rating"].mean().reset_index()
    ratings.columns = ["neighbourhood", "average_rating"]
    ratings.to_csv(f"{OUTPUT_DIR}/average_ratings_by_neighbourhood.csv", index=False)
    print("Archivo creado: average_ratings_by_neighbourhood.csv")

def calcular_tiempo_como_host(df):
    """
    Calcula el tiempo promedio como host (en días), el anfitrión más nuevo y el más antiguo por vecindario.
    """
    df["host_since"] = pd.to_datetime(df["host_since"], errors="coerce")
    df["days_as_host"] = (datetime.now() - df["host_since"]).dt.days

    host_time = df.groupby("neighbourhood_cleansed").agg(
        average_days_as_host=("days_as_host", "mean"),
        newest_host=("host_since", "max"),
        oldest_host=("host_since", "min")
    ).reset_index()

    host_time["average_days_as_host"] = host_time["average_days_as_host"].round(2)
    host_time["newest_host"] = host_time["newest_host"].dt.strftime('%Y-%m-%d')
    host_time["oldest_host"] = host_time["oldest_host"].dt.strftime('%Y-%m-%d')

    host_time.to_csv(f"{OUTPUT_DIR}/host_time_by_neighbourhood.csv", index=False)
    print("Archivo creado: host_time_by_neighbourhood.csv")

def extraer_amenities_por_neighbourhood(df):
    """
    Extrae todas las amenities disponibles por vecindario.
    """
    df["amenities_list"] = df["amenities"].apply(lambda x: eval(x) if isinstance(x, str) else [])
    
    amenities = df.groupby("neighbourhood_cleansed")["amenities_list"].apply(
        lambda x: set(item for sublist in x for item in sublist)
    ).reset_index()
    amenities.columns = ["neighbourhood", "unique_amenities"]

    amenities.to_csv(f"{OUTPUT_DIR}/amenities_by_neighbourhood.csv", index=False)
    print("Archivo creado: amenities_by_neighbourhood.csv")

def analizar_host_location(df):
    """
    Analiza las ubicaciones de los anfitriones y genera un gráfico de torta.
    """
    host_locations = df['host_location'].dropna().value_counts().reset_index()
    host_locations.columns = ['host_location', 'count']

    host_locations.to_csv(f"{OUTPUT_DIR}/host_location_counts.csv", index=False)
    print("Archivo creado: host_location_counts.csv")

def main():
    print("Cargando datos de listings_vis.csv...")
    df_vis = pd.read_csv(LISTINGS_INPUT_PATH)
    
    analizar_precios_y_bookings(df_vis)
    analizar_host_listings_count(df_vis)

    print("Cargando datos de listings_detailed.csv...")
    df_detailed = pd.read_csv(DETAILED_INPUT_PATH)

    calcular_promedio_ratings(df_detailed)
    calcular_tiempo_como_host(df_detailed)
    extraer_amenities_por_neighbourhood(df_detailed)
    analizar_host_location(df_detailed)

if __name__ == "__main__":
    main()
