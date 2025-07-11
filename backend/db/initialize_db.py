#!/usr/bin/env python3
"""
Database initialization script for AGRI-TECH platform.
This script reads and executes SQL files in the schemas directory in the correct order.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters from environment variables
DB_URL = os.getenv('DATABASE_URL')

# If no DATABASE_URL is provided, try to construct it from individual parameters
if not DB_URL:
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    
    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        print("Error: Database connection parameters not found in environment variables.")
        print("Please provide either DATABASE_URL or all of: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD")
        sys.exit(1)
    
    DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Order of schema files to execute
SCHEMA_FILES_ORDER = [
    "01_auth_tables.sql",
    "02_resources_tables.sql",
    "03_events_tables.sql",
    "04_marketplace_tables.sql",
    "05_community_tables.sql"
]

def execute_sql_file(conn, file_path):
    """Execute an SQL file against the database."""
    try:
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        with conn.cursor() as cur:
            print(f"Executing {file_path}...")
            cur.execute(sql_content)
        
        conn.commit()
        print(f"Successfully executed {file_path}")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error executing {file_path}: {str(e)}")
        return False

def initialize_database():
    """Initialize the database by executing schema files in order."""
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(DB_URL)
        print("Connected successfully!")
        
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        schemas_dir = os.path.join(script_dir, "schemas")
        
        if not os.path.exists(schemas_dir):
            print(f"Error: Schemas directory not found at {schemas_dir}")
            return False
        
        # Execute schema files in order
        all_successful = True
        for schema_file in SCHEMA_FILES_ORDER:
            file_path = os.path.join(schemas_dir, schema_file)
            if os.path.exists(file_path):
                if not execute_sql_file(conn, file_path):
                    all_successful = False
            else:
                print(f"Warning: Schema file {schema_file} not found at {file_path}")
                all_successful = False
        
        # Execute additional SQL files if needed
        additional_sql_files = [
            os.path.join(script_dir, "add_is_deleted_column.sql"),
        ]
        
        for sql_file in additional_sql_files:
            if os.path.exists(sql_file):
                if not execute_sql_file(conn, sql_file):
                    all_successful = False
            else:
                print(f"Warning: Additional SQL file {sql_file} not found")
        
        conn.close()
        
        if all_successful:
            print("Database initialization completed successfully!")
        else:
            print("Database initialization completed with some errors. Check the logs above.")
        
        return all_successful
    
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        return False

if __name__ == "__main__":
    success = initialize_database()
    sys.exit(0 if success else 1) 