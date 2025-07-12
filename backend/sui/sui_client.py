from pysui import SyncClient, SuiConfig
from pysui.sui.sui_config import SuiConfig
from pysui.sui.sui_types import SuiString, SuiBoolean, SuiU64
import os


# Konfiguracja klienta
config = SuiConfig.default_config()
client = SyncClient(config)

PACKAGE_ID = "0xa20d316d00073b9dcd732cdd74784b17b02646581a6287c2b68809279fda66a5"       
DAO_ID = "0x762a068cbcb8dfb76fef3f1b4219a33ead3dfd294b25794e11d7aa0a6170b72e"            

### ---- DAO OPERATIONS ---- ###

def get_dao_state(dao_id: str):
    response = client.get_object(object_id=dao_id)
    dao_content = response.parsed_data
    print("DAO:", dao_content)
    return dao_content

def create_proposal(dao_id: str, title: str, description: str):
    tx = SuiTransaction(client)
    tx.move_call(
        target=f"{PACKAGE_ID}::dao::create_proposal",
        arguments=[
            SuiString(dao_id),
            SuiString(title),
            SuiString(description)
        ],
        gas_budget=100_000_000
    )
    result = tx.execute()
    print("✅ Proposal created:", result)

def vote_on_proposal(dao_id: str, proposal_id: int, in_favor: bool):
    tx = SuiTransaction(client)
    tx.move_call(
        target=f"{PACKAGE_ID}::dao::vote",
        arguments=[
            SuiString(dao_id),
            SuiU64(proposal_id),
            SuiBoolean(in_favor)
        ],
        gas_budget=100_000_000
    )
    result = tx.execute()
    print("✅ Voted:", result)

### ---- MOCK AGENT DECISION LOGIC ---- ###

def mock_sentiment_analysis() -> bool:
    # Tu wstaw analizę NLP — tu tylko symulacja
    return True  # np. >60% pozytywnego sentymentu

def agent_decision_loop():
    dao = get_dao_state(DAO_ID)

    # Przykład: głosowanie na ostatnią propozycję
    proposals = dao.get('proposals', [])
    if not proposals:
        print("Brak propozycji.")
        return

    latest = proposals[-1]
    proposal_id = int(latest['id'])

    if mock_sentiment_analysis():
        print(f"Głosuję ZA propozycją {proposal_id}")
        vote_on_proposal(DAO_ID, proposal_id, True)
    else:
        print(f"Głosuję PRZECIW propozycji {proposal_id}")
        vote_on_proposal(DAO_ID, proposal_id, False)

### ---- ENTRY POINT ---- ###

if __name__ == "__main__":
    agent_decision_loop()