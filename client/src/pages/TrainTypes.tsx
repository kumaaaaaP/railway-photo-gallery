import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { Loader2, ChevronRight } from "lucide-react";

export default function TrainTypes() {
  const { companyId } = useParams<{ companyId: string }>();
  const id = parseInt(companyId || "0");

  const { data: company } = trpc.gallery.companies.getById.useQuery({ id });
  const { data: trainTypes, isLoading, error } = trpc.gallery.trainTypes.listByCompany.useQuery(
    { companyId: id },
    { enabled: id > 0 }
  );

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
        {/* Breadcrumb */}
        <div className="breadcrumb mb-12">
          <Link href="/">
            <a className="breadcrumb-item">Railway Gallery</a>
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-foreground">{company?.nameJa}</span>
        </div>

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-6xl font-black mb-4">{company?.nameJa}</h1>
          <p className="subtitle">車両形式を選択</p>
          <div className="divider-line mt-8"></div>
        </div>

        {/* Train Types Grid */}
        {trainTypes && trainTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {trainTypes.map((trainType) => (
              <Link key={trainType.id} href={`/train-type/${trainType.id}`}>
                <a className="group cursor-pointer">
                  <div className="bg-card border border-border rounded-lg p-8 md:p-10 hover:border-accent transition-colors">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {trainType.name}
                    </h2>
                    {trainType.description && (
                      <p className="text-foreground/70 line-clamp-3 mb-4">{trainType.description}</p>
                    )}
                    <div className="flex items-center text-accent text-sm font-medium">
                      <span>編成を表示</span>
                      <ChevronRight size={16} className="ml-2" />
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">形式データがまだ登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );
}
