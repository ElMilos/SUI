# plik: sui_interface.py
import json
import uuid
from datetime import datetime

# Ścieżka do pliku lokalnej bazy danych
PROPOSAL_LOG = "proposals.json"

# Inicjalizacja pliku jeśli nie istnieje
def init_storage():
    try:
        with open(PROPOSAL_LOG, "r") as f:
            json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        with open(PROPOSAL_LOG, "w") as f:
            json.dump({}, f)

# Zapisz stan do pliku
def save_proposal_data(data):
    with open(PROPOSAL_LOG, "w") as f:
        json.dump(data, f, indent=2)

# Wczytaj stan
def load_proposal_data():
    with open(PROPOSAL_LOG, "r") as f:
        return json.load(f)

# Utwórz nową propozycję w Sui (symulacja / UUID jako ID obiektu)
def create_proposal_on_sui(text):
    init_storage()
    data = load_proposal_data()
    object_id = str(uuid.uuid4())
    data[object_id] = {
        "text": text,
        "created_at": datetime.utcnow().isoformat(),
        "votes": {"yes": 0, "no": 0},
        "closed": False
    }
    save_proposal_data(data)
    return object_id

# Zarejestruj głos
def vote_on_sui(object_id, vote_type):
    init_storage()
    data = load_proposal_data()
    if object_id in data and not data[object_id].get("closed"):
        if vote_type in ("yes", "no"):
            data[object_id]["votes"][vote_type] += 1
            save_proposal_data(data)

# Zamknij głosowanie (symulacja końca)
def close_proposal_on_sui(object_id):
    init_storage()
    data = load_proposal_data()
    if object_id in data:
        data[object_id]["closed"] = True
        save_proposal_data(data)

# Dla testów
if __name__ == "__main__":
    oid = create_proposal_on_sui("Test proposal")
    vote_on_sui(oid, "yes")
    vote_on_sui(oid, "no")
    close_proposal_on_sui(oid)
    print(load_proposal_data()[oid])