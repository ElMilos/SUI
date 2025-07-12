import os
import requests
import json

class SuiClient:
    def __init__(self, endpoint=None):
        self.endpoint = endpoint or os.getenv("SUI_ENDPOINT", "https://fullnode.testnet.sui.io:443")

    def move_call(self, signer, package_object, module, function, args, gas_budget=5000000):
        """
        Przykładowa funkcja wykonująca wywołanie Move VM.
        W praktyce trzeba znać dokładny format JSON-RPC dla Sui.
        """
        payload = {
            "jsonrpc": "2.0",
            "method": "sui_moveCall",
            "params": [{
                "signer": signer,
                "packageObjectId": package_object,
                "module": module,
                "function": function,
                "typeArguments": [],
                "arguments": args,
                "gasBudget": gas_budget
            }],
            "id": 1
        }
        response = requests.post(self.endpoint, json=payload)
        if response.status_code == 200:
            return response.json().get('result')
        else:
            raise Exception(f"Sui RPC error: {response.status_code} {response.text}")

    def get_object(self, object_id):
        """
        Pobierz stan obiektu z blockchainu Sui.
        """
        payload = {
            "jsonrpc": "2.0",
            "method": "sui_getObject",
            "params": [object_id],
            "id": 1
        }
        response = requests.post(self.endpoint, json=payload)
        if response.status_code == 200:
            return response.json().get('result')
        else:
            raise Exception(f"Sui RPC error: {response.status_code} {response.text}")

def sync_execute(coro):
    """
    Helper do wykonywania async funkcji synchronicznie, jeśli potrzeba.
    Tu na razie prosta implementacja, bo nasz klient jest synchroniczny.
    """
    import asyncio
    return asyncio.run(coro)
