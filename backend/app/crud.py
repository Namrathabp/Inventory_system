from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas

# --- PRODUCTS ---
def get_products(db: Session):
    return db.query(models.Product).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(status_code=400, detail="SKU already exists")
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

def update_product(db: Session, product_id: int, product_data: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.model_dump(exclude_unset=True).items():
        if key == "sku":
            existing = db.query(models.Product).filter(models.Product.sku == value, models.Product.id != product_id).first()
            if existing:
                raise HTTPException(status_code=400, detail="SKU already exists")
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# --- CUSTOMERS ---
def get_customers(db: Session):
    return db.query(models.Customer).all()

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_cust = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if db_cust:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

def delete_customer(db: Session, customer_id: int):
    db_cust = get_customer(db, customer_id)
    if not db_cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_cust)
    db.commit()
    return {"message": "Customer deleted successfully"}

# --- ORDERS & BUSINESS LOGIC ---
def get_orders(db: Session):
    return db.query(models.Order).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    product = get_product(db, order.product_id)
    customer = get_customer(db, order.customer_id)
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.quantity < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient product stock availability")
        
    # Automatic inventory reduction & order valuation calculations
    product.quantity -= order.quantity
    total = product.price * order.quantity
    
    new_order = models.Order(
        customer_id=order.customer_id,
        product_id=order.product_id,
        quantity=order.quantity,
        total_amount=total
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Restock inventory upon manual order cancellation
    product = get_product(db, db_order.product_id)
    if product:
        product.quantity += db_order.quantity
        
    db.delete(db_order)
    db.commit()
    return {"message": "Order cancelled and items restocked"}