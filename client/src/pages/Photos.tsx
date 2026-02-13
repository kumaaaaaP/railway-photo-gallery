import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Photos() {
  const { formationId } = useParams<{ formationId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const id = parseInt(formationId || "0");
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

  const { data: formation } = trpc.gallery.formations.getById.useQuery({ id });
  const { data: trainType } = trpc.gallery.trainTypes.getById.useQuery(
    { id: formation?.trainTypeId || 0 },
    { enabled: !!formation?.trainTypeId }
  );
  const { data: company } = trpc.gallery.companies.getById.useQuery(
    { id: trainType?.companyId || 0 },
    { enabled: !!trainType?.companyId }
  );
  const { data: photos, isLoading, error } = trpc.gallery.photos.listByFormation.useQuery(
    { formationId: id },
    { enabled: id > 0 }
  );
  const { data: selectedPhoto } = trpc.gallery.photos.getById.useQuery(
    { id: selectedPhotoId || 0 },
    { enabled: selectedPhotoId !== null }
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
          <Link href={`/company/${company?.id}`}>
            <a className="breadcrumb-item">{company?.nameJa}</a>
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link href={`/train-type/${trainType?.id}`}>
            <a className="breadcrumb-item">{trainType?.name}</a>
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-foreground">{formation?.name}</span>
        </div>

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-4">{formation?.name}</h1>
              <p className="subtitle">撮影された写真</p>
            </div>
            {user && (
              <button
                onClick={() => navigate(`/formation/${id}/upload`)}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                + 写真を追加
              </button>
            )}
          </div>
          <div className="divider-line mt-8"></div>
        </div>

        {/* Photos Grid */}
        {photos && photos.length > 0 ? (
          <div className="photo-grid">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhotoId(photo.id)}
                className="relative group overflow-hidden rounded-lg border border-border hover:border-accent transition-all cursor-pointer"
              >
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title || "写真"}
                  className="photo-thumbnail w-full h-full"
                />
                {photo.title && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{photo.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">写真がまだ登録されていません</p>
          </div>
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoId(null)}
          >
            <div
              className="bg-card rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title || "写真"}
                  className="w-full h-auto"
                />
                <button
                  onClick={() => setSelectedPhotoId(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 md:p-8">
                {selectedPhoto.title && (
                  <h2 className="text-2xl font-bold text-foreground mb-4">{selectedPhoto.title}</h2>
                )}

                {selectedPhoto.description && (
                  <p className="text-foreground/70 mb-6">{selectedPhoto.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedPhoto.shootDate && (
                    <div>
                      <p className="detail text-muted-foreground mb-1">撮影日</p>
                      <p className="text-foreground">
                        {new Date(selectedPhoto.shootDate).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  )}
                  {selectedPhoto.location && (
                    <div>
                      <p className="detail text-muted-foreground mb-1">撮影地</p>
                      <p className="text-foreground">{selectedPhoto.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
