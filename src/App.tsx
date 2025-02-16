import React, { useState, useRef } from 'react';
import { Upload, Sun, Droplet, AlertTriangle, Heart, Pill, Camera } from 'lucide-react';

interface PlantInfo {
  name: string;
  watering: string;
  light: string;
  diseases: string[];
  benefits: string[];
  isPoisonous: boolean;
  treatment: string;
}

// Plant database
// Expanded Plant database
const plantDatabase: Record<string, PlantInfo> = {
  mustard: {
    name: "Mustard Plant (Brassica juncea)",
    watering: "Keep soil consistently moist but not waterlogged. Water when top inch of soil feels dry.",
    light: "Full sun to partial shade. Requires 6-8 hours of direct sunlight daily for optimal growth.",
    diseases: [
      "Downy mildew",
      "White rust",
      "Alternaria leaf spot",
      "Bacterial leaf spot"
    ],
    benefits: [
      "Rich in vitamins A, C, and K",
      "High in antioxidants",
      "Anti-inflammatory properties",
      "Supports digestive health",
      "Good source of fiber"
    ],
    isPoisonous: false,
    treatment: "For fungal diseases, remove infected leaves and improve air circulation. Apply copper-based fungicide for severe cases. Ensure proper spacing between plants to prevent disease spread."
  },
  peaceLily: {
    name: "Peace Lily (Spathiphyllum)",
    watering: "Keep soil moist but not waterlogged. Water when top inch of soil is dry.",
    light: "Thrives in medium to low indirect light. Avoid direct sunlight.",
    diseases: ["Leaf spot", "Root rot", "Powdery mildew"],
    benefits: [
      "Air purifying qualities",
      "Removes toxins like benzene and formaldehyde",
      "Increases humidity",
      "Reduces stress"
    ],
    isPoisonous: true,
    treatment: "For leaf spot, remove affected leaves and improve air circulation. For root rot, reduce watering and repot if necessary."
  },
  rose: {
    name: "Rose (Rosa)",
    watering: "Water deeply once a week, more often in hot weather.",
    light: "Full sun, at least 6 hours of direct sunlight daily.",
    diseases: ["Black spot", "Powdery mildew", "Rust"],
    benefits: [
      "Beautiful flowers",
      "Symbol of love and beauty",
      "Can be used in herbal remedies"
    ],
    isPoisonous: false,
    treatment: "Prune affected areas and apply fungicides as needed."
  },
  tulip: {
    name: "Tulip (Tulipa)",
    watering: "Water when the top inch of soil is dry, especially during blooming.",
    light: "Full sun to partial shade.",
    diseases: ["Botrytis blight", "Tulip fire"],
    benefits: [
      "Bright and colorful flowers",
      "Easy to grow",
      "Attracts pollinators"
    ],
    isPoisonous: true,
    treatment: "Remove affected plants and avoid overwatering."
  },
  fern: {
    name: "Fern (Pteridophyta)",
    watering: "Keep soil consistently moist but not soggy.",
    light: "Prefers indirect light; avoid direct sunlight.",
    diseases: ["Leaf spot", "Root rot"],
    benefits: [
      "Air purifying qualities",
      "Adds greenery to indoor spaces",
      "Low maintenance"
    ],
    isPoisonous: false,
    treatment: "Remove dead fronds and ensure proper drainage."
  },
  cactus: {
    name: "Cactus (Cactaceae)",
    watering: "Water sparingly; allow soil to dry out completely between waterings.",
    light: "Full sun; requires bright light.",
    diseases: ["Cactus rot", "Mealybugs"],
    benefits: [
      "Low water requirements",
      "Unique appearance",
      "Can thrive in dry conditions"
    ],
    isPoisonous: false,
    treatment: "Remove affected areas and ensure proper drainage."
  }
};

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please ensure you've granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageDataUrl);
        stopCamera();
        // Convert base64 to blob and analyze
        fetch(imageDataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            identifyPlant(file);
          });
      }
    }
  };

  const identifyPlant = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call to a plant identification service
      // For demonstration, we're using the image name to determine the plant type
      const fileName = file.name.toLowerCase();
      
      // Simple logic to determine plant type from filename
      let plantType = 'unknown';
      if (fileName.includes('mustard')) {
        plantType = 'mustard';
      } else if (fileName.includes('peace') || fileName.includes('lily')) {
        plantType = 'peaceLily';
      } else if (fileName.includes('rose')) {
        plantType = 'rose';
      } else if (fileName.includes('tulip')) {
        plantType = 'tulip';
      } else if (fileName.includes('fern')) {
        plantType = 'fern';
      } else if (fileName.includes('cactus')) {
        plantType = 'cactus';
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (plantType === 'unknown') {
        setError("Unable to identify plant. Please ensure the image is clear and try again.");
        setPlantInfo(null);
      } else {
        setPlantInfo(plantDatabase[plantType]);
      }
    } catch (err) {
      setError("An error occurred while identifying the plant. Please try again.");
      setPlantInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      identifyPlant(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          Plant Identification & Care Guide
        </h1>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-8 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Upload Image
                </button>
                <button
                  onClick={isStreaming ? captureImage : startCamera}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  {isStreaming ? 'Capture' : 'Scan Plant'}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              {isStreaming && (
                <div className="relative w-full max-w-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg shadow-md"
                  />
                  <button
                    onClick={stopCamera}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Close Camera
                  </button>
                </div>
              )}
            </div>

            {selectedImage && !isStreaming && (
              <div className="mb-8">
                <img
                  src={selectedImage}
                  alt="Selected plant"
                  className="max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-600">
                Analyzing your plant...
              </div>
            )}

            {error && (
              <div className="text-center text-red-600 mb-4">
                {error}
              </div>
            )}

            {plantInfo && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-green-800 text-center mb-4">
                  {plantInfo.name}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="text-blue-500" />
                      <h3 className="font-semibold">Watering Needs</h3>
                    </div>
                    <p>{plantInfo.watering}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="text-yellow-500" />
                      <h3 className="font-semibold">Light Requirements</h3>
                    </div>
                    <p>{plantInfo.light}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="text-red-500" />
                      <h3 className="font-semibold">Common Diseases</h3>
                    </div>
                    <ul className="list-disc list-inside">
                      {plantInfo.diseases.map((disease, index) => (
                        <li key={index}>{disease}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="text-pink-500" />
                      <h3 className="font-semibold">Benefits</h3>
                    </div>
                    <ul className="list-disc list-inside">
                      {plantInfo.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="text-purple-500" />
                    <h3 className="font-semibold">Treatment & Safety</h3>
                  </div>
                  <p>{plantInfo.treatment}</p>
                  {plantInfo.isPoisonous && (
                    <div className="mt-2 text-red-600 font-semibold">
                      ⚠️ Warning: This plant is poisonous if ingested. Keep away from children and pets.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;