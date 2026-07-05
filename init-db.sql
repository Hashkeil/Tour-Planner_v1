-- Initialize Tour Planner Database
-- This script creates the necessary database if it doesn't exist

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE tourplanner' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tourplanner')\gexec

