from discord_fetcher import fetch_messages
from sentiment import analyze_sentiment
import json

def main():
    texts = fetch_messages()  # <- tutaj pobierasz z Discorda
    score, confidence = analyze_sentiment(texts)

    result = {
        "score": score,
        "confidence": confidence,
        "messages": texts
    }
    print(json.dumps(result))  # <- TypeScript to odczyta

if __name__ == "__main__":
    main()
