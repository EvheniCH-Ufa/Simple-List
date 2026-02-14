from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import psycopg2
from psycopg2 import sql, Error
import json

app = FastAPI()

print("⭐ Начало загрузки app.py ⭐")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройки БД
#DATABASE_URL: postgresql://simple_user:simple_password@db:5432/simple_list_db
#test: ["CMD-SHELL", "pg_isready -U simple_user -d simple_list_db"]

DB_CONFIG = {
    "host": "db",
    "database": "simple_list_db",
    "user": "simple_user",
    "password": "simple_password",
    "port": "5432"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def init_database():

    print("init_database")

    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()

            # proverjaem, est li tablica items
            cur.execute("""
            SELECT EXISTS (SELECT FROM information_schema.tables 
                    WHERE table_name = 'items'
                )
            """)
            table_exist = cur.fetchone()[0]

            if not table_exist:
                # Создаем таблицу если её нет и правильными колонками
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS items (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                print("Table 'items' created with columns: id, name, description")
            else:
                cur.execute("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'items'                
                """)
            columns = [row[0] for row in cur.fetchall()]
            print(f"Existing columns in 'items': {columns}")

            # Если есть колонка 'text' вместо 'name', переименуем
        #    if 'text' in columns and 'name' not in columns:
         #       cur.execute("ALTER TABLE items RENAME COLUMN text TO name")
          #      print(f"Renamed column 'text' to 'name'") 

            # Проверяем есть ли данные
            cur.execute("SELECT COUNT(*) FROM items")
            count = cur.fetchone()[0]
            
            if count == 0:
                # Добавляем тестовые данные
                cur.execute("""
                    INSERT INTO items (name, description) VALUES
                    ('Первая запись', 'Это первая тестовая запись'),
                    ('Вторая запись', 'Это вторая тестовая запись'),
                    ('Третья запись', 'Это третья тестовая запись')
                """)
                print(f"Added {cur.rowcount} sample items")
            
            conn.commit()
            cur.close()
            conn.close()
            print("Database initialized successfully")
        except Error as e:
            print(f"Database initialization error: {e}")

# Инициализируем БД при старте
init_database()

@app.get("/")
async def root():
    return {"message": "Simple List API", "version": "1.0"}


@app.delete("/api/delete/{item_id}")
def delete_item(item_id: int):
    conn = get_db_connection()
    if not conn:
       # raise HTTPException(status_code=500, detail="Database connection failed")
        return {
            "status": "False",
            "message": "Database connection failed"
        }

    try:
        cur = conn.cursor()

        query = sql.SQL("DELETE FROM items WHERE id = {}").format(
            sql.Literal(item_id)  # Автоматическое экранирование
        )
        cur.execute(query)
        rows_deleted = cur.rowcount  # Сколько строк удалилось
        
        conn.commit()
        cur.close()
        conn.close()
        
        if rows_deleted == 0:
            # Ничего не удалили - такой записи не было
            return {
                "status": "False",
                "message": "Item not found (nothing to delete)",
                "id": item_id,
                "rows_deleted": rows_deleted
            }
        else:
            # Удалили успешно
            return {
                "status": "True",
                "message": "Item deleted successfully",
                "id": item_id,
                "rows_deleted": rows_deleted
            }
    except Error as e:
        return {"status": "Error", "error": str(e), "id": item_id}



@app.get("/api/data")
async def get_data():
    conn = get_db_connection()
    if not conn:
        return {
            "items": [
                {"id": 0, "name": "Запись None", "description": "Database connection failed"}            ],
            "count": 1,
            "note": "Database connection failed"
        }
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, description FROM items ORDER BY id")
        rows = cur.fetchall()
        
        items = []
        for row in rows:
            items.append({
                "id": row[0],
                "name": row[1],
                "description": row[2] or ""
            })
        
        cur.close()
        conn.close()
        
        return {"items": items, "count": len(items), "source": "PostgreSQL"}
    except Error as e:
        return {"error": str(e), "items": [], "count": 0}

@app.post("/api/items")
async def create_item(item: dict):
    name = item.get("name", "").strip()
    description = item.get("description", "").strip()
    
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO items (name, description) VALUES (%s, %s) RETURNING id",
            (name, description)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "message": "Item created successfully",
            "id": new_id,
            "name": name,
            "description": description
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/edit")
async def edit_item(item: dict):
    id = item.get("id", 0)
    if id is not None:
        id = int(str(id).strip()) if str(id).strip() else 0
    else:
        id = 0 

    name = item.get("name", "").strip()
    description = item.get("description", "").strip()
    
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # тут запрашиваем этот ID если есть, то меняем
    try:
        print("+++ Zashli v try +++")

        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM items WHERE id = %s",
            (id,) 
        )

        print("+++ Vypolnili SELECT +++")

        row = cur.fetchone()
        if not row:
            # Ничего не выбрали - такой записи не было
            return {
                "status": "False",
                "message": "Item not found (nothing to edit)",
                "id": item_id,
                "rows_editing": 0
            }

        print("+++ SELECT not 0 +++")

        cur.execute(
            "UPDATE items SET name = %s, description = %s WHERE id = %s RETURNING id",
            (name, description, id) 
        )

        print("+++ UPDATE name = %s, description = %s WHERE id = %s +++", (name, description, id))

        rows = cur.rowcount
        row = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        if not row or rows == 0:
            return {
                "status": "False",
                "message": "Error in processing query to DB",
                "id": 0,
                "rows_editing": 0
            }

        return {
            "status": "True",
            "message": "Item is editing in DB",
            "id": id,
            "rows_editing": rows
            }
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    conn = get_db_connection()
    if conn:
        conn.close()
        return {"status": "healthy", "database": "connected"}
    else:
        return {"status": "degraded", "database": "disconnected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)