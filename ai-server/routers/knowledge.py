from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
import os

from services.rag_service import rag_service

router = APIRouter()

class KnowledgeDocument(BaseModel):
    content: str
    category: str = "general"
    place_name: Optional[str] = None
    language: str = "en"
    source: Optional[str] = None

class IngestRequest(BaseModel):
    documents: List[KnowledgeDocument]
    api_key: str = ""

@router.post("/ingest-data")
async def ingest_data(request: IngestRequest):
    # Simple API key check
    expected_key = os.getenv("ADMIN_API_KEY", "shangla_admin_2024")
    if request.api_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    docs = [doc.dict() for doc in request.documents]
    count = rag_service.ingest_documents(docs)

    return {
        "success": True,
        "message": f"Successfully ingested {count} document chunks",
        "chunks_created": count
    }

@router.post("/ingest-from-files")
async def ingest_from_files(api_key: str = ""):
    expected_key = os.getenv("ADMIN_API_KEY", "shangla_admin_2024")
    if api_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    count = rag_service.ingest_from_files()
    return {
        "success": True,
        "message": f"Ingested {count} chunks from files",
        "chunks_created": count
    }

@router.get("/knowledge/stats")
async def get_stats():
    is_ready = rag_service.is_ready
    return {
        "knowledge_base_ready": is_ready,
        "embedding_model": os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
        "llm_available": __import__("services.llm_service", fromlist=["llm_service"]).llm_service.is_available,
        "status": "ready" if is_ready else "empty — run /ai/ingest-data"
    }

@router.post("/seed-knowledge")
async def seed_default_knowledge(api_key: str = ""):
    """Seed the knowledge base with built-in Shangla data"""
    expected_key = os.getenv("ADMIN_API_KEY", "shangla_admin_2024")
    if api_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    default_knowledge = _get_default_shangla_knowledge()
    count = rag_service.ingest_documents(default_knowledge)

    return {
        "success": True,
        "message": f"Seeded knowledge base with {count} Shangla document chunks",
        "chunks_created": count
    }

