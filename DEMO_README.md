# 🏥 Clinical Intake MCP Server Demo

**Live Demo:** https://34fd8c802acf.ngrok-free.app

A Model Context Protocol (MCP) compliant server for managing patient mental health notes, designed for clinical intake assistance and patient information management.

## 🚀 Quick Start

### **Option 1: Interactive Web Demo**
Simply open `demo.html` in your browser for a beautiful, interactive demo interface.

### **Option 2: Command Line Demo**
```bash
python3 demo_script.py
```

### **Option 3: Direct API Testing**
```bash
# Check server status
curl https://34fd8c802acf.ngrok-free.app/status

# Search for anxiety symptoms
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/search_patient_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "anxiety", "case_sensitive": false}'
```

## 📋 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information and version |
| `/status` | GET | Server health and patient notes file status |
| `/tools` | GET | List available clinical tools |
| `/tools/search_patient_notes` | POST | Search patient notes for specific terms |
| `/tools/add_patient_note` | POST | Add new patient notes with timestamps |
| `/mcp` | GET | MCP protocol capabilities and schema |

## 🎯 Key Features

### **Patient Note Search**
- 🔍 Search through clinical notes by symptoms, patient names, or keywords
- 📊 Track standardized assessments (GAD-7, etc.)
- 💊 Monitor symptoms over time (anxiety, sleep, mood)

### **Clinical Management**
- 📝 Add new patient notes with automatic timestamps
- 🏥 Clinical intake assistance before appointments
- 📈 Progress tracking and treatment planning support

### **MCP Integration**
- 🔄 Model Context Protocol compliant
- 🤖 Ready for AI system integration
- 📡 RESTful API with JSON responses

## 🧪 Sample Use Cases

### **Clinical Intake Preparation**
```bash
# Search for a specific patient
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/search_patient_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "Jane Doe", "case_sensitive": false}'
```

### **Symptom Monitoring**
```bash
# Track anxiety symptoms
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/search_patient_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "anxiety", "case_sensitive": false}'

# Monitor sleep issues
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/search_patient_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "sleep", "case_sensitive": false}'
```

### **Assessment Review**
```bash
# Find GAD-7 scores
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/search_patient_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "GAD-7", "case_sensitive": false}'
```

### **Adding Progress Notes**
```bash
curl -X POST https://34fd8c802acf.ngrok-free.app/tools/add_patient_note \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Jane Doe",
    "note_content": "Patient shows improvement in anxiety management techniques. Reports better sleep quality.",
    "note_type": "progress"
  }'
```

## 📊 Sample Data

The demo includes patient data for **Jane Doe**:
- **Appointment Date:** 2025-07-24
- **Primary Concern:** Heightened anxiety (work-related stress)
- **GAD-7 Score:** 15 (moderate-severe anxiety)
- **Symptoms:** Sleep difficulties, feeling "on edge"
- **Goals:** Learning new coping strategies

## 🛠️ Technical Details

- **Framework:** Flask (Python 3.9+)
- **Protocol:** Model Context Protocol (MCP) v1.0.0
- **Storage:** Text-based patient notes
- **API:** RESTful JSON endpoints
- **Security:** ngrok tunnel with authentication

## 📁 Repository Structure

```
mcp_server/
├── server.py              # Main MCP server implementation
├── patient_notes.txt      # Sample patient data
├── requirements.txt       # Python dependencies
demo_script.py             # Automated demo script
demo.html                 # Interactive web demo
DEMO_README.md            # This documentation
```

## 🔗 Links

- **Live Demo:** https://34fd8c802acf.ngrok-free.app
- **Repository:** https://github.com/Talexandra-cyber/invoice-app-v2/tree/agentic-workflow
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Branch:** `agentic-workflow`

## 🏥 Clinical Applications

### **For Therapists & Clinicians:**
- Pre-appointment patient note review
- Symptom tracking across sessions
- Assessment score monitoring
- Treatment planning assistance

### **For Healthcare Systems:**
- Patient information management
- Clinical intake automation
- Integration with existing EMR systems
- AI-powered clinical assistance

---

**🎯 Ready to demo!** Use any of the three options above to showcase the Clinical Intake MCP Server functionality. 