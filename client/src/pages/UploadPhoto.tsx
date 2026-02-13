import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function UploadPhoto() {
  const { formationId } = useParams<{ formationId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const id = parseInt(formationId || "0");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [shootLocation, setShootLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: formation } = trpc.gallery.formations.getById.useQuery({ id });
  const createPhotoMutation = trpc.gallery.photos.create.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      toast.error("ファイルを選択してください");
      return;
    }

    setIsUploading(true);
    try {
      // For now, use the preview as the image URL
      // In production, you would upload to S3 and get a real URL
      const imageUrl = preview || "";
      const imageKey = `photos/${user.id}/${Date.now()}-${file.name}`;

      await createPhotoMutation.mutateAsync({
        formationId: id,
        imageUrl: imageUrl,
        imageKey: imageKey,
        thumbnailUrl: imageUrl,
        title: title || undefined,
        description: description || undefined,
        shootDate: shootDate ? new Date(shootDate) : undefined,
        location: shootLocation || undefined,
      });

      toast.success("写真をアップロードしました");
      navigate(`/formation/${id}`);
    } catch (error) {
      toast.error("アップロードに失敗しました");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-4">写真をアップロード</h1>
          <p className="subtitle mb-12">{formation?.name}</p>
          <div className="divider-line mb-12"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <div>
              <label className="block text-sm detail text-muted-foreground mb-4">写真ファイル</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="プレビュー" className="w-full max-h-64 object-contain mx-auto" />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="text-sm text-accent hover:underline"
                    >
                      別のファイルを選択
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <p className="text-foreground font-medium mb-2">ここにファイルをドラッグ</p>
                    <p className="text-sm text-muted-foreground mb-4">または</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="text-accent font-medium">ファイルを選択</span>
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm detail text-muted-foreground mb-2">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="写真のタイトル（オプション）"
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm detail text-muted-foreground mb-2">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="写真の説明（オプション）"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Shoot Date */}
            <div>
              <label className="block text-sm detail text-muted-foreground mb-2">撮影日</label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm detail text-muted-foreground mb-2">撮影地</label>
              <input
                type="text"
                value={shootLocation}
                onChange={(e) => setShootLocation(e.target.value)}
                placeholder="撮影地（オプション）"
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-8">
              <button
                type="submit"
                disabled={!file || isUploading}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    アップロード中...
                  </>
                ) : (
                  "アップロード"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/formation/${id}`)}
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-card transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
