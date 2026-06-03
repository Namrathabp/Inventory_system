from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import engine, Base, get_db
from . import crud, schemas, models

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DASHBOARD SUMMARY ---
@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    customers_count = db.query(models.Customer).count()
    orders_count = db.query(models.Order).count()
    low_stock = sum(1 for p in products if p.quantity < 5)
    
    return {
        "total_products": len(products),
        "total_customers": customers_count,
        "total_orders": orders_count,
        "low_stock_count": low_stock
    }

# --- PRODUCT ENDPOINTS ---
@app.get("/api/products", response_model=List[schemas.ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@app.get("/api/products/{id}", response_model=schemas.ProductResponse)
def read_product(id: int, db: Session = Depends(get_db)):
    return crud.get_product(db, id)

@app.post("/api/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def add_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@app.put("/api/products/{id}", response_model=schemas.ProductResponse)
def edit_product(id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    return crud.update_product(db, id, product)

@app.delete("/api/products/{id}")
def remove_product(id: int, db: Session = Depends(get_db)):
    return crud.delete_product(db, id)

# --- CUSTOMER ENDPOINTS ---
@app.get("/api/customers", response_model=List[schemas.CustomerResponse])
def read_customers(db: Session = Depends(get_db)):
    return crud.get_customers(db)

@app.get("/api/customers/{id}", response_model=schemas.CustomerResponse)
def read_customer(id: int, db: Session = Depends(get_db)):
    return crud.get_customer(db, id)

@app.post("/api/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def add_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, customer)

@app.delete("/api/customers/{id}")
def remove_customer(id: int, db: Session = Depends(get_db)):
    return crud.delete_customer(db, id)

# --- ORDER ENDPOINTS ---
@app.get("/api/orders", response_model=List[schemas.OrderResponse])
def read_orders(db: Session = Depends(get_db)):
    return crud.get_orders(db)

@app.get("/api/orders/{id}", response_model=schemas.OrderResponse)
def read_order(id: int, db: Session = Depends(get_db)):
    return crud.get_order(db, id)

@app.post("/api/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def add_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db, order)

@app.delete("/api/orders/{id}")
def cancel_order(id: int, db: Session = Depends(get_db)):
    return crud.delete_order(db, id)