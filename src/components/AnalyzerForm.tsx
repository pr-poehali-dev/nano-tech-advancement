import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

type SentimentResult = {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
};

export default function AnalyzerForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Ошибка анализа:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentInfo = () => {
    if (!result) return null;

    const info = {
      positive: {
        label: "Позитивный",
        icon: "SmilePlus" as const,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      negative: {
        label: "Негативный",
        icon: "Frown" as const,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      neutral: {
        label: "Нейтральный",
        icon: "Minus" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      },
    };

    return info[result.sentiment];
  };

  const sentimentInfo = getSentimentInfo();

  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-neutral-900">
          Анализатор тональности
        </h2>
        <p className="text-center text-neutral-600 mb-12">
          Вставьте текст для мгновенного анализа эмоционального окраса
        </p>

        <Card className="p-6 shadow-lg">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте сюда текст для анализа... Например, отзыв клиента, комментарий или сообщение."
            className="min-h-[200px] text-base mb-4 resize-none"
          />

          <Button
            onClick={analyzeSentiment}
            disabled={!text.trim() || loading}
            className="w-full bg-black text-white hover:bg-neutral-800 h-12 text-base"
          >
            {loading ? "Анализирую..." : "Определить тональность"}
          </Button>

          {result && sentimentInfo && (
            <div
              className={`mt-6 p-6 rounded-lg ${sentimentInfo.bgColor} border-2 border-${sentimentInfo.color.replace("text-", "")}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  name={sentimentInfo.icon}
                  size={32}
                  className={sentimentInfo.color}
                />
                <div>
                  <h3 className={`text-2xl font-bold ${sentimentInfo.color}`}>
                    {sentimentInfo.label}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Уверенность: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
