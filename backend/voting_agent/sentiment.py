from transformers import pipeline

sentiment_pipeline = pipeline("sentiment-analysis")

def analyze_sentiment(texts):
    results = sentiment_pipeline(texts)
    if not results:
        return 0.5, 0.0

    positive = sum(1 for r in results if r["label"] == "POSITIVE")
    confidence_sum = sum(r["score"] for r in results)

    score = positive / len(results)
    confidence = confidence_sum / len(results)

    return score, confidence