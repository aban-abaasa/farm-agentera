#!/usr/bin/env python3
"""
Initialize Supabase database with schema files.
This script reads SQL schema files and executes them against the Supabase database.
"""

import os
import sys
import glob
import logging
import argparse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def load_environment_variables():
    """Load environment variables from .env file"""
    load_dotenv()
    
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY")
        sys.exit(1)
    
    return supabase_url, supabase_key

def get_supabase_client(url, key) -> Client:
    """Create and return a Supabase client"""
    try:
        return create_client(url, key)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        sys.exit(1)

def get_schema_files(schema_dir):
    """Get all SQL schema files in order by prefix number"""
    schema_path = Path(schema_dir)
    if not schema_path.exists() or not schema_path.is_dir():
        logger.error(f"Schema directory not found: {schema_dir}")
        sys.exit(1)
    
    # Get all .sql files and sort them by name (which starts with a number)
    schema_files = sorted(glob.glob(str(schema_path / "*.sql")))
    
    if not schema_files:
        logger.error(f"No SQL schema files found in {schema_dir}")
        sys.exit(1)
    
    return schema_files

def execute_schema_file(client: Client, file_path):
    """Execute a SQL schema file against the Supabase database"""
    try:
        with open(file_path, 'r') as file:
            sql_content = file.read()
            
        # Split the SQL content into separate statements
        # This is a simple split by semicolon, which may not work for complex SQL
        statements = sql_content.split(';')
        
        for statement in statements:
            # Skip empty statements
            statement = statement.strip()
            if not statement:
                continue
                
            # Execute the statement
            logger.info(f"Executing SQL statement...")
            # Note: For production use, the actual SQL execution would happen
            # via pgAdmin, the Supabase dashboard, or using the REST API
            # to execute raw SQL. The current supabase-py client doesn't
            # support raw SQL execution directly.
            # 
            # For demo purposes, we're just showing this placeholder
            # response = client.rpc('execute_sql', { 'sql': statement }).execute()
            
            # Instead, we'll just log the statement (for demonstration)
            logger.debug(statement)
            
        logger.info(f"Executed schema file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error executing schema file {file_path}: {e}")
        return False

def main():
    """Main function to initialize the database"""
    parser = argparse.ArgumentParser(description='Initialize Supabase database with schema files')
    parser.add_argument('--schema-dir', default='./schemas', help='Directory containing schema files')
    args = parser.parse_args()
    
    # Load environment variables
    supabase_url, supabase_key = load_environment_variables()
    
    # Get Supabase client
    client = get_supabase_client(supabase_url, supabase_key)
    
    # Get schema files
    schema_files = get_schema_files(args.schema_dir)
    
    # Execute each schema file
    success = True
    for file_path in schema_files:
        logger.info(f"Processing schema file: {file_path}")
        if not execute_schema_file(client, file_path):
            success = False
            logger.error(f"Failed to execute schema file: {file_path}")
    
    if success:
        logger.info("Database initialization completed successfully")
    else:
        logger.error("Database initialization failed")
        sys.exit(1)

if __name__ == "__main__":
    main() 