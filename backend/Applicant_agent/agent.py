import os
import json
import uuid
from datetime import datetime
from sui import SuiClient, sync_execute

# Inicjalizacja klienta Sui
SUI_ENDPOINT = os.getenv("SUI_ENDPOINT", "https://fullnode.testnet.sui.io:443")
SUI_PACKAGE_ID = os.getenv("SUI_PACKAGE_ID")  # ID Twojego pakietu Move
SUI_MODULE = os.getenv("SUI_MODULE", "governance")
SUI_ADDRESS = os.getenv("SUI_ADDRESS")        # Adres Twojego portfela

client = SuiClient(SUI_ENDPOINT)

# Utwórz propozycję on-chain

def create_proposal_on_sui(text, total_voters):
    response = client.move_call(
        signer=SUI_ADDRESS,
        package_object=SUI_PACKAGE_ID,
        module=SUI_MODULE,
        function="create_proposal",
        args=[text, total_voters],
        gas_budget=5000000
    )
    return response.object_changes[0]['objectId'] if response.object_changes else None

# Oddaj głos (yes/no) on-chain

def vote_on_sui(proposal_id, vote_type):
    choice = True if vote_type == "yes" else False
    client.move_call(
        signer=SUI_ADDRESS,
        package_object=SUI_PACKAGE_ID,
        module=SUI_MODULE,
        function="vote",
        args=[proposal_id, choice],
        gas_budget=3000000
    )

# Pobierz dane propozycji

def get_proposal_data(proposal_id):
    response = client.get_object(proposal_id)
    return response.fields if response else None

# Zakończ propozycję jeśli spełniono kworum

def close_proposal_if_quorum(proposal_id):
    proposal = get_proposal_data(proposal_id)
    if not proposal:
        return

    yes = int(proposal['yes_votes'])
    no = int(proposal['no_votes'])
    total = int(proposal['total_voters'])
    voted = yes + no

    if voted / total >= 0.5:
        client.move_call(
            signer=SUI_ADDRESS,
            package_object=SUI_PACKAGE_ID,
            module=SUI_MODULE,
            function="close_proposal",
            args=[proposal_id],
            gas_budget=3000000
        )

# Dla testów lokalnych
if __name__ == "__main__":
    pid = create_proposal_on_sui("Czy zwiększyć budżet DAO?", 10)
    print(f"Proposal ID: {pid}")
    vote_on_sui(pid, "yes")
    vote_on_sui(pid, "no")
    data = get_proposal_data(pid)
    print(f"Dane propozycji: {data}")
    close_proposal_if_quorum(pid)
