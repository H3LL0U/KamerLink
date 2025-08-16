import { useState, type DragEvent, type FormEvent } from "react";
import { createPost, type PostDraft} from "../../api/post";
import { useAuth0 } from "@auth0/auth0-react";


//Helper function to convert images into base64 format strings

export async function filesToBase64(files: File[]): Promise<string[]> {
  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file); 
    });

  return Promise.all(files.map(readFile));
}



function PostPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const {getAccessTokenSilently } = useAuth0();
  // Handle dropped files
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    const filesArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (filesArray.length === 0) return;

    setPhotos((prev) => [...prev, ...filesArray]);
    const previews = filesArray.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (filesArray.length === 0) return;

    setPhotos((prev) => [...prev, ...filesArray]);
    const previews = filesArray.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  
  const images: string[] = await filesToBase64(photos);

  
  createPost({
    title: title,
    message: message,
    images: images,
    

  },

  await getAccessTokenSilently()
);

  console.log({ title, message, photos, images });
  alert("Post submitted!");
};




  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        padding: 20,
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h2>Maak een Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 10,
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
                }}
              />
            <button
              type="button"
              onClick={() => handleRemovePhoto(idx)}
              style={{
                position: "absolute",
                top: 2,          // move inside the corner
                right: 2,        // move inside the corner
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "50%", // perfect circle
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

        <button
          type="submit"

          style={{ marginTop: 15, padding: "10px 20px" }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default PostPage;
