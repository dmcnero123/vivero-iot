from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torchvision.transforms as transforms
import torchvision.models as models
import uvicorn
import io
import os
from datetime import datetime

app = FastAPI(title="Bonsái Vision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASSES = ['enfermo', 'sano']
DEVICE = torch.device('cpu')
MODEL_PATH = "modelo_hoja.pth"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = models.resnet18(weights=None)
        model.fc = torch.nn.Linear(model.fc.in_features, len(CLASSES))
        
        if os.path.exists(MODEL_PATH):
            model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
            model.to(DEVICE)
            model.eval()
            print("✅ Modelo cargado correctamente")
        else:
            print("⚠️ No se encontró el modelo")
    except Exception as e:
        print(f"❌ Error cargando modelo: {e}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, detail="Debe subir una imagen")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = transform(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
            clase = CLASSES[predicted_idx.item()]
            confianza = confidence.item() * 100

        return {
            "clase": clase,
            "confianza": round(confianza, 2),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    except Exception as e:
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Iniciando API en http://localhost:8000")
    uvicorn.run("api_vision:app", host="0.0.0.0", port=8000, reload=True)