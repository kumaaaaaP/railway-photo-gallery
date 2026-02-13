import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Companies() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: companies, isLoading, error } = trpc.gallery.companies.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">エラーが発生しました</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-4">Railway Gallery</h1>
              <p className="subtitle">鉄道写真を会社・形式・編成で分類して掲載</p>
            </div>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                管理画面
              </button>
            )}
          </div>
          <div className="divider-line mt-8"></div>
        </div>

        {/* Companies Grid */}
        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {companies.map((company) => (
              <Link key={company.id} href={`/company/${company.id}`}>
                <a className="group cursor-pointer">
                  <div className="bg-card border border-border rounded-lg p-8 md:p-10 hover:border-accent transition-colors">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {company.nameJa}
                    </h2>
                    <p className="text-sm detail text-muted-foreground mb-4">{company.name}</p>
                    {company.description && (
                      <p className="text-foreground/70 line-clamp-3">{company.description}</p>
                    )}
                    <div className="mt-6 flex items-center text-accent text-sm font-medium">
                      <span>詳細を表示</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">会社データがまだ登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}
