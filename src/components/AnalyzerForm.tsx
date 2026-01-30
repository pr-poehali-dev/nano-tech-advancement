import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LineResult = {
  line: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
};

export default function AnalyzerForm() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<LineResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResults([]);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const response = await fetch(
        "https://functions.poehali.dev/87cb021e-3df1-4f71-b0d8-4df60822b25e",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines }),
        }
      );

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Ошибка анализа:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentInfo = (sentiment: string) => {
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

    return info[sentiment as keyof typeof info];
  };

  const getStats = () => {
    const total = results.length;
    const positive = results.filter((r) => r.sentiment === "positive").length;
    const negative = results.filter((r) => r.sentiment === "negative").length;
    const neutral = results.filter((r) => r.sentiment === "neutral").length;

    return { total, positive, negative, neutral };
  };

  const stats = getStats();

  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-neutral-900">
          Анализатор тональности
        </h2>
        <p className="text-center text-neutral-600 mb-12">
          Загрузите текстовый файл — каждая строка будет проанализирована
          отдельно
        </p>

        <Card className="p-6 shadow-lg mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Icon name="Upload" size={48} className="text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {file ? file.name : "Нажмите, чтобы загрузить файл"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Поддерживаются форматы: .txt, .doc, .docx
                </p>
              </div>
            </label>
          </div>

          <Button
            onClick={analyzeFile}
            disabled={!file || loading}
            className="w-full bg-black text-white hover:bg-neutral-800 h-12 text-base"
          >
            {loading ? "Анализирую..." : "Анализировать файл"}
          </Button>
        </Card>

        {results.length > 0 && (
          <>
            <Card className="p-6 shadow-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Статистика</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-600">Всего строк</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.positive}
                  </p>
                  <p className="text-sm text-gray-600">Позитивных</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">
                    {stats.negative}
                  </p>
                  <p className="text-sm text-gray-600">Негативных</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">
                    {stats.neutral}
                  </p>
                  <p className="text-sm text-gray-600">Нейтральных</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Результаты анализа</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Текст</TableHead>
                      <TableHead className="w-40">Тональность</TableHead>
                      <TableHead className="w-32 text-right">
                        Уверенность
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => {
                      const sentimentInfo = getSentimentInfo(result.sentiment);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {result.line}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon
                                name={sentimentInfo.icon}
                                size={20}
                                className={sentimentInfo.color}
                              />
                              <span className={sentimentInfo.color}>
                                {sentimentInfo.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(result.confidence * 100)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