def _get_default_shangla_knowledge() -> List[dict]:
    return [
        {
            "content": """Shangla is a district in Khyber Pakhtunkhwa (KPK) province of Pakistan. 
            It was carved out of Swat district in 1994. The district headquarters is Alpuri. 
            Shangla is known for its stunning natural beauty, mountains, valleys, and streams.
            The district covers an area of approximately 1,586 square kilometers.
            Population is approximately 700,000 people mostly Pashtuns speaking Pashto.
            The district is located between Swat, Kohistan, Batagram, and Buner districts.
            Major towns include Alpuri, Martung, Chakesar, Lilownai, Puran, and Bisham.""",
            "category": "general",
            "place_name": "Shangla District",
            "language": "en",
            "source": "district_overview"
        },
        {
            "content": """Shangla Top is the highest and most famous tourist destination in Shangla district.
            Located at approximately 2,800 meters (9,186 feet) above sea level.
            It is situated on the Shangla Pass which connects Swat valley with the Indus River valley.
            The pass offers breathtaking panoramic views of surrounding mountains and valleys.
            From Shangla Top you can see Swat valley on one side and Indus River on the other.
            The road to Shangla Top is accessible year-round but challenging in winter due to snow.
            Best time to visit: May to October for clear skies and pleasant weather.
            December to February: Heavy snowfall, beautiful but roads may be blocked.
            The area has a check post where security personnel are stationed.
            Parking is available near the top. Local food stalls and shops are present.
            Mobile network: Jazz and Zong work best. PTCL Evo available.
            Entry: Free. No entry ticket required.
            From Islamabad: 280 km, approximately 6-7 hours by road via Besham.
            From Peshawar: 220 km, approximately 5-6 hours.
            From Mingora (Swat): 80 km, approximately 2 hours.""",
            "category": "places",
            "place_name": "Shangla Top",
            "language": "en",
            "source": "place_details"
        },
        {
            "content": """Achar Top is one of the most beautiful and scenic viewpoints in Shangla.
            Located at approximately 300 meters above Shangla Top, making it even higher and more scenic.
            It is accessible via a link road that starts from the Shangla Top check post.
            The drive from Shangla Top check post to Achar Top takes approximately 45 minutes.
            The distance from Shangla Top to Achar Top is approximately 15 kilometers.
            Achar Top offers unobstructed 360-degree panoramic views.
            On clear days you can see multiple mountain ranges simultaneously.
            The road to Achar Top is a narrow link road, suitable for smaller vehicles.
            4x4 vehicles recommended especially in wet or winter conditions.
            The area is less crowded than Shangla Top making it ideal for photography.
            Best for: Photography, Camping, Hiking, Scenic views.
            Facilities: Limited. Carry food and water. No permanent shops.
            Mobile signal: Very weak or unavailable at the top.""",
            "category": "places",
            "place_name": "Achar Top",
            "language": "en",
            "source": "place_details"
        },
        {
            "content": """Alpuri is the district headquarters of Shangla.
            It is located in the main valley and serves as the administrative and commercial center.
            The city has basic facilities including hospitals, banks, markets, and government offices.
            Alpuri is a starting point for visiting various parts of Shangla district.
            DHQ (District Headquarters Hospital) Alpuri provides medical services.
            Banks available: HBL, NBP, Bank Al-Habib with ATM facilities.
            From Alpuri to Shangla Top: approximately 45 minutes by road.
            The city has a bazaar with local products, food, and daily necessities.
            Several guest houses and small hotels are available in Alpuri.
            Average guest house price: Rs. 1,500 to 3,000 per night.""",
            "category": "places",
            "place_name": "Alpuri",
            "language": "en",
            "source": "place_details"
        },
        {
            "content": """Shangla climate and weather information:
            Spring (March-May): Temperature 10-20°C. Beautiful flowers bloom. Moderate rainfall.
            Summer (June-September): Temperature 15-28°C. Peak tourist season. Lush green valleys.
            Monsoon (July-August): Heavy rainfall possible. Risk of landslides on mountain roads.
            Autumn (October-November): Temperature 5-15°C. Golden colors. Clear skies.
            Winter (December-February): Temperature -5°C to 5°C at higher altitudes.
            Snowfall: Heavy snowfall at Shangla Top and Achar Top (above 2000m) from December to February.
            Best time to visit overall: May to September.
            Best for snow: December to February (but roads may be blocked).
            Avoid: Heavy monsoon period late July to mid-August (landslide risk).
            Shangla Top gets extremely cold at night even in summer. Always carry warm clothes.
            Rain can occur any time. Waterproof jacket recommended.""",
            "category": "general",
            "place_name": "Shangla",
            "language": "en",
            "source": "weather_guide"
        },
        {
            "content": """How to reach Shangla - Route Guide:
            
            FROM ISLAMABAD (Recommended Route):
            M1 Motorway → Swabi Interchange → Mardan → Malakand Pass → Chakdara → Dir Road →
            Turn right at Thana → Khwazakhela → Madyan Road → Besham → Shangla Top Road.
            Total distance: approximately 280 km. Time: 6-7 hours.
            Alternative: M1 → Havelian → Abbottabad → Besham → Shangla.
            
            FROM PESHAWAR:
            GT Road → Mardan → Malakand → Chakdara → Khwazakhela → Besham → Shangla.
            Distance: 220 km. Time: 5-6 hours.
            
            FROM SWAT (Mingora):
            Mingora → Khwazakhela → Chakdara → Shangla junction → Shangla Top.
            Distance: 80 km. Time: 2 hours.
            
            FROM LAHORE:
            M2 → Islamabad → Follow Islamabad route.
            Total: 450 km. Time: 10-11 hours.
            
            KEY STAY POINTS ON ROUTE:
            Besham: Good hotels and restaurants. Fuel available.
            Alpuri: District headquarters. All facilities available.
            Martung: Small town with basic facilities.
            
            TRANSPORT OPTIONS:
            Own car: Most convenient. 4x4 recommended for winter/rainy season.
            Public transport: Buses and minibuses from Peshawar and Mingora to Alpuri.
            Coaster/wagon: Available from Besham to Alpuri.
            No direct service from Islamabad to Shangla Top.""",
            "category": "routes",
            "place_name": "Shangla",
            "language": "en",
            "source": "route_guide"
        },
        {
            "content": """Accommodation in Shangla - Complete Guide:
            
            SHANGLA TOP AREA:
            - PTDC Rest House: Government facility. Book in advance. Rs 2,000-4,000/night.
            - Local Guest Houses: Multiple options. Rs 1,500-2,500/night. Basic facilities.
            - Camping: Allowed near the top. Bring own tent. Extremely cold at night.
            
            ALPURI (District HQ):
            - Hotel Shangla Star: Rs 2,500-4,000/night. Better facilities.
            - Hotel Green Valley: Rs 1,500-2,500/night.
            - Multiple small guest houses: Rs 800-1,500/night.
            
            BESHAM (Entry Point):
            - PTDC Motel Besham: Good quality. Rs 3,000-5,000/night. Book in advance.
            - Hotel Indus: Rs 2,000-3,500/night.
            - Several budget options: Rs 1,000-2,000/night.
            
            TIPS:
            Book in advance during peak season (June-August).
            Always negotiate prices especially for longer stays.
            Homestay options available in villages. Ask locals.
            Camping is the cheapest option but requires equipment.
            Group discounts available at most guest houses.""",
            "category": "accommodation",
            "place_name": "Shangla",
            "language": "en",
            "source": "accommodation_guide"
        },
        {
            "content": """Food and Cuisine in Shangla:
            
            LOCAL SPECIALTIES:
            - Chapli Kebab: Famous Pashtun dish. Must try!
            - Karahi: Meat cooked in wok. Excellent in local restaurants.
            - Corn bread (Makki ki Roti): Local staple with butter.
            - Trout fish: Fresh from mountain streams. Available in season.
            - Namkeen Chai (Salt tea): Traditional Pashtun pink tea.
            - Charsi Tikka: A spicy meat preparation unique to the region.
            
            WHERE TO EAT:
            - Local dhabas: Most authentic and affordable. Rs 200-500 per meal.
            - Alpuri main bazaar: Several restaurants available.
            - Besham: Multiple restaurants including proper hotels.
            - Shangla Top: Small food stalls with basic items.
            
            AVERAGE COSTS:
            - Breakfast: Rs 150-300 per person.
            - Lunch: Rs 250-500 per person.
            - Dinner: Rs 300-600 per person.
            - Tea/snacks: Rs 50-150.
            
            TIPS:
            Try local food - it's excellent and very affordable.
            Carry snacks if going to remote areas like Achar Top.
            Water bottles available everywhere. Carry extra for treks.
            Ramadan hours: Restaurants may be closed during day in Ramadan.""",
            "category": "food",
            "place_name": "Shangla",
            "language": "en",
            "source": "food_guide"
        },
        {
            "content": """Safety and Travel Tips for Shangla:
            
            ROAD SAFETY:
            Mountain roads are narrow and winding. Drive carefully.
            Speed limit on mountain roads: 30-40 km/h maximum.
            Avoid driving at night especially on mountain sections.
            Landslide risk during monsoon (July-August). Check alerts before travel.
            Carry mobile charger and power bank - signal is intermittent.
            
            HEALTH AND EMERGENCY:
            DHQ Hospital Alpuri: Main medical facility. Tel: Available locally.
            Rescue 1122: Emergency rescue service available in KPK.
            Police emergency: 15.
            Carry basic first aid kit.
            Altitude sickness possible above 2500m. Acclimatize gradually.
            
            CULTURAL TIPS:
            Shangla is conservative area. Dress modestly.
            Women should cover head and wear modest clothing.
            Ask permission before photographing local people especially women.
            Respect local customs and religious practices.
            Greet locals with "As-salamu alaykum" - very well received.
            
            NETWORK AND COMMUNICATION:
            Jazz and Telenor have best coverage in most areas.
            Shangla Top and higher areas: Weak signal or no signal.
            Download offline maps before departing.
            Share itinerary with someone before going to remote areas.
            
            BEST PRACTICES:
            Start early morning for mountain trips.
            Carry warm clothes even in summer for high altitude areas.
            Carry cash - limited ATM access in remote areas.
            ATMs available in Alpuri and Besham.
            Fuel up in Besham before heading into Shangla.""",
            "category": "safety",
            "place_name": "Shangla",
            "language": "en",
            "source": "safety_guide"
        },
        {
            "content": """Shahpur Valley is a beautiful valley in Shangla district.
            It is known for its lush green scenery, streams, and peaceful environment.
            The valley offers excellent opportunities for trekking, photography, and nature walks.
            Local villages in the valley maintain traditional Pashtun culture and lifestyle.
            Best time to visit: April to October.
            Access: Via road from Alpuri. Approximately 1 hour from Alpuri.
            Facilities: Basic. Local homestays available. Carry food and water.
            
            Chakesar Valley is another scenic valley in Shangla.
            It is known for its agricultural terraces and mountain views.
            The valley has a distinct culture and local crafts.
            Access road is from main Shangla road. About 45 minutes from Alpuri.
            
            Puran Valley is located in the eastern part of Shangla.
            It has beautiful scenery and connects to Kohistan district.
            Less tourist traffic meaning more authentic experience.
            Waterfalls present during spring and monsoon season.
            
            Lilownai is a scenic area known for its natural beauty.
            Popular for picnics and family trips from Alpuri.""",
            "category": "places",
            "place_name": "Shangla Valleys",
            "language": "en",
            "source": "valleys_guide"
        },
        # Urdu knowledge
        {
            "content": """شانگلہ ضلع خیبرپختونخوا، پاکستان میں واقع ہے۔ 
            اس کا ضلعی صدر مقام الپوری ہے۔
            شانگلہ اپنے قدرتی حسن، پہاڑوں، وادیوں اور ندیوں کی وجہ سے مشہور ہے۔
            ضلع 1986 میں سوات سے الگ کیا گیا۔
            آبادی تقریباً 7 لاکھ ہے جن میں زیادہ تر پشتون ہیں۔
            
            شانگلہ ٹاپ سب سے مشہور سیاحتی مقام ہے جو 2800 میٹر کی بلندی پر ہے۔
            اچار ٹاپ شانگلہ ٹاپ سے 300 میٹر اونچا ہے اور لنک روڈ سے پہنچا جاتا ہے۔
            یہاں سے پہنچنے میں شانگلہ ٹاپ چیک پوسٹ سے تقریباً 45 منٹ لگتے ہیں۔
            
            موسم: گرمیوں میں 15-28 ڈگری، سردیوں میں منفی 5 سے 5 ڈگری۔
            بہترین وقت: مئی سے ستمبر۔
            
            اسلام آباد سے فاصلہ: 280 کلومیٹر، 6-7 گھنٹے۔
            پشاور سے فاصلہ: 220 کلومیٹر، 5-6 گھنٹے۔""",
            "category": "general",
            "place_name": "شانگلہ",
            "language": "ur",
            "source": "district_overview_ur"
        },
    ]