import sys
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from app.main import app
from app.database import Base, get_db

import app.models as models  # noqa: F401

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ==================== END-TO-END TEST CASES ====================


def test_create_and_read_product():
    """Create a product and verify it is returned by the products endpoint."""
    sku = f"TEST-PROD-{uuid4().hex[:8]}"

    create_resp = client.post("/api/products", json={
        "name": "Mechanical Keyboard",
        "sku": sku,
        "price": 89.99,
        "quantity": 20,
    })
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["sku"] == sku
    assert created["quantity"] == 20

    list_resp = client.get("/api/products")
    assert list_resp.status_code == 200
    products = list_resp.json()
    assert isinstance(products, list)
    assert any(prod["sku"] == sku for prod in products)


def test_customer_email_validation():
    """Validate that invalid customer emails are rejected and valid ones are accepted."""
    bad_resp = client.post("/api/customers", json={
        "name": "John Doe",
        "email": "not-an-email",
        "phone": "555-0000",
    })
    assert bad_resp.status_code == 422

    good_resp = client.post("/api/customers", json={
        "name": "John Doe",
        "email": f"john-{uuid4().hex[:8]}@example.com",
        "phone": "555-1234",
    })
    assert good_resp.status_code == 201
    customer = good_resp.json()
    assert customer["email"].startswith("john-")
    assert customer["phone"] == "555-1234"


def test_order_creation_workflow():
    """Create a product and customer, place an order, and verify inventory reduction."""
    sku = f"TEST-ORDER-{uuid4().hex[:8]}"
    product_resp = client.post("/api/products", json={
        "name": "Laptop",
        "sku": sku,
        "price": 999.99,
        "quantity": 5,
    })
    assert product_resp.status_code == 201
    product = product_resp.json()

    customer_resp = client.post("/api/customers", json={
        "name": "Alice",
        "email": f"alice-{uuid4().hex[:8]}@example.com",
        "phone": "555-5678",
    })
    assert customer_resp.status_code == 201
    customer = customer_resp.json()

    order_resp = client.post("/api/orders", json={
        "customer_id": customer["id"],
        "product_id": product["id"],
        "quantity": 2,
    })
    assert order_resp.status_code == 201
    order = order_resp.json()
    assert order["customer_id"] == customer["id"]
    assert order["product_id"] == product["id"]
    assert order["quantity"] == 2
    assert order["total_amount"] == pytest.approx(1999.98)

    updated_product_resp = client.get(f"/api/products/{product['id']}")
    assert updated_product_resp.status_code == 200
    updated_product = updated_product_resp.json()
    assert updated_product["quantity"] == 3
