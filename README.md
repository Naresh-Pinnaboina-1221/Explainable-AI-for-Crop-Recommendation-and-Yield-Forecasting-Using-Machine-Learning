#  Smart Crop Recommendation System

An AI-powered application that recommends the best crops for farmers in Andhra Pradesh based on:
1.  **Location**: District & Village queries (Nominatim API).
2.  **Soil Data**: Specific soil profiles for AP Districts.
3.  **Weather**: Real-time temperature & rainfall (OpenWeatherMap).
4.  **AI Analysis**:
    - **Prediction**: Random Forest Classifier (99% Accuracy).
    - **Explanation**: Cerebras Llama-3 LLM (Generates "Why" this crop is good).

---

##  Tech Stack
- **Backend**: FastAPI (Python), Scikit-learn, Pandas.
- **Frontend**: React.js, TailwindCSS, Leaflet Maps.
- **APIs**: OpenWeatherMap, OpenStreetMap (Nominatim), Cerebras AI.

---

##  Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js & npm** (Required for Frontend) -> [Download Here](://nodejshttps.org/)

### 1. Backend Setup (Python)
```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Fast Startup (Recommended)
Run the one-click launcher from the root directory:
```bash
python run.py
```
*This handles both backend and frontend automatically!*

### 3. Manual Frontend Setup
This project uses a lightweight **SPA architecture** (No Node.js/npm required).
To run it manually:
```bash
cd frontend
python -m http.server 5173
```
*The App will open at `http://localhost:5173`*

---

##  API Keys Configuration
The project uses the following keys (pre-configured in `backend/app/main.py`):
- **OpenWeatherMap**: `0a14e9a661b78d17bc0cff05801ae8b1`
- **Cerebras LLM**: `csk-yxj6y9dyc9h368tj2w4582nhn4w55vte4k8rcy2jnt68jt2d`

---

##  Project Structure
```
/
├── backend/
│   ├── app/
│   │   ├── main.py          # API Endpoints (FastAPI)
│   │   └── llm_service.py   # AI Logic (Cerebras)
│   ├── data/
│   │   └── ap_districts_data.json  # AP Soil Knowledge Base
│   ├── model/
│   │   └── crop_recommendation_model.pkl # Trained ML Model
│   └── requirements.txt
├── frontend/
│   └── src/                 # React Components
└── test_backend.py          # Verification Script
```

##  Testing
To verify the backend logic (Model + Weather + LLM):
```bash
python test_backend.py
```
Check `test_results.txt` for the detailed output.

