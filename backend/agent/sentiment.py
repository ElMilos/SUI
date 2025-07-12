from transformers import pipeline

sentiment_pipeline = pipeline("sentiment-analysis")

def analyze_sentiment(texts):
    results = sentiment_pipeline(texts)
    positive = sum(1 for r in results if r["label"] == "POSITIVE")
    score = positive / len(results)
    return score