import math
from typing import Tuple

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)

def estimate_travel_time_mins(lat1: float, lon1: float, lat2: float, lon2: float, mode: str = "auto_rickshaw") -> Tuple[float, int]:
    """
    Estimate distance (km) and travel time in minutes accounting for city traffic and routing buffer.
    Modes: walking (4 km/h), auto_rickshaw (18 km/h city avg + 3 min buffer), cab (22 km/h + 5 min buffer).
    """
    distance_km = haversine_distance_km(lat1, lon1, lat2, lon2)
    
    # Road curvature factor in Indian heritage cities like Jaipur is approx 1.3x Euclidean distance
    actual_road_km = distance_km * 1.3
    
    if mode == "walking":
        speed_kmh = 4.0
        time_mins = (actual_road_km / speed_kmh) * 60.0
    elif mode == "auto_rickshaw":
        speed_kmh = 18.0
        time_mins = ((actual_road_km / speed_kmh) * 60.0) + 3.0
    else:  # cab
        speed_kmh = 22.0
        time_mins = ((actual_road_km / speed_kmh) * 60.0) + 5.0
        
    estimated_mins = max(5, int(round(time_mins)))
    return distance_km, estimated_mins
