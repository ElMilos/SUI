from discord_fetcher import fetch_messages
from sentiment import analyze_sentiment
from sui import vote_on_proposal

def main():
    print("🔍 Pobieranie opinii...")
    texts = fetch_messages()
    print(f"✅ Pobrano {len(texts)} wiadomości.")
    for text in texts:
        print(f"- {text}")
    print("🧠 Analiza sentymentu...")
    score = analyze_sentiment(texts)
    print(f"Sentyment społeczności: {score:.2f}")

    if score >= 0.6:
        print("✅ Głosujemy ZA.")
        #vote_on_proposal("<PROPOSAL_ID>", "yes")
    else:
        print("❌ Głosujemy PRZECIW.")
        #vote_on_proposal("<PROPOSAL_ID>", "no")
#if name == "main":
main()