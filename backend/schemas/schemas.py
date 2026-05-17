"""Pydantic v2 models for the FarmPulse MongoDB collections.

Each model describes the document shape for one collection. Documents are
keyed by domain identifiers (farm_id, field_id, run_id, case_id); MongoDB's
own _id is intentionally not modelled — data moves in and out via the
MongoDB MCP server as JSON, and Mongo owns _id.

See ARCHITECTURE_DECISIONS.md and SYSTEM_PROMPT.md for the source of truth.
"""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# --- Shared controlled vocabularies (from SYSTEM_PROMPT.md) ---
Severity = Literal["low", "medium", "high", "critical"]
CropType = Literal["wheat", "maize", "potato", "grass"]
Timing = Literal["immediate", "within_7_days", "within_30_days"]
Confidence = Literal["low", "medium", "high"]


class Farm(BaseModel):
    """A farm — the top-level owner of one or more fields (collection: farms)."""

    model_config = ConfigDict(extra="ignore")

    farm_id: str = Field(..., description="Stable business identifier, e.g. 'farm_donegal_01'.")
    name: str = Field(..., description="Human-readable farm name.")
    owner_name: str = Field(..., description="Name of the farmer who owns the farm.")
    region: str = Field(..., description="Free-text location, e.g. 'County Donegal, Ireland'.")
    field_ids: list[str] = Field(
        default_factory=list,
        description="field_id values of the fields on this farm; resolved against field_baselines.",
    )
    created_at: datetime = Field(..., description="Record creation time (UTC).")


class GeoPoint(BaseModel):
    """A WGS84 latitude/longitude point."""

    model_config = ConfigDict(extra="ignore")

    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees.")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees.")


class FieldBaseline(BaseModel):
    """A field's static profile and NDVI baseline (collection: field_baselines).

    Per the FarmPulse data model this collection doubles as the field master
    record — there is no separate `fields` collection. It is what the agent's
    get_field_baseline(field_id) tool reads in Step 1.
    """

    model_config = ConfigDict(extra="ignore")

    field_id: str = Field(..., description="Stable field identifier, e.g. 'field_01'.")
    farm_id: str = Field(..., description="farm_id of the owning farm.")
    name: str = Field(..., description="Human-readable field name.")
    crop_type: CropType = Field(..., description="Crop grown on the field.")
    area_ha: float = Field(..., gt=0, description="Field area in hectares.")
    centroid: GeoPoint = Field(..., description="Field centre point; the agent uses this as the get_weather coordinate.")
    boundary: dict | None = Field(
        default=None,
        description="GeoJSON Polygon of the field outline, for the map. Stored as-is, not strictly validated.",
    )
    baseline_ndvi: float = Field(..., ge=-1.0, le=1.0, description="Reference healthy NDVI for this field.")
    expected_yield_per_ha_t: float = Field(..., gt=0, description="Expected yield in tonnes per hectare.")
    created_at: datetime = Field(..., description="Record creation time (UTC).")


class VegetationSnapshot(BaseModel):
    """A point-in-time NDVI observation for a field (collection: vegetation_snapshots).

    Holds the raw observation only. Whether it counts as an anomaly, and the
    severity, are *derived* by the agent from ndvi_delta — those live in
    action_plans, not here. Read by the agent's get_vegetation_snapshot tool.
    """

    model_config = ConfigDict(extra="ignore")

    field_id: str = Field(..., description="Field this snapshot belongs to.")
    captured_at: datetime = Field(..., description="When the NDVI observation was captured (UTC).")
    current_ndvi: float = Field(..., ge=-1.0, le=1.0, description="Observed NDVI at capture time.")
    ndvi_delta: float = Field(
        ...,
        ge=-2.0,
        le=2.0,
        description="current_ndvi minus the field's baseline_ndvi; negative means vegetation loss.",
    )
    anomaly_zone: dict | None = Field(
        default=None,
        description="GeoJSON Polygon of the affected sub-area, if any. Stored as-is, not strictly validated.",
    )
    source: str = Field(..., description="Provenance of the NDVI value, e.g. 'precomputed' or 'sentinel-2-cached'.")


class WeatherSnapshot(BaseModel):
    """A cached weather observation for a location (collection: weather_snapshots).

    Written by the agent's get_weather tool after an Open-Meteo fetch. Holds
    the 7-day aggregates the agent reasons over — the same four numbers that
    populate the weather_context block of an action plan.
    """

    model_config = ConfigDict(extra="ignore")

    field_id: str | None = Field(default=None, description="Field the weather was fetched for, if applicable.")
    location: GeoPoint = Field(..., description="Coordinate the weather was fetched for.")
    fetched_at: datetime = Field(..., description="When the weather was fetched (UTC).")
    temp_7d_avg_c: float = Field(..., description="7-day average temperature, degrees Celsius.")
    rainfall_7d_mm: float = Field(..., ge=0, description="7-day total rainfall, millimetres.")
    humidity_pct: float = Field(..., ge=0, le=100, description="7-day average relative humidity, percent.")
    wind_kmh: float = Field(..., ge=0, description="7-day average wind speed, km/h.")
    source: str = Field(default="open-meteo", description="Weather data provider.")


class PriceSnapshot(BaseModel):
    """A crop price observation (collection: price_snapshots).

    Read by the agent's get_crop_prices(crop_type) tool. Currency is always
    EUR per SYSTEM_PROMPT, so it is baked into the field name rather than
    stored as a separate field.
    """

    model_config = ConfigDict(extra="ignore")

    crop_type: CropType = Field(..., description="Crop this price applies to.")
    price_per_t_eur: float = Field(..., gt=0, description="Market price in EUR per tonne.")
    effective_date: date = Field(..., description="Calendar date the price is effective.")
    source: str = Field(..., description="Provenance of the price, e.g. 'seeded' or a market name.")


class NdviReading(BaseModel):
    """The NDVI numbers behind an analysis (embedded in ActionPlan.ndvi)."""

    model_config = ConfigDict(extra="ignore")

    baseline: float = Field(..., ge=-1.0, le=1.0, description="Baseline (healthy) NDVI.")
    current: float = Field(..., ge=-1.0, le=1.0, description="Current observed NDVI.")
    delta: float = Field(..., ge=-2.0, le=2.0, description="current minus baseline.")


class WeatherContext(BaseModel):
    """The 7-day weather aggregates behind an analysis (embedded in ActionPlan.weather_context)."""

    model_config = ConfigDict(extra="ignore")

    temp_7d_avg_c: float = Field(..., description="7-day average temperature, degrees Celsius.")
    rainfall_7d_mm: float = Field(..., ge=0, description="7-day total rainfall, millimetres.")
    humidity_pct: float = Field(..., ge=0, le=100, description="7-day average relative humidity, percent.")
    wind_kmh: float = Field(..., ge=0, description="7-day average wind speed, km/h.")


class CauseHypothesis(BaseModel):
    """The agent's diagnosed cause (embedded in ActionPlan.cause)."""

    model_config = ConfigDict(extra="ignore")

    primary_hypothesis: str = Field(..., description="Short description of the single most likely cause.")
    confidence: Confidence = Field(..., description="Agent's confidence in the hypothesis.")
    reasoning: str = Field(..., description="2-3 sentence explanation linking evidence to the hypothesis.")


class FinancialImpact(BaseModel):
    """The estimated revenue loss (embedded in ActionPlan.financial_impact)."""

    model_config = ConfigDict(extra="ignore")

    crop_type: CropType = Field(..., description="Crop affected.")
    area_ha: float = Field(..., gt=0, description="Field area in hectares.")
    expected_yield_per_ha_t: float = Field(..., gt=0, description="Expected yield, tonnes per hectare.")
    yield_loss_pct: float = Field(..., ge=0, le=1, description="Fraction of expected yield lost (0-1).")
    yield_lost_t: float = Field(..., ge=0, description="Tonnes of yield lost.")
    price_per_t_eur: float = Field(..., gt=0, description="Crop price, EUR per tonne.")
    revenue_loss_eur: int = Field(..., ge=0, description="Estimated revenue loss in whole EUR.")


class ActionStep(BaseModel):
    """One recommended step (embedded in ActionPlan.action_plan)."""

    model_config = ConfigDict(extra="ignore")

    step: int = Field(..., ge=1, description="1-based ordinal of this step.")
    action: str = Field(..., description="Imperative sentence describing the action.")
    timing: Timing = Field(..., description="When the step should be carried out.")
    estimated_cost_eur: int = Field(..., ge=0, description="Estimated cost in whole EUR.")
    rationale: str = Field(..., description="One sentence linking the step to the cause hypothesis.")


class SimilarCaseRef(BaseModel):
    """A reference to a past case the agent matched (embedded in ActionPlan.similar_cases).

    The lightweight pointer stored *inside* an action plan — distinct from the
    full SimilarCase document in the similar_cases collection.
    """

    model_config = ConfigDict(extra="ignore")

    case_id: str = Field(..., description="case_id from the similar_cases collection.")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Vector-search similarity, 0-1.")
    summary: str = Field(..., description="One-sentence summary of the past case.")


class ActionPlan(BaseModel):
    """A completed field analysis (collection: action_plans).

    THE load-bearing schema. The agent's 6-step run ends by emitting a JSON
    object of exactly this shape; the runtime validates it with
    ActionPlan.model_validate(...) before it is inserted via MCP and returned
    to the UI. Field names match SYSTEM_PROMPT.md's OUTPUT SCHEMA exactly.
    """

    model_config = ConfigDict(extra="ignore")

    field_id: str = Field(..., description="Field that was analysed.")
    run_id: str = Field(..., description="Identifier of the agent run that produced this plan.")
    analysed_at: datetime = Field(..., description="When the analysis completed (UTC).")
    anomaly_detected: bool = Field(..., description="Whether an anomaly was detected.")
    severity: Severity = Field(..., description="Severity classification.")
    ndvi: NdviReading = Field(..., description="The NDVI numbers behind the analysis.")
    weather_context: WeatherContext = Field(..., description="The 7-day weather aggregates used.")
    cause: CauseHypothesis = Field(..., description="The agent's diagnosed primary cause.")
    financial_impact: FinancialImpact = Field(..., description="Estimated revenue loss.")
    action_plan: list[ActionStep] = Field(
        ...,
        min_length=3,
        max_length=6,
        description="3-6 recommended steps, per SYSTEM_PROMPT.",
    )
    similar_cases: list[SimilarCaseRef] = Field(
        default_factory=list,
        description="Past cases matched by vector search, as lightweight references.",
    )
    tools_called: list[str] = Field(
        default_factory=list,
        description="Names of the tools the agent invoked, in order.",
    )
    summary: str = Field(..., description="1-2 sentence farmer-friendly summary.")


class AuditLog(BaseModel):
    """A record of one agent run, success or failure (collection: audit_logs).

    Written on every analyse run per PROJECT_PLAN Day 12. Captures timing,
    outcome, and — when the run degraded — whether the mock fallback plan was
    served, so a silently-degraded run stays visible after the fact.
    """

    model_config = ConfigDict(extra="ignore")

    run_id: str = Field(..., description="Identifier of the agent run.")
    field_id: str = Field(..., description="Field that was analysed.")
    status: Literal["success", "failure"] = Field(..., description="Final outcome of the run.")
    started_at: datetime = Field(..., description="When the run started (UTC).")
    finished_at: datetime = Field(..., description="When the run finished (UTC).")
    duration_ms: int = Field(..., ge=0, description="Wall-clock run duration in milliseconds.")
    tools_called: list[str] = Field(default_factory=list, description="Tools invoked during the run, in order.")
    used_fallback: bool = Field(
        default=False,
        description="True if the mock fallback plan was served instead of the agent's own output.",
    )
    error_type: str | None = Field(
        default=None,
        description="Error category if status is 'failure', e.g. 'tool_failure' or 'validation_error'.",
    )
    error_message: str | None = Field(
        default=None,
        description="One-line error description if status is 'failure'.",
    )


class SimilarCase(BaseModel):
    """A historical anomaly case for vector-search retrieval (collection: similar_cases).

    Per ADR-004, ~15-25 of these are hand-seeded. The `description` field is
    embedded with Voyage AI; the resulting vector is stored in `embedding` and
    indexed by Atlas Vector Search. The agent's find_similar_anomalies tool
    embeds its query and runs a $vectorSearch against this collection.
    """

    model_config = ConfigDict(extra="ignore")

    case_id: str = Field(..., description="Stable case identifier, referenced by ActionPlan.similar_cases.")
    crop_type: CropType = Field(..., description="Crop involved in the historical case.")
    region: str = Field(..., description="Region where the case occurred.")
    season: str = Field(..., description="Season the case occurred in, e.g. 'late spring'.")
    ndvi: NdviReading = Field(..., description="NDVI baseline/current/delta from the historical case.")
    weather: WeatherContext = Field(..., description="Weather context of the historical case.")
    identified_cause: str = Field(..., description="The cause that was identified at the time.")
    action_taken: str = Field(..., description="What the farmer did in response.")
    outcome: str = Field(..., description="How the situation resolved.")
    description: str = Field(
        ...,
        description="Natural-language summary of the case; this is the text embedded by Voyage AI.",
    )
    embedding: list[float] | None = Field(
        default=None,
        description="Voyage AI embedding of `description` (e.g. voyage-3-lite). Populated by the "
        "seed/embed step; indexed by Atlas Vector Search.",
    )
