            # Удаляем таблицу если существует
            cur.execute("DROP TABLE IF EXISTS items CASCADE")
            print("DROP TABL")

            # Создаем новую с правильной структурой
            cur.execute("""
                CREATE TABLE items (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("Create TABL")

            conn.commit()
            cur.close()
            conn.close()
            print("✅ Table recreated successfully")           
