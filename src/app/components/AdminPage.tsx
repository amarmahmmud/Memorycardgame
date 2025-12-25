import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Pair {
  id: string;
  arabicWord: string;
  amharicWord: string;
  imageUrl?: string | null;
}

interface Level {
  id: string;
  name: string;
  pairs: Pair[];
}

interface AdminPageProps {
  apiUrl: string;
  onBack: () => void;
}

export function AdminPage({ apiUrl, onBack }: AdminPageProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [newPair, setNewPair] = useState<Pair>({
    id: "",
    arabicWord: "",
    amharicWord: "",
    imageUrl: null,
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${apiUrl}/levels`);
      const data = await response.json();
      setLevels(data.levels || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    }
  };

  const handleCreateLevel = async () => {
    const newLevel: Level = {
      id: String(levels.length + 1),
      name: `ደረጃ ${levels.length + 1}`,
      pairs: [],
    };
    setEditingLevel(newLevel);
  };

  const handleSaveLevel = async () => {
    if (!editingLevel) return;

    if (editingLevel.pairs.length === 0) {
      toast.error("እባክዎን ቢያንስ አንድ ጥንድ ይጨምሩ");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLevel),
      });

      if (response.ok) {
        toast.success("ደረጃ ተቀምጧል!");
        fetchLevels();
        setEditingLevel(null);
      } else {
        toast.error("Failed to save level");
      }
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Failed to save level");
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    try {
      const response = await fetch(`${apiUrl}/levels/${levelId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("ደረጃ ተሰርዟል!");
        fetchLevels();
      } else {
        toast.error("Failed to delete level");
      }
    } catch (error) {
      console.error("Error deleting level:", error);
      toast.error("Failed to delete level");
    }
  };

  const handleReinitializeDemo = async () => {
    try {
      // First clear all levels
      await fetch(`${apiUrl}/levels`, {
        method: "DELETE",
      });
      
      // Then initialize demo data
      const response = await fetch(`${apiUrl}/init-demo`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("የማሳያ ውሂብ እንደገና ተጀመረ!");
        fetchLevels();
      } else {
        toast.error("Failed to reinitialize demo data");
      }
    } catch (error) {
      console.error("Error reinitializing demo:", error);
      toast.error("Failed to reinitialize demo data");
    }
  };

  const handleAddPair = () => {
    if (!newPair.arabicWord || !newPair.amharicWord) {
      toast.error("እባክዎን ሁለቱንም ቃላት ያስገቡ");
      return;
    }

    const pair: Pair = {
      ...newPair,
      id: `pair${Date.now()}`,
    };

    setEditingLevel((prev) =>
      prev ? { ...prev, pairs: [...prev.pairs, pair] } : null
    );
    setNewPair({ id: "", arabicWord: "", amharicWord: "", imageUrl: null });
    toast.success("ጥንድ ታክሏል!");
  };

  const handleRemovePair = (pairId: string) => {
    setEditingLevel((prev) =>
      prev
        ? { ...prev, pairs: prev.pairs.filter((p) => p.id !== pairId) }
        : null
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo, we'll use a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPair((prev) => ({
        ...prev,
        imageUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  if (editingLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>ደረጃ ያርትዑ: {editingLevel.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  የደረጃ ስም
                </label>
                <Input
                  value={editingLevel.name}
                  onChange={(e) =>
                    setEditingLevel({ ...editingLevel, name: e.target.value })
                  }
                />
              </div>

              {/* Add Pair Form */}
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h3 className="font-medium">አዲስ ጥንድ ጨምር</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">የአረብኛ ቃል</label>
                    <Input
                      dir="rtl"
                      placeholder="مثال"
                      value={newPair.arabicWord}
                      onChange={(e) =>
                        setNewPair({ ...newPair, arabicWord: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">የአማርኛ ቃል</label>
                    <Input
                      placeholder="ምሳሌ"
                      value={newPair.amharicWord}
                      onChange={(e) =>
                        setNewPair({ ...newPair, amharicWord: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    ምስል (አማራጭ)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {newPair.imageUrl && (
                    <img
                      src={newPair.imageUrl}
                      alt="Preview"
                      className="mt-2 w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>

                <Button onClick={handleAddPair} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  ጥንድ ጨምር
                </Button>
              </div>

              {/* Pairs List */}
              <div className="space-y-2">
                <h3 className="font-medium">ጥንዶች ({editingLevel.pairs.length})</h3>
                {editingLevel.pairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex gap-4">
                      <span className="font-medium" dir="rtl">
                        {pair.arabicWord}
                      </span>
                      <span>↔️</span>
                      <span>{pair.amharicWord}</span>
                      {pair.imageUrl && (
                        <img
                          src={pair.imageUrl}
                          alt="Pair"
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePair(pair.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={handleSaveLevel} className="flex-1">
                  ቀምጥ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingLevel(null)}
                  className="flex-1"
                >
                  ሰርዝ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl">የአስተዳደር ገጽ</h1>
          <Button onClick={onBack} variant="outline">
            ተመለስ
          </Button>
        </div>

        <Button onClick={handleCreateLevel} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          አዲስ ደረጃ ፍጠር
        </Button>

        <div className="grid gap-4">
          {levels.map((level) => (
            <Card key={level.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-medium">{level.name}</h3>
                  <p className="text-sm text-gray-600">
                    {level.pairs.length} ጥንዶች
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditingLevel(level)}
                    variant="outline"
                    size="sm"
                  >
                    አርትዕ
                  </Button>
                  <Button
                    onClick={() => handleDeleteLevel(level.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleReinitializeDemo} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          የማሳያ ውሂብ እንደገና ተጀመር
        </Button>
      </div>
    </div>
  );
}