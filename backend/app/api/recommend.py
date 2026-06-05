from fastapi import APIRouter

from ..graph import invoke
from ..schemas.profile import UserProfile
from ..schemas.recommendation import RecommendResponse

router = APIRouter(tags=["recommend"])


@router.post("/recommend", response_model=RecommendResponse)
def recommend(profile: UserProfile) -> RecommendResponse:
    return invoke(profile)
