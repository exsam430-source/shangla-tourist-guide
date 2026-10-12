import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

SYSTEM_PROMPT_EN = """You are "Sher Khan", an expert AI tourism guide for Shangla district, KPK, Pakistan.
You know EVERYTHING about Shangla - every tourist place, route, distance, altitude, facility, local tip, and cultural detail.

RULES:
1. Answer ONLY based on the provided context about Shangla
2. If information is not in context, use your general knowledge about Shangla but mention it
3. Be friendly, enthusiastic, and helpful like a knowledgeable local guide
4. Always use relevant emojis to make responses engaging
5. Provide specific details: distances, altitudes, travel times, costs when available
6. If asked about routes, mention stay points and key landmarks
7. Keep responses concise but informative (2-4 paragraphs max)
8. If user asks in Urdu or about Urdu, respond in Urdu

You represent Shangla Tourism. Be proud of Shangla's beauty!"""

SYSTEM_PROMPT_UR = """آپ "شیر خان" ہیں، شانگلہ ضلع، خیبرپختونخوا، پاکستان کے ماہر AI سیاحتی گائیڈ ہیں۔

اہم ہدایات:
1. فراہم کردہ context کی بنیاد پر جواب دیں
2. دوستانہ اور مددگار انداز میں اردو میں جواب دیں
3. مناسب emoji استعمال کریں
4. مخصوص تفصیلات جیسے فاصلہ، بلندی، وقت اور قیمت بتائیں
5. شانگلہ کی خوبصورتی اور سیاحت کو فروغ دیں"""


