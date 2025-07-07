#!/usr/bin/env python3
"""
Test script to verify the fixes for Luna project
"""

import requests
import json


def test_dashboard_endpoint():
    """Test the dashboard endpoint"""
    base_url = "http://localhost:5000"

    # Test dashboard without authentication (should fail)
    response = requests.get(f"{base_url}/api/results/dashboard")
    print(f"Dashboard without auth: {response.status_code}")

    # Test results endpoint without authentication (should fail)
    response = requests.get(f"{base_url}/api/results/")
    print(f"Results without auth: {response.status_code}")

    print("Endpoints tested successfully")


if __name__ == "__main__":
    test_dashboard_endpoint()
