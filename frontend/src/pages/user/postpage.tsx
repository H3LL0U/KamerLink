import { useState, type DragEvent, type FormEvent } from "react";
import { createPost, type PostDraft } from "../../api/post";
import { useAuth0 } from "@auth0/auth0-react";
import { LocationPicker } from "../../components/generic_components/LocationPicker/LocationPicker";
import Header from "../../components/page_components/Header/Header";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
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
  const {AuthReplacement, } = useAuthenticatedUser();
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

    // if goal is 0 or undefined, send null
    const goalValue = goal !== undefined ? goal : null;

    await createPost(
      {
        title,
        message,
        images,

      } as PostDraft,
      await getAccessTokenSilently()
    );

    alert("Post submitted!");
  };
  if (AuthReplacement) return AuthReplacement;
  return (
    <>
    <Header></Header>
    <div
      style={{ width: "100vw", minHeight: "100vh", padding: 20,}}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div style={{margin:"auto", maxWidth:"1000px"}}>
      <h2>Maak een Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 ,color:"black"}}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          style={{ width: "100%", marginBottom: 10, padding: 8, color:"black"

          }}
        />


        <input type="file" accept="image/*" multiple onChange={handleFileInputChange} />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {photoPreviews.map((src, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={src}
                alt={`preview-${idx}`}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "black",

                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
          
        </div>


        <button type="submit" style={{ marginTop: 15, padding: "10px 20px" }}>
          Verstuur
        </button>
      </form>
      </div>
    </div>
    </>
  );
}

export default PostPage;
