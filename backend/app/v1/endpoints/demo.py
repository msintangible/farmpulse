"""Demo seed endpoint (BE-2, PROJECT_PLAN Week 1 Day 6-7).

`GET /api/v1/demo/seed` idempotently loads one coherent demo scenario: a
single farm, one field with a baseline, one anomalous vegetation snapshot,
crop prices, and a few historical similar_cases.

Per ADR-002 the "MongoDB access goes through the MCP server" rule applies to
the *agent's* path. This is an administrative bulk-load, so it uses PyMongo
directly — explicitly permitted by ADR-002.

Timestamps are fixed (not `now()`) so re-seeding replaces rather than appends
(idempotent) and the demo stays deterministic (PROJECT_PLAN risk #6).

similar_cases are seeded without embeddings; the Voyage AI embedding + Atlas
Vector Search index is BE-1's Week 2 work (ADR-004).
"""

from datetime import date, datetime, timezone

from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from backend.database.mongodb import get_database
from backend.schemas.schemas import (
    Farm,
    FieldBaseline,
    PriceSnapshot,
    SimilarCase,
    VegetationSnapshot,
)

router = APIRouter()

# Fixed demo instant — keeps re-seeds idempotent and the demo deterministic.
_SEED_TS = datetime(2026, 5, 20, 9, 0, tzinfo=timezone.utc)
_SEED_DATE = date(2026, 5, 20)

_FARM = Farm(
    farm_id="farm_donegal_01",
    name="Glenveagh Farm",
    owner_name="Aoife Gallagher",
    region="County Donegal, Ireland",
    field_ids=["field_01"],
    created_at=_SEED_TS,
)

_FIELD = FieldBaseline(
    field_id="field_01",
    farm_id="farm_donegal_01",
    name="North Paddock",
    crop_type="wheat",
    area_ha=12.5,
    centroid={"lat": 55.0413, "lon": -8.0072},
    boundary=None,
    baseline_ndvi=0.78,
    expected_yield_per_ha_t=8.0,
    created_at=_SEED_TS,
)

# Anomaly: NDVI well below baseline (delta = current - baseline = -0.26).
_VEGETATION = VegetationSnapshot(
    field_id="field_01",
    captured_at=_SEED_TS,
    current_ndvi=0.52,
    ndvi_delta=-0.26,
    anomaly_zone=None,
    source="precomputed",
)

_PRICES = [
    PriceSnapshot(crop_type="wheat", price_per_t_eur=221.0, effective_date=_SEED_DATE, source="seeded"),
    PriceSnapshot(crop_type="maize", price_per_t_eur=198.0, effective_date=_SEED_DATE, source="seeded"),
    PriceSnapshot(crop_type="potato", price_per_t_eur=255.0, effective_date=_SEED_DATE, source="seeded"),
    PriceSnapshot(crop_type="grass", price_per_t_eur=85.0, effective_date=_SEED_DATE, source="seeded"),
]

_SIMILAR_CASES = [
    SimilarCase(
        case_id="case_wheat_moisture_01",
        crop_type="wheat",
        region="Leinster, Ireland",
        season="late spring",
        ndvi={"baseline": 0.80, "current": 0.56, "delta": -0.24},
        weather={"temp_7d_avg_c": 14.2, "rainfall_7d_mm": 4.0, "humidity_pct": 62.0, "wind_kmh": 18.0},
        identified_cause="Moisture stress from a three-week dry spell",
        action_taken="Supplementary irrigation over five days plus a light nitrogen top-dressing.",
        outcome="NDVI recovered to within 0.05 of baseline over three weeks; yield loss held under 8%.",
        description=(
            "Wheat field in late spring showing a ~0.24 NDVI drop after a prolonged dry spell "
            "with very low rainfall; cause was moisture stress, resolved with irrigation and nitrogen."
        ),
    ),
    SimilarCase(
        case_id="case_wheat_fungal_01",
        crop_type="wheat",
        region="County Cork, Ireland",
        season="early summer",
        ndvi={"baseline": 0.79, "current": 0.50, "delta": -0.29},
        weather={"temp_7d_avg_c": 17.5, "rainfall_7d_mm": 48.0, "humidity_pct": 88.0, "wind_kmh": 9.0},
        identified_cause="Septoria leaf blotch following a warm, humid, wet week",
        action_taken="Triazole fungicide application; affected zone scouted and flagged.",
        outcome="Spread halted within ten days; NDVI partially recovered by harvest.",
        description=(
            "Wheat field in early summer with a ~0.29 NDVI drop during warm, humid, high-rainfall "
            "conditions; cause was Septoria fungal leaf blotch, treated with fungicide."
        ),
    ),
    SimilarCase(
        case_id="case_wheat_nutrient_01",
        crop_type="wheat",
        region="Lincolnshire, England",
        season="late spring",
        ndvi={"baseline": 0.77, "current": 0.60, "delta": -0.17},
        weather={"temp_7d_avg_c": 13.0, "rainfall_7d_mm": 22.0, "humidity_pct": 70.0, "wind_kmh": 15.0},
        identified_cause="Localised nitrogen deficiency on a sandy patch",
        action_taken="Variable-rate nitrogen applied to the deficient zone.",
        outcome="NDVI recovered within two weeks; negligible yield impact.",
        description=(
            "Wheat field in late spring with a moderate ~0.17 NDVI dip under mild weather; cause "
            "was a localised nitrogen deficiency, corrected with targeted fertiliser."
        ),
    ),
]


def _doc(model: BaseModel) -> dict:
    """JSON-mode dump: enums become their values and dates/datetimes become
    ISO strings, giving uniform, BSON-encodable documents."""
    return model.model_dump(mode="json")


def _seed_sync() -> dict[str, int]:
    db = get_database()
    counts: dict[str, int] = {}

    def upsert(collection: str, key_fields: list[str], model: BaseModel) -> None:
        # Derive the filter from the serialized doc so the key values match the
        # stored representation exactly (e.g. datetimes dump as "...Z"), keeping
        # re-seeds idempotent rather than inserting duplicates.
        doc = _doc(model)
        key = {field: doc[field] for field in key_fields}
        db[collection].replace_one(key, doc, upsert=True)
        counts[collection] = counts.get(collection, 0) + 1

    upsert("farms", ["farm_id"], _FARM)
    upsert("field_baselines", ["field_id"], _FIELD)
    upsert("vegetation_snapshots", ["field_id", "captured_at"], _VEGETATION)
    for price in _PRICES:
        upsert("price_snapshots", ["crop_type", "effective_date"], price)
    for case in _SIMILAR_CASES:
        upsert("similar_cases", ["case_id"], case)

    return counts


@router.get("/seed", summary="Idempotently seed the demo scenario")
async def seed_demo() -> dict:
    counts = await run_in_threadpool(_seed_sync)
    return {
        "status": "ok",
        "database": "farmpulse",
        "demo_field_id": _FIELD.field_id,
        "seeded": counts,
        "note": (
            "Idempotent — safe to call repeatedly. similar_cases are seeded without "
            "embeddings; Voyage AI embedding + Atlas Vector Search index is BE-1 Week 2 (ADR-004)."
        ),
    }