class LLMService:
    def __init__(self):
        self.groq_client = None
        self.openai_client = None
        self.is_available = False
        self.provider = None
        self._initialize()

    def _initialize(self):
        # Try Groq first (free)
        if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=GROQ_API_KEY)
                self.is_available = True
                self.provider = "groq"
                print("✅ Groq LLM Service initialized (Free & Fast!)")
                return
            except ImportError:
                print("Groq package not installed. Run: pip install groq")
            except Exception as e:
                print(f"Groq init error: {e}")

        # Try OpenAI as fallback
        if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
                self.is_available = True
                self.provider = "openai"
                print("✅ OpenAI LLM Service initialized")
                return
            except ImportError:
                print("OpenAI package not installed")
            except Exception as e:
                print(f"OpenAI init error: {e}")

        print("⚠️  No LLM API key configured — using built-in fallback responses")
        print("   Get FREE Groq API key at: https://console.groq.com")

    def generate_response(
        self,
        user_message: str,
        context: List[str],
        language: str = "en",
        conversation_history: List[dict] = None
    ) -> str:

        if self.provider == "groq" and self.groq_client:
            return self._groq_response(user_message, context, language, conversation_history)
        elif self.provider == "openai" and self.openai_client:
            return self._openai_response(user_message, context, language, conversation_history)
        else:
            return self._fallback_response(user_message, context, language)

    def _build_messages(self, user_message: str, context: List[str], language: str, history: List[dict]) -> List[dict]:
        system_prompt = SYSTEM_PROMPT_UR if language == "ur" else SYSTEM_PROMPT_EN

        context_text = "\n\n---\n\n".join(context) if context else "No specific context retrieved."

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "system",
                "content": f"SHANGLA KNOWLEDGE BASE CONTEXT:\n{context_text}"
            }
        ]

        # Add last 6 conversation messages
        if history:
            for msg in history[-6:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })

        messages.append({"role": "user", "content": user_message})
        return messages

    def _groq_response(self, user_message: str, context: List[str], language: str, history: List[dict]) -> str:
        try:
            messages = self._build_messages(user_message, context, language, history)

            response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Free, very fast model
                messages=messages,
                max_tokens=700,
                temperature=0.7,
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Groq error: {e}")
            # Try fallback Groq model
            try:
                messages = self._build_messages(user_message, context, language, history)
                response = self.groq_client.chat.completions.create(
                    model="gemma2-9b-it",  # Alternative free model
                    messages=messages,
                    max_tokens=700,
                    temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception as e2:
                print(f"Groq fallback error: {e2}")
                return self._fallback_response(user_message, context, language)

    def _openai_response(self, user_message: str, context: List[str], language: str, history: List[dict]) -> str:
        try:
            messages = self._build_messages(user_message, context, language, history)

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=700,
                temperature=0.7,
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"OpenAI error: {e}")
            return self._fallback_response(user_message, context, language)

    def _fallback_response(self, message: str, context: List[str], language: str) -> str:
        """Rich built-in responses for common queries — works without any API"""
        msg_lower = message.lower()

        # If we have context from knowledge base, use it
        if context:
            context_summary = context[0][:600] if context[0] else ""
            if context_summary:
                if language == "ur":
                    return f"📚 شانگلہ کے بارے میں معلومات:\n\n{context_summary}\n\n*(مزید تفصیلی جوابات کے لیے Groq API key شامل کریں - مفت ہے! console.groq.com)*"
                return f"📚 Based on Shangla knowledge base:\n\n{context_summary}\n\n*(Add free Groq API key at console.groq.com for better AI responses)*"

        # Urdu responses
        if language == "ur":
            return self._urdu_fallback(msg_lower, message)

        # English responses
        return self._english_fallback(msg_lower)

    def _urdu_fallback(self, msg_lower: str, original: str) -> str:
        if any(w in msg_lower or w in original for w in ["top places", "best places", "اہم مقامات", "بہترین"]):
            return """🏔️ **شانگلہ کے اہم سیاحتی مقامات:**

1. **شانگلہ ٹاپ** - 2800 میٹر بلندی پر، سب سے مشہور مقام ⭐
2. **اچار ٹاپ** - شانگلہ ٹاپ سے 300 میٹر اونچا، شاندار نظارے
3. **الپوری** - ضلعی صدر مقام، تمام سہولیات
4. **شاہپور وادی** - قدرتی خوبصورتی اور سبزہ
5. **چکیسر وادی** - روایتی پشتون ثقافت
6. **پوران وادی** - کم سیاح، زیادہ قدرتی حسن
7. **لیلونائی** - خاندانی سیر کے لیے بہترین

🌟 بہترین وقت: مئی سے ستمبر
📍 اسلام آباد سے فاصلہ: 280 کلومیٹر"""

        if any(w in msg_lower or w in original for w in ["shangla top", "شانگلہ ٹاپ"]):
            return """🏔️ **شانگلہ ٹاپ** شانگلہ کا سب سے مشہور سیاحتی مقام ہے!

📍 **بلندی:** 2800 میٹر
🌡️ **موسم:** گرمیوں میں 15-25°C، سردیوں میں -5 سے 5°C
🚗 **اسلام آباد سے:** 280 کلومیٹر، 6-7 گھنٹے
🚗 **پشاور سے:** 220 کلومیٹر، 5-6 گھنٹے

✅ **خصوصیات:**
• پہاڑوں کا شاندار منظر
• سوات اور سندھ دریا دونوں کا نظارہ
• چیک پوسٹ جہاں سے اچار ٹاپ کی سڑک جاتی ہے
• مقامی کھانے کی دکانیں موجود

⭐ **بہترین وقت:** مئی سے اکتوبر"""

        if any(w in msg_lower or w in original for w in ["achar top", "اچار ٹاپ"]):
            return """🏔️ **اچار ٹاپ** شانگلہ کا سب سے خوبصورت منظر گاہ ہے!

📍 **بلندی:** شانگلہ ٹاپ سے 300 میٹر اونچا
🛣️ **رسائی:** شانگلہ ٹاپ چیک پوسٹ سے لنک روڈ کے ذریعے
⏱️ **وقت:** شانگلہ ٹاپ سے تقریباً 45 منٹ
📏 **فاصلہ:** تقریباً 15 کلومیٹر

✅ **خصوصیات:**
• 360 ڈگری پینورامک نظارہ
• شانگلہ ٹاپ سے کم سیاح
• فوٹوگرافی کے لیے بہترین
• 4x4 گاڑی تجویز کی جاتی ہے"""

        return """🏔️ **شانگلہ سیاحتی گائیڈ** میں خوش آمدید!

میں آپ کی مدد کر سکتا ہوں:
• 🗺️ سیاحتی مقامات اور راستے
• 🌤️ موسم کی معلومات
• 🏨 قیام کے اختیارات
• 💰 سفر کا منصوبہ اور بجٹ
• 🚗 شانگلہ کیسے پہنچیں

کوئی بھی سوال پوچھیں! 😊"""

    def _english_fallback(self, msg_lower: str) -> str:
        if any(w in msg_lower for w in ["top places", "best places", "tourist places", "places to visit", "what to see"]):
            return """🏔️ **Top Tourist Places in Shangla District:**

1. **Shangla Top** ⭐ — At 2800m altitude, the crown jewel of Shangla. Panoramic views of Swat valley and Indus River.

2. **Achar Top** 🏔️ — 300m above Shangla Top, accessible via link road from check post. Less crowded, stunning 360° views.

3. **Alpuri** 🏘️ — District headquarters with all facilities. Starting point for Shangla exploration.

4. **Shahpur Valley** 🌿 — Lush green valley, perfect for nature lovers and photography.

5. **Chakesar Valley** 🌄 — Traditional Pashtun culture, terraced fields, mountain views.

6. **Puran Valley** 💧 — Beautiful waterfalls in spring, less tourist traffic.

7. **Lilownai** 🌲 — Popular for family picnics, scenic streams.

8. **Kana Hill** 👁️ — Amazing viewpoint with different perspective of Shangla.

📅 **Best time:** May to September
🌡️ **Weather:** Pleasant 15-25°C in summer
🚗 **Distance from Islamabad:** 280 km (6-7 hours)"""

        if any(w in msg_lower for w in ["shangla top"]):
            return """🏔️ **Shangla Top** — The Crown of Shangla!

📍 **Altitude:** 2,800 meters (9,186 feet)
📏 **From Islamabad:** 280 km | ~6-7 hours
📏 **From Peshawar:** 220 km | ~5-6 hours
📏 **From Swat (Mingora):** 80 km | ~2 hours

🌟 **Highlights:**
- Breathtaking panoramic views of surrounding mountains
- See both Swat Valley and Indus River from one point
- Check post where link road to Achar Top begins
- Local food stalls and small shops
- Photography paradise at sunrise/sunset

🌡️ **Weather:** Summer 15-25°C | Winter -5 to 5°C with heavy snowfall
📅 **Best time:** May to October
🏨 **Stay:** PTDC Rest House (Rs 2000-4000) or local guest houses (Rs 1500-2500)
📱 **Network:** Jazz and Zong have best coverage"""

        if any(w in msg_lower for w in ["achar top"]):
            return """🏔️ **Achar Top** — Shangla's Hidden Gem!

📍 **Location:** 300m above Shangla Top
📏 **Distance from Shangla Top:** ~15 km via link road
⏱️ **Drive time:** 45 minutes from Shangla Top check post
🛣️ **Access:** Link road starting from Shangla Top check post

🌟 **Why visit:**
- Even more spectacular views than Shangla Top
- 360-degree panoramic mountain views
- Far less crowded — peaceful experience
- Perfect for photography and camping
- On clear days, see multiple mountain ranges

💡 **Tips:**
- Start early morning for best views
- 4x4 vehicle recommended (narrow road)
- Carry food and water — no permanent shops
- Mobile signal very weak at top
- Extremely cold at night even in summer"""

        if any(w in msg_lower for w in ["weather", "climate", "temperature"]):
            return """🌤️ **Shangla Weather & Climate Guide:**

🌸 **Spring (March-May):** 10-20°C
- Beautiful wildflowers blooming
- Moderate rainfall
- Roads clear and accessible

☀️ **Summer (June-September):** 15-28°C — BEST TIME TO VISIT
- Lush green valleys
- Pleasant temperatures
- All attractions accessible
- Peak tourist season

🍂 **Autumn (October-November):** 5-15°C
- Golden foliage
- Clear skies, excellent visibility
- Less crowded

❄️ **Winter (December-February):** -5 to 5°C
- Heavy snowfall at Shangla Top & Achar Top
- Stunning snow scenery
- Some roads may be blocked

⚠️ **Avoid:** Late July - Mid August (heavy monsoon, landslide risk)

💡 Always carry warm clothes even in summer for high altitudes!"""

        if any(w in msg_lower for w in ["route", "how to reach", "directions", "way to", "reach shangla"]):
            return """🗺️ **How to Reach Shangla:**

**From Islamabad (280 km | 6-7 hours):**
M1 Motorway → Swabi → Mardan → Malakand Pass → Chakdara → Khwazakhela → Besham → Shangla Top
⛽ Fuel stops: Swabi, Besham

**From Peshawar (220 km | 5-6 hours):**
GT Road → Mardan → Malakand → Chakdara → Khwazakhela → Shangla

**From Swat/Mingora (80 km | 2 hours):**
Mingora → Khwazakhela → Shangla junction → Shangla Top

**From Lahore (450 km | 10-11 hours):**
M2 → Islamabad → Follow Islamabad route

🚗 **Transport Options:**
- Own car: Most convenient (4x4 for winter)
- Public buses: Peshawar/Mingora to Alpuri
- Coaster/wagon: Besham to Alpuri

🏨 **Key Stay Points on Route:**
- Besham: Good hotels (Rs 2000-4000), all facilities, fuel
- Alpuri: District HQ, banks, hospitals, guest houses"""

        if any(w in msg_lower for w in ["stay", "hotel", "guest house", "accommodation", "where to stay"]):
            return """🏨 **Accommodation in Shangla:**

**At Shangla Top:**
- PTDC Rest House: Rs 2,000-4,000/night (book in advance)
- Local Guest Houses: Rs 1,500-2,500/night
- Camping: Allowed near top (very cold at night)

**In Alpuri (District HQ):**
- Hotel Shangla Star: Rs 2,500-4,000/night
- Hotel Green Valley: Rs 1,500-2,500/night
- Budget guest houses: Rs 800-1,500/night

**In Besham (Entry Point):**
- PTDC Motel Besham: Rs 3,000-5,000/night (best quality)
- Hotel Indus: Rs 2,000-3,500/night
- Budget hotels: Rs 1,000-2,000/night

💡 **Tips:**
- Book in advance during June-August (peak season)
- Negotiate for longer stays
- Homestay options available in villages
- Group discounts at most places"""

        if any(w in msg_lower for w in ["budget", "cost", "price", "how much", "expensive"]):
            return """💰 **Shangla Trip Budget Guide:**

**Budget Trip (Per Person):**
- Transport: Rs 500-1,000 (public)
- Stay: Rs 800-1,500 (guest house)
- Food: Rs 400-600/day
- **Daily total: ~Rs 1,700-3,100**

**Mid-Range Trip (Per Person):**
- Transport: Rs 2,000-3,000 (own car shared)
- Stay: Rs 2,000-3,000 (hotel)
- Food: Rs 800-1,200/day
- **Daily total: ~Rs 4,800-7,200**

**Sample 2-Day Trip (Group of 4, own car):**
- Fuel (Islamabad return): Rs 6,000-8,000
- Stay (2 nights): Rs 6,000-10,000
- Food: Rs 4,000-6,000
- Misc: Rs 2,000
- **Total: Rs 18,000-26,000 (Rs 4,500-6,500 per person)**

💡 Shangla is very affordable compared to other KPK destinations!"""

        if any(w in msg_lower for w in ["food", "eat", "restaurant", "cuisine", "dhaba"]):
            return """🍽️ **Food in Shangla:**

**Must-Try Local Dishes:**
- 🥩 Chapli Kebab — Famous Pashtun dish, must try!
- 🍖 Karahi — Meat cooked in wok, excellent locally
- 🌽 Makki ki Roti — Local corn bread with butter
- 🐟 Fresh Trout Fish — From mountain streams (seasonal)
- 🫖 Namkeen Chai — Traditional pink salt tea
- 🍢 Charsi Tikka — Spicy local specialty

**Where to Eat:**
- Local dhabas (most authentic): Rs 200-400/meal
- Alpuri bazaar restaurants: Rs 300-600/meal
- Besham hotels: Rs 400-800/meal
- Shangla Top stalls: Basic snacks Rs 50-200

**Average Costs:**
- Breakfast: Rs 150-300/person
- Lunch: Rs 250-500/person
- Dinner: Rs 300-600/person

💡 Local food is excellent and very affordable. Try everything!"""

        if any(w in msg_lower for w in ["safe", "safety", "dangerous", "secure"]):
            return """🛡️ **Safety in Shangla:**

✅ **Shangla is generally SAFE for tourists**

**Road Safety:**
- Mountain roads are narrow and winding
- Drive at 30-40 km/h on mountain sections
- Avoid driving after dark on mountain roads
- Check road alerts before travel (monsoon season)

**Emergency Contacts:**
- Police: 15
- Rescue 1122: Emergency services
- Ambulance: 115
- DHQ Hospital Alpuri: Main medical facility

**Health Tips:**
- Carry basic first aid kit
- Altitude sickness possible above 2500m — acclimatize
- Carry water purification tablets for remote areas

**Cultural Tips:**
- Dress modestly (conservative area)
- Ask permission before photographing people
- Greet with "As-salamu alaykum"
- Respect local customs and prayer times

**Network:**
- Jazz and Telenor best coverage
- Download offline maps before departure
- Share itinerary with someone"""

        # Default response with context
        return """🏔️ **Shangla AI Guide — How Can I Help?**

I can answer questions about:

| Topic | Examples |
|-------|---------|
| 🏔️ Places | Shangla Top, Achar Top, valleys, viewpoints |
| 🗺️ Routes | How to reach, distances, travel times |
| 🌤️ Weather | Best time to visit, climate by season |
| 🏨 Stay | Hotels, guest houses, camping options |
| 🍽️ Food | Local cuisine, restaurants, costs |
| 💰 Budget | Trip costs, budget planning |
| 🛡️ Safety | Road conditions, emergency contacts |
| 🎒 Tips | What to pack, local customs |

**Just ask your question!** 😊🏔️"""


# Singleton instance
llm_service = LLMService()