import { useState, type DragEvent, type FormEvent } from "react";
import { createPost, type PostDraft } from "../../api/post";
import { useAuth0 } from "@auth0/auth0-react";
import { LocationPicker } from "../../components/generic_components/LocationPicker/LocationPicker";
import Header from "../../components/page_components/Header/Header";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import Card from "../../components/generic_components/Card/Card";
import { useNavigate } from "react-router-dom";
import { defaultScheme } from "../../main";
// Helper function to convert files into arrays of numbers
export async function filesToNumbers(files: File[]): Promise<number[][]> {
  const readFile = (file: File) =>
    new Promise<number[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        resolve(Array.from(bytes)); // convert to number[]
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file); // read file as raw bytes
    });

  return Promise.all(files.map(readFile));
}

function PostPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [goal, setGoal] = useState<number | undefined>(undefined); // <-- new goal state
  const { getAccessTokenSilently } = useAuth0();
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const { AuthReplacement } = useAuthenticatedUser();
  const navigate = useNavigate();

  const color_scheme = defaultScheme;

  // Handle dropped files
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!filesArray.length) return;

    setPhotos((prev) => [...prev, ...filesArray]);
    setPhotoPreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
    if (!filesArray.length) return;

    setPhotos((prev) => [...prev, ...filesArray]);
    setPhotoPreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))]);
  };

  // SUBMIT FUNCTION

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const images: number[][] = await filesToNumbers(photos);

    const location = coordinates
      ? { type: "Point", coordinates }
      : null;

    const response = await createPost(
      {
        title,
        message,
        images,
      } as PostDraft,
      await getAccessTokenSilently()
    );

    // Use post_id from response for redirect
    const newId =
      response?.post_id ||
      null;

    if (newId) {
      navigate(`/posts/view?id=${newId}`);
    } else {
      alert("Post submitted!");
    }
  };

  if (AuthReplacement) return AuthReplacement;
  return (
    <>
      <Header />
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          padding: 20,
          background: color_scheme.first,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={{ margin: "auto", maxWidth: "600px" }}>
          <Card
            style={{
              padding: "2.5rem 2.5rem 2rem 2.5rem",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              borderRadius: "18px",
              background: color_scheme.second,
              margin: "2rem auto",
              width: "100%",
              maxWidth: "600px",
              border: `1px solid ${color_scheme.third}`,
            }}
          >
            <h2
              style={{
                textAlign: "center",
                marginBottom: "2rem",
                fontWeight: 700,
                fontSize: "2.2rem",
                letterSpacing: "0.01em",
              }}
            >
              Maak een Post
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Titel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: "12px 14px",
                  color: "black",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: "1.1rem",
                  background: "#f9fafb",
                  fontWeight: 500,
                }}
              />
              <div style={{ fontSize: "0.95em", color: "#ffffffff", textAlign: "right", marginBottom: 10 }}>
                {title.length}/100
              </div>
              <textarea
                placeholder="Bericht"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                maxLength={5000}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: "12px 14px",
                  color: "black",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: "1.1rem",
                  background: "#f9fafb",
                  fontWeight: 400,
                  resize: "vertical",
                }}
              />
              <div style={{ fontSize: "0.95em", color: "#ffffffff", textAlign: "right", marginBottom: 10 }}>
                {message.length}/5000
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                style={{ marginBottom: 12 }}
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 10,
                  marginBottom: 18,
                }}
              >
                {photoPreviews.map((src, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "#111827",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 15,
                  padding: "12px 0",
                  width: "100%",
                  background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                Verstuur
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

export default PostPage;
