import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Tab = "companies" | "trainTypes" | "formations";

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("companies");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedTrainTypeId, setSelectedTrainTypeId] = useState<number | null>(null);

  // Companies
  const { data: companies, refetch: refetchCompanies } = trpc.gallery.companies.list.useQuery();
  const createCompanyMutation = trpc.gallery.companies.create.useMutation();
  const deleteCompanyMutation = trpc.gallery.companies.delete.useMutation();

  // Train Types
  const { data: trainTypes, refetch: refetchTrainTypes } = trpc.gallery.trainTypes.listByCompany.useQuery(
    { companyId: selectedCompanyId || 0 },
    { enabled: selectedCompanyId !== null }
  );
  const createTrainTypeMutation = trpc.gallery.trainTypes.create.useMutation();
  const deleteTrainTypeMutation = trpc.gallery.trainTypes.delete.useMutation();

  // Formations
  const { data: formations, refetch: refetchFormations } = trpc.gallery.formations.listByTrainType.useQuery(
    { trainTypeId: selectedTrainTypeId || 0 },
    { enabled: selectedTrainTypeId !== null }
  );
  const createFormationMutation = trpc.gallery.formations.create.useMutation();
  const deleteFormationMutation = trpc.gallery.formations.delete.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">アクセス権限がありません</h2>
          <p className="text-muted-foreground">管理者のみがこのページにアクセスできます</p>
        </div>
      </div>
    );
  }

  const handleAddCompany = async () => {
    const name = prompt("会社名（英語）:");
    if (!name) return;
    const nameJa = prompt("会社名（日本語）:");
    if (!nameJa) return;

    try {
      await createCompanyMutation.mutateAsync({ name, nameJa });
      await refetchCompanies();
      toast.success("会社を追加しました");
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!confirm("この会社を削除しますか？")) return;
    try {
      await deleteCompanyMutation.mutateAsync({ id });
      await refetchCompanies();
      toast.success("会社を削除しました");
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  const handleAddTrainType = async () => {
    if (!selectedCompanyId) return;
    const name = prompt("形式名:");
    if (!name) return;

    try {
      await createTrainTypeMutation.mutateAsync({ companyId: selectedCompanyId, name });
      await refetchTrainTypes();
      toast.success("形式を追加しました");
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  const handleDeleteTrainType = async (id: number) => {
    if (!confirm("この形式を削除しますか？")) return;
    try {
      await deleteTrainTypeMutation.mutateAsync({ id });
      await refetchTrainTypes();
      toast.success("形式を削除しました");
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  const handleAddFormation = async () => {
    if (!selectedTrainTypeId) return;
    const name = prompt("編成名:");
    if (!name) return;

    try {
      await createFormationMutation.mutateAsync({ trainTypeId: selectedTrainTypeId, name });
      await refetchFormations();
      toast.success("編成を追加しました");
    } catch (error) {
      toast.error("追加に失敗しました");
    }
  };

  const handleDeleteFormation = async (id: number) => {
    if (!confirm("この編成を削除しますか？")) return;
    try {
      await deleteFormationMutation.mutateAsync({ id });
      await refetchFormations();
      toast.success("編成を削除しました");
    } catch (error) {
      toast.error("削除に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16 md:py-24">
        <h1 className="text-5xl md:text-6xl font-black mb-4">管理画面</h1>
        <p className="subtitle mb-12">マスタデータ管理</p>
        <div className="divider-line mb-12"></div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("companies")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "companies"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            会社
          </button>
          <button
            onClick={() => setActiveTab("trainTypes")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "trainTypes"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            形式
          </button>
          <button
            onClick={() => setActiveTab("formations")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "formations"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            編成
          </button>
        </div>

        {/* Companies Tab */}
        {activeTab === "companies" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">会社一覧</h2>
              <button
                onClick={handleAddCompany}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={20} />
                追加
              </button>
            </div>
            <div className="space-y-2">
              {companies?.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-foreground">{company.nameJa}</h3>
                    <p className="text-sm text-muted-foreground">{company.name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Train Types Tab */}
        {activeTab === "trainTypes" && (
          <div>
            <div className="mb-6">
              <label className="block text-sm detail text-muted-foreground mb-2">会社を選択</label>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">-- 会社を選択 --</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nameJa}
                  </option>
                ))}
              </select>
            </div>

            {selectedCompanyId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">形式一覧</h2>
                  <button
                    onClick={handleAddTrainType}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={20} />
                    追加
                  </button>
                </div>
                <div className="space-y-2">
                  {trainTypes?.map((trainType) => (
                    <div
                      key={trainType.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors"
                    >
                      <h3 className="font-bold text-foreground">{trainType.name}</h3>
                      <button
                        onClick={() => handleDeleteTrainType(trainType.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formations Tab */}
        {activeTab === "formations" && (
          <div>
            <div className="mb-6">
              <label className="block text-sm detail text-muted-foreground mb-2">会社を選択</label>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedTrainTypeId(null);
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-accent mb-4"
              >
                <option value="">-- 会社を選択 --</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nameJa}
                  </option>
                ))}
              </select>

              {selectedCompanyId && (
                <>
                  <label className="block text-sm detail text-muted-foreground mb-2">形式を選択</label>
                  <select
                    value={selectedTrainTypeId || ""}
                    onChange={(e) => setSelectedTrainTypeId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">-- 形式を選択 --</option>
                    {trainTypes?.map((trainType) => (
                      <option key={trainType.id} value={trainType.id}>
                        {trainType.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {selectedTrainTypeId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">編成一覧</h2>
                  <button
                    onClick={handleAddFormation}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={20} />
                    追加
                  </button>
                </div>
                <div className="space-y-2">
                  {formations?.map((formation) => (
                    <div
                      key={formation.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors"
                    >
                      <h3 className="font-bold text-foreground">{formation.name}</h3>
                      <button
                        onClick={() => handleDeleteFormation(formation.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
