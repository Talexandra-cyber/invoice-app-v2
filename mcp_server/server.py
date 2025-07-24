#!/usr/bin/env python3
"""
MCP-Style Server for Patient Notes Management (Python 3.9 Compatible)
A simplified server that demonstrates MCP-like functionality using Flask.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("patient-notes-server")

# Create Flask app
app = Flask(__name__)

# Path to the patient notes file
NOTES_FILE = Path(__file__).parent / "patient_notes.txt"

# Server info
SERVER_INFO = {
    "name": "patient-notes-server",
    "version": "0.1.0",
    "description": "MCP-style server for managing patient mental health notes"
}

# MCP Protocol response
MCP_CAPABILITIES = {
    "protocol_version": "1.0.0",
    "server_info": SERVER_INFO,
    "capabilities": {
        "resources": True,
        "tools": True,
        "search": True
    },
    "resources": [
        {
            "uri": f"file://{NOTES_FILE}",
            "name": "Patient Notes",
            "description": "Collection of patient mental health notes",
            "mimeType": "text/plain"
        }
    ],
    "tools": [
        {
            "name": "search_patient_notes",
            "description": "Search through patient notes for specific terms",
            "parameters": {
                "query": {"type": "string", "description": "Search term"},
                "case_sensitive": {"type": "boolean", "description": "Case sensitive search", "default": False}
            }
        },
        {
            "name": "add_patient_note",
            "description": "Add a new patient note",
            "parameters": {
                "patient_name": {"type": "string", "description": "Patient name"},
                "note_content": {"type": "string", "description": "Note content"},
                "note_type": {"type": "string", "description": "Type of note", "default": "general"}
            }
        }
    ]
}


def read_patient_notes() -> str:
    """Read the patient notes file."""
    try:
        return NOTES_FILE.read_text(encoding="utf-8")
    except FileNotFoundError:
        return "No patient notes found."
    except Exception as e:
        logger.error(f"Error reading patient notes: {e}")
        return f"Error reading notes: {str(e)}"


def search_in_notes(query: str, case_sensitive: bool = False) -> List[str]:
    """Search for a query in patient notes."""
    try:
        notes_content = NOTES_FILE.read_text(encoding="utf-8")
        
        if not case_sensitive:
            search_content = notes_content.lower()
            search_query = query.lower()
        else:
            search_content = notes_content
            search_query = query
        
        if search_query in search_content:
            lines = notes_content.split('\n')
            matching_lines = []
            for i, line in enumerate(lines, 1):
                check_line = line.lower() if not case_sensitive else line
                if search_query in check_line:
                    matching_lines.append(f"Line {i}: {line}")
            return matching_lines
        else:
            return []
    except Exception as e:
        logger.error(f"Error searching notes: {e}")
        return [f"Error: {str(e)}"]


def add_patient_note(patient_name: str, note_content: str, note_type: str = "general") -> bool:
    """Add a new patient note."""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Format new note
        new_note = f"\n\n--- NEW ENTRY ({timestamp}) ---\n"
        new_note += f"Patient Name: {patient_name}\n"
        new_note += f"Type: {note_type}\n"
        new_note += f"Note: {note_content}\n"
        new_note += "---\n"
        
        # Append to file
        with open(NOTES_FILE, "a", encoding="utf-8") as f:
            f.write(new_note)
        
        return True
    except Exception as e:
        logger.error(f"Error adding note: {e}")
        return False


@app.route("/", methods=["GET"])
def server_info():
    """Get server information."""
    return jsonify(SERVER_INFO)


@app.route("/mcp", methods=["GET"])
def mcp_endpoint():
    """MCP endpoint for Cursor integration."""
    return jsonify(MCP_CAPABILITIES)


@app.route("/resources", methods=["GET"])
def list_resources():
    """List available resources (patient notes)."""
    return jsonify({
        "resources": [
            {
                "uri": f"file://{NOTES_FILE}",
                "name": "Patient Notes",
                "description": "Collection of patient mental health notes",
                "mimeType": "text/plain"
            }
        ]
    })


@app.route("/resources/patient_notes", methods=["GET"])
def read_resource():
    """Read the patient notes resource."""
    content = read_patient_notes()
    return jsonify({
        "content": content,
        "mimeType": "text/plain"
    })


@app.route("/tools", methods=["GET"])
def list_tools():
    """List available tools."""
    return jsonify({
        "tools": [
            {
                "name": "search_patient_notes",
                "description": "Search through patient notes for specific terms",
                "parameters": {
                    "query": {"type": "string", "description": "Search term"},
                    "case_sensitive": {"type": "boolean", "description": "Case sensitive search", "default": False}
                }
            },
            {
                "name": "add_patient_note",
                "description": "Add a new patient note",
                "parameters": {
                    "patient_name": {"type": "string", "description": "Patient name"},
                    "note_content": {"type": "string", "description": "Note content"},
                    "note_type": {"type": "string", "description": "Type of note", "default": "general"}
                }
            }
        ]
    })


@app.route("/tools/search_patient_notes", methods=["POST"])
def search_notes_tool():
    """Search patient notes tool."""
    data = request.get_json()
    query = data.get("query", "")
    case_sensitive = data.get("case_sensitive", False)
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    results = search_in_notes(query, case_sensitive)
    
    return jsonify({
        "query": query,
        "case_sensitive": case_sensitive,
        "matches_found": len(results),
        "results": results
    })


@app.route("/tools/add_patient_note", methods=["POST"])
def add_note_tool():
    """Add patient note tool."""
    data = request.get_json()
    patient_name = data.get("patient_name", "")
    note_content = data.get("note_content", "")
    note_type = data.get("note_type", "general")
    
    if not patient_name or not note_content:
        return jsonify({"error": "patient_name and note_content are required"}), 400
    
    success = add_patient_note(patient_name, note_content, note_type)
    
    if success:
        return jsonify({
            "message": f"Successfully added note for {patient_name}",
            "patient_name": patient_name,
            "note_type": note_type
        })
    else:
        return jsonify({"error": "Failed to add note"}), 500


@app.route("/status", methods=["GET"])
def server_status():
    """Get server status."""
    notes_exist = NOTES_FILE.exists()
    notes_size = NOTES_FILE.stat().st_size if notes_exist else 0
    
    return jsonify({
        "server": SERVER_INFO,
        "status": "running",
        "notes_file_exists": notes_exist,
        "notes_file_size": notes_size,
        "timestamp": datetime.now().isoformat()
    })


if __name__ == "__main__":
    logger.info(f"Starting {SERVER_INFO['name']} v{SERVER_INFO['version']}")
    logger.info(f"Patient notes file: {NOTES_FILE}")
    
    # Check if notes file exists
    if NOTES_FILE.exists():
        logger.info("Patient notes file found")
    else:
        logger.warning("Patient notes file not found")
    
    # Run the server (disable debug mode to prevent hanging)
    app.run(host="127.0.0.1", port=3001, debug=False, threaded=True) 