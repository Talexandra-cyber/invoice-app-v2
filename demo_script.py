#!/usr/bin/env python3
"""
Clinical Intake MCP Server Demo Script
Showcases all functionality of the patient notes management system
"""

import requests
import json
import time
from datetime import datetime

# Your public demo URL
BASE_URL = "https://34fd8c802acf.ngrok-free.app"

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"🏥 {title}")
    print("="*60)

def print_result(endpoint, response, description):
    """Print formatted results"""
    print(f"\n📍 Endpoint: {endpoint}")
    print(f"📝 Description: {description}")
    print(f"✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print("📋 Response:")
            print(json.dumps(data, indent=2))
        except:
            print("📋 Response:", response.text[:200])
    else:
        print("❌ Error:", response.text)

def demo_clinical_assistant():
    """Run complete demo of Clinical Intake MCP Server"""
    
    print_header("CLINICAL INTAKE MCP SERVER DEMO")
    print(f"🌐 Demo URL: {BASE_URL}")
    print(f"⏰ Demo Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Server Info
    print_header("1. SERVER INFORMATION")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print_result("/", response, "Basic server information and version")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return
    
    # 2. Server Status
    print_header("2. SERVER STATUS & HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/status", timeout=10)
        print_result("/status", response, "Server health and patient notes file status")
    except Exception as e:
        print(f"❌ Status check failed: {e}")
    
    # 3. Available Tools
    print_header("3. AVAILABLE CLINICAL TOOLS")
    try:
        response = requests.get(f"{BASE_URL}/tools", timeout=10)
        print_result("/tools", response, "List of available clinical management tools")
    except Exception as e:
        print(f"❌ Tools check failed: {e}")
    
    # 4. Patient Notes Search - Anxiety
    print_header("4. CLINICAL SEARCH DEMO - ANXIETY")
    try:
        search_data = {"query": "anxiety", "case_sensitive": False}
        response = requests.post(f"{BASE_URL}/tools/search_patient_notes", 
                               json=search_data, timeout=10)
        print_result("/tools/search_patient_notes", response, 
                    "Searching patient notes for 'anxiety' symptoms")
    except Exception as e:
        print(f"❌ Anxiety search failed: {e}")
    
    # 5. Patient Notes Search - GAD-7
    print_header("5. CLINICAL ASSESSMENT SEARCH - GAD-7")
    try:
        search_data = {"query": "GAD-7", "case_sensitive": False}
        response = requests.post(f"{BASE_URL}/tools/search_patient_notes", 
                               json=search_data, timeout=10)
        print_result("/tools/search_patient_notes", response, 
                    "Searching for standardized assessment scores (GAD-7)")
    except Exception as e:
        print(f"❌ GAD-7 search failed: {e}")
    
    # 6. Patient Notes Search - Sleep Issues
    print_header("6. SYMPTOM TRACKING - SLEEP ISSUES")
    try:
        search_data = {"query": "sleep", "case_sensitive": False}
        response = requests.post(f"{BASE_URL}/tools/search_patient_notes", 
                               json=search_data, timeout=10)
        print_result("/tools/search_patient_notes", response, 
                    "Tracking sleep-related symptoms and concerns")
    except Exception as e:
        print(f"❌ Sleep search failed: {e}")
    
    # 7. Add New Patient Note Demo
    print_header("7. ADD NEW PATIENT NOTE DEMO")
    try:
        new_note = {
            "patient_name": "Demo Patient",
            "note_content": f"Demo note added at {datetime.now().strftime('%H:%M:%S')} - Patient shows improvement in coping strategies.",
            "note_type": "progress"
        }
        response = requests.post(f"{BASE_URL}/tools/add_patient_note", 
                               json=new_note, timeout=10)
        print_result("/tools/add_patient_note", response, 
                    "Adding a new progress note to patient records")
    except Exception as e:
        print(f"❌ Add note failed: {e}")
    
    # 8. MCP Protocol Info
    print_header("8. MCP PROTOCOL INFORMATION")
    try:
        response = requests.get(f"{BASE_URL}/mcp", timeout=10)
        print_result("/mcp", response, "Model Context Protocol (MCP) capabilities and schema")
    except Exception as e:
        print(f"❌ MCP info failed: {e}")
    
    # Demo Summary
    print_header("DEMO COMPLETE")
    print("🎯 Key Features Demonstrated:")
    print("   ✅ Patient notes search and retrieval")
    print("   ✅ Clinical assessment tracking (GAD-7)")
    print("   ✅ Symptom monitoring and search")
    print("   ✅ Adding new patient notes")
    print("   ✅ Server health monitoring")
    print("   ✅ MCP protocol compliance")
    print("\n🔗 Share this demo:")
    print(f"   Public URL: {BASE_URL}")
    print("   Repository: https://github.com/Talexandra-cyber/invoice-app-v2/tree/agentic-workflow")
    print("\n🏥 Use Cases:")
    print("   • Clinical intake assistance")
    print("   • Patient note management")
    print("   • Symptom tracking and search")
    print("   • Assessment score monitoring")
    print("   • Treatment planning support")

if __name__ == "__main__":
    demo_clinical_assistant() 