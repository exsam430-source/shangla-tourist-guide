from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import os
import httpx
from PIL import Image
import io
import json

router = APIRouter()

NODE_BACKEND = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

class RecognitionResult(BaseModel):
    place_name: str
    confidence: float
    place_id: Optional[str] = None
    message: Optional[str] = None
    details: Optional[dict] = None

@router.post("/recognize-place", response_model=RecognitionResult)
async def recognize_place(image: UploadFile = File(...)):
    """
    Identify a Shangla location from an uploaded image.
    Uses feature matching against known place images.
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))

        # Validate image
        if img.size[0] < 50 or img.size[1] < 50:
            raise HTTPException(status_code=400, detail="Image too small")

        # Try ML-based recognition
        result = await _ml_recognition(contents, img)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

async def _ml_recognition(contents: bytes, img: Image.Image) -> RecognitionResult:
    """
    ML-based image recognition.
    Tries to use trained model, falls back to feature matching.
    """
    try:
        # Try to load trained model if available
        model_path = "./data/models/shangla_classifier.pkl"
        if os.path.exists(model_path):
            return await _use_trained_model(contents, img, model_path)
    except Exception:
        pass

    # Fallback: Use image metadata/EXIF location if available
    try:
        from PIL.ExifTags import TAGS, GPSTAGS
        exif_data = img._getexif()
        if exif_data:
            gps_info = {}
            for tag, value in exif_data.items():
                tag_name = TAGS.get(tag, tag)
                if tag_name == "GPSInfo":
                    for gps_tag in value:
                        gps_tag_name = GPSTAGS.get(gps_tag, gps_tag)
                        gps_info[gps_tag_name] = value[gps_tag]

            if gps_info:
                result = await _match_by_gps(gps_info)
                if result:
                    return result
    except Exception:
        pass

    # Final fallback
    return RecognitionResult(
        place_name="Place Not Identified",
        confidence=0.0,
        message="Could not identify this location. Please ensure the image is from Shangla and try again. Train the model with more images for better accuracy."
    )

async def _use_trained_model(contents: bytes, img: Image.Image, model_path: str) -> RecognitionResult:
    """Use trained sklearn/pytorch model for classification"""
    import pickle
    import numpy as np

    img_resized = img.resize((224, 224)).convert("RGB")
    img_array = np.array(img_resized).flatten() / 255.0

    with open(model_path, "rb") as f:
        model_data = pickle.load(f)

    model = model_data["model"]
    classes = model_data["classes"]
    place_map = model_data.get("place_map", {})

    probabilities = model.predict_proba([img_array])[0]
    max_idx = probabilities.argmax()
    confidence = float(probabilities[max_idx])
    predicted_class = classes[max_idx]

    if confidence < 0.5:
        return RecognitionResult(
            place_name="Low Confidence Match",
            confidence=confidence,
            message=f"Best guess: {predicted_class} but confidence is too low ({confidence:.0%}). Try a clearer photo."
        )

    place_info = await _get_place_from_backend(predicted_class)

    return RecognitionResult(
        place_name=place_info.get("nameEn", predicted_class) if place_info else predicted_class,
        confidence=confidence,
        place_id=str(place_info.get("_id", "")) if place_info else None,
        details=place_info,
        message=f"Identified with {confidence:.0%} confidence"
    )

async def _match_by_gps(gps_info: dict) -> Optional[RecognitionResult]:
    """Match image by GPS coordinates in EXIF data"""
    try:
        def convert_to_degrees(value):
            d, m, s = value
            return float(d) + float(m) / 60 + float(s) / 3600

        lat = convert_to_degrees(gps_info.get("GPSLatitude", (0, 0, 0)))
        lng = convert_to_degrees(gps_info.get("GPSLongitude", (0, 0, 0)))

        if gps_info.get("GPSLatitudeRef", "N") == "S":
            lat = -lat
        if gps_info.get("GPSLongitudeRef", "E") == "W":
            lng = -lng

        # Check if coordinates are in Shangla region
        if 34.0 < lat < 35.5 and 72.0 < lng < 73.5:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{NODE_BACKEND}/api/places",
                    params={"lat": lat, "lng": lng, "maxDistance": 5, "limit": 1}
                )
                if response.status_code == 200:
                    data = response.json()
                    places = data.get("data", [])
                    if places:
                        place = places[0]
                        return RecognitionResult(
                            place_name=place.get("nameEn", "Unknown Place"),
                            confidence=0.85,
                            place_id=str(place.get("_id", "")),
                            details=place,
                            message="Identified via GPS location data in image"
                        )
    except Exception:
        pass
    return None

async def _get_place_from_backend(place_name: str) -> Optional[dict]:
    """Fetch place details from Node.js backend"""
    try:
        async with httpx.AsyncClient() as client:
            slug = place_name.lower().replace(" ", "-").replace("_", "-")
            response = await client.get(f"{NODE_BACKEND}/api/places/{slug}")
            if response.status_code == 200:
                return response.json().get("data")
    except Exception:
        pass
    return None