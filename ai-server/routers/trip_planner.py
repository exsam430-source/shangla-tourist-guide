from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import json

from services.llm_service import llm_service

router = APIRouter()
NODE_BACKEND = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

class StartLocation(BaseModel):
    city: str = "Islamabad"
    lat: Optional[float] = None
    lng: Optional[float] = None

class TripRequest(BaseModel):
    budget: float
    duration_days: int
    group_size: int = 1
    interests: List[str] = []
    transport_type: str = "own_car"
    stay_preference: str = "any"
    start_location: Optional[StartLocation] = None
    start_date: Optional[str] = None
    environment_type: List[str] = []

@router.post("/plan-trip")
async def plan_trip(request: TripRequest):
    if request.budget < 1000:
        raise HTTPException(status_code=400, detail="Minimum budget is Rs. 1000")
    if request.duration_days < 1 or request.duration_days > 14:
        raise HTTPException(status_code=400, detail="Duration must be between 1-14 days")

    # Fetch available places from backend
    available_places = await _get_places(request.interests)

    # Generate trip plan
    trip_plan = await _generate_trip_plan(request, available_places)

    return {
        "title": f"{request.duration_days}-Day Shangla Adventure",
        "plan": trip_plan,
        "generated_at": __import__("datetime").datetime.now().isoformat()
    }

async def _get_places(interests: List[str]) -> List[dict]:
    try:
        params = {"limit": 50, "sort": "-averageRating"}
        if interests:
            # Map interests to categories
            category_map = {
                "mountains": "mountain", "viewpoints": "viewpoint",
                "waterfalls": "waterfall", "forests": "forest",
                "villages": "village", "adventure": "adventure",
                "camping": "camping", "historical": "historical",
            }
            categories = []
            for interest in interests:
                for key, cat in category_map.items():
                    if key.lower() in interest.lower():
                        categories.append(cat)
            if categories:
                params["category"] = ",".join(set(categories))

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{NODE_BACKEND}/api/places", params=params)
            if response.status_code == 200:
                return response.json().get("data", [])
    except Exception as e:
        print(f"Error fetching places: {e}")
    return _get_default_places()

def _get_default_places() -> List[dict]:
    return [
        {"nameEn": "Shangla Top", "slug": "shangla-top", "category": ["viewpoint", "mountain"],
         "estimatedVisitTime": "2-3 hours", "coordinates": {"lat": 34.87, "lng": 72.60}},
        {"nameEn": "Achar Top", "slug": "achar-top", "category": ["viewpoint", "mountain"],
         "estimatedVisitTime": "2 hours", "coordinates": {"lat": 34.90, "lng": 72.62}},
        {"nameEn": "Shahpur Valley", "slug": "shahpur-valley", "category": ["valley", "scenic"],
         "estimatedVisitTime": "3-4 hours", "coordinates": {"lat": 34.75, "lng": 72.55}},
        {"nameEn": "Chakesar Valley", "slug": "chakesar-valley", "category": ["valley"],
         "estimatedVisitTime": "Half day", "coordinates": {"lat": 34.80, "lng": 72.50}},
        {"nameEn": "Alpuri", "slug": "alpuri", "category": ["village", "cultural"],
         "estimatedVisitTime": "2 hours", "coordinates": {"lat": 34.83, "lng": 72.58}},
    ]

async def _generate_trip_plan(request: TripRequest, places: List[dict]) -> dict:
    start_city = request.start_location.city if request.start_location else "Islamabad"
    budget_per_day = request.budget / request.duration_days
    group = request.group_size

    # Cost estimates
    transport_costs = {
        "own_car": {"daily": 800 * group, "desc": "Fuel + tolls"},
        "public": {"daily": 300 * group, "desc": "Bus/van tickets"},
        "rental": {"daily": 3000, "desc": "Vehicle rental"},
        "mixed": {"daily": 500 * group, "desc": "Mixed transport"},
    }
    stay_costs = {
        "hotel": 3000 * group, "guesthouse": 1500 * group,
        "camping": 300 * group, "homestay": 800 * group, "any": 1000 * group,
    }
    food_cost_per_day = 600 * group

    transport_daily = transport_costs.get(request.transport_type, transport_costs["own_car"])["daily"]
    stay_daily = stay_costs.get(request.stay_preference, stay_costs["any"])

    # Build day-by-day plan
    days = []
    places_used = []
    total_transport = 0
    total_food = 0
    total_stay = 0
    total_activities = 0

    # Day 1: Travel + First destination
    day1_activities = [
        {
            "time": "07:00",
            "activity": f"Depart from {start_city}",
            "type": "travel",
            "cost": int(transport_daily * 0.5),
            "notes": f"Start early to avoid traffic"
        },
        {
            "time": "12:00",
            "activity": "Lunch stop at Besham",
            "type": "food",
            "cost": int(food_cost_per_day * 0.3)
        },
    ]

    if places:
        first_place = places[0]
        day1_activities.append({
            "time": "15:00",
            "activity": f"Arrive & explore {first_place['nameEn']}",
            "type": "visit",
            "cost": 0,
            "place_name": first_place["nameEn"]
        })
        places_used.append(first_place.get("slug", ""))

    day1_activities.append({
        "time": "18:30",
        "activity": f"Check-in at {request.stay_preference} accommodation",
        "type": "stay",
        "cost": stay_daily
    })
    day1_activities.append({
        "time": "19:30",
        "activity": "Dinner at local restaurant",
        "type": "food",
        "cost": int(food_cost_per_day * 0.4)
    })

    day1_cost = sum(a["cost"] for a in day1_activities)
    days.append({
        "dayNumber": 1,
        "title": f"Day 1 — Journey from {start_city} to Shangla",
        "activities": day1_activities,
        "totalCost": day1_cost,
        "stayPlace": "Guest House / Hotel",
        "stayCost": stay_daily
    })
    total_transport += int(transport_daily * 0.5)
    total_food += int(food_cost_per_day * 0.7)
    total_stay += stay_daily

    # Middle days
    place_idx = 1
    for day_num in range(2, request.duration_days):
        day_activities = [
            {
                "time": "07:00",
                "activity": "Sunrise viewing & breakfast",
                "type": "food",
                "cost": int(food_cost_per_day * 0.2)
            }
        ]

        # Add 2-3 places per day
        for _ in range(min(2, len(places) - place_idx)):
            if place_idx < len(places):
                place = places[place_idx]
                day_activities.append({
                    "time": f"0{8 + (_ * 3)}:00",
                    "activity": f"Visit {place['nameEn']}",
                    "type": "visit",
                    "cost": 0,
                    "place_name": place["nameEn"],
                    "duration": place.get("estimatedVisitTime", "2 hours")
                })
                places_used.append(place.get("slug", ""))
                place_idx += 1

        day_activities.extend([
            {
                "time": "13:00",
                "activity": "Lunch at local dhaba",
                "type": "food",
                "cost": int(food_cost_per_day * 0.35)
            },
            {
                "time": "17:00",
                "activity": "Evening at leisure / local market visit",
                "type": "activity",
                "cost": 200 * group
            },
            {
                "time": "19:00",
                "activity": "Dinner",
                "type": "food",
                "cost": int(food_cost_per_day * 0.45)
            },
            {
                "time": "20:30",
                "activity": "Rest at accommodation",
                "type": "stay",
                "cost": stay_daily
            }
        ])

        day_cost = sum(a["cost"] for a in day_activities)
        days.append({
            "dayNumber": day_num,
            "title": f"Day {day_num} — Exploring Shangla",
            "activities": day_activities,
            "totalCost": day_cost,
            "stayCost": stay_daily
        })
        total_food += int(food_cost_per_day)
        total_stay += stay_daily
        total_transport += int(transport_daily * 0.3)
        total_activities += 200 * group

    # Last day: Return journey
    if request.duration_days > 1:
        last_day_activities = [
            {"time": "07:00", "activity": "Early breakfast & checkout", "type": "food", "cost": int(food_cost_per_day * 0.25)},
            {"time": "08:00", "activity": "Last look at Shangla Top (optional)", "type": "visit", "cost": 0},
            {"time": "09:00", "activity": f"Begin return journey to {start_city}", "type": "travel", "cost": int(transport_daily * 0.5)},
            {"time": "13:00", "activity": "Lunch on the way", "type": "food", "cost": int(food_cost_per_day * 0.3)},
            {"time": "17:00", "activity": f"Arrive back in {start_city}", "type": "travel", "cost": 0},
        ]
        last_day_cost = sum(a["cost"] for a in last_day_activities)
        days.append({
            "dayNumber": request.duration_days,
            "title": f"Day {request.duration_days} — Return Journey",
            "activities": last_day_activities,
            "totalCost": last_day_cost
        })
        total_transport += int(transport_daily * 0.5)
        total_food += int(food_cost_per_day * 0.55)

    total_misc = int(request.budget * 0.05)
    grand_total = total_transport + total_food + total_stay + total_activities + total_misc

    # Check if within budget
    within_budget = grand_total <= request.budget
    budget_note = (
        f"✅ Within your budget of Rs. {int(request.budget):,}!"
        if within_budget
        else f"⚠️ Estimated cost (Rs. {grand_total:,}) slightly exceeds budget (Rs. {int(request.budget):,}). Consider reducing stay duration or choosing budget accommodation."
    )

    return {
        "days": days,
        "totalEstimatedCost": {
            "transport": total_transport,
            "food": total_food,
            "stay": total_stay,
            "activities": total_activities,
            "misc": total_misc,
            "total": grand_total
        },
        "placesIncluded": list(set(places_used)),
        "aiNotes": f"{budget_note}\n\nGroup of {group} | {request.duration_days} days | {request.transport_type.replace('_', ' ').title()} transport | {request.stay_preference.title()} accommodation.",
        "isWithinBudget": within_budget
    }