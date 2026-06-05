from fastapi.testclient import TestClient


def test_recommend_save_low(seeded_db):
    from app.main import app

    client = TestClient(app)
    res = client.post(
        "/recommend",
        json={
            "age": 24,
            "monthly_income": 15_000_000,
            "goal": "save",
            "risk_appetite": "low",
            "investment_horizon_months": 12,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert len(body["recommendations"]) > 0
    top = body["recommendations"][0]
    assert top["product"]["type"] in ("savings", "fund")
    assert top["reasoning"]["score"] > 0
    assert body["compliance"]["disclaimer"]
    assert [t["agent"] for t in body["trace"]] == [
        "Profiler",
        "Researcher",
        "Recommender",
        "Compliance",
    ]


def test_compliance_filters_high_risk_for_low_appetite(seeded_db):
    from app.main import app

    client = TestClient(app)
    res = client.post(
        "/recommend",
        json={
            "age": 22,
            "monthly_income": 10_000_000,
            "goal": "grow",
            "risk_appetite": "low",
        },
    )
    body = res.json()
    for rec in body["recommendations"]:
        assert rec["product"]["risk_level"] != "high"


def test_catalog_endpoint(seeded_db):
    from app.main import app

    client = TestClient(app)
    res = client.get("/catalog")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 10
    assert all("provider" in p for p in data)


def test_health(seeded_db):
    from app.main import app

    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
