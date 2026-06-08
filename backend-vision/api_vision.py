from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import io

app = FastAPI(title="Bonsái Vision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== CONFIGURACIÓN ==================
CLASSES = ['enfermo', 'sano']   # Debe coincidir con tu entrenamiento

# Base de datos de enfermedades (para cuando detecta "enfermo")
GUIA_ENFERMEDADES = {
    "Roya": {"titulo": "Plaga de Roya / Tizón de las Puntas", "causa": "Infección fúngica", "sintomas": "Hojas marrones o negras en las puntas", "tratamiento": "Poda afectada + fungicida"},
    "Moho Negro": {"titulo": "Moho Negro (Fumagina)", "causa": "Melaza de insectos", "sintomas": "Capa negra en hojas", "tratamiento": "Control de plagas + limpieza"},
    "Oxido": {"titulo": "Óxido", "causa": "Alta humedad", "sintomas": "Pústulas color óxido", "tratamiento": "Mejorar ventilación + fungicida"},
    "Mancha Negra": {"titulo": "Mancha Negra", "causa": "Hongo", "sintomas": "Manchas circulares negras", "tratamiento": "Eliminar hojas afectadas"},
    "Moho Blanco": {"titulo": "Mildiu / Moho Blanco", "causa": "Hongos en ambiente húmedo", "sintomas": "Polvo blanco", "tratamiento": "Eliminar partes + fungicida"}
}

# ================== CARGA DEL MODELO ==================
try:
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, 2)  # ← Cambiado a 2 clases
    model.load_state_dict(torch.load("modelo_hoja.pth", map_location='cpu'))
    model.eval()
    print("✅ Modelo cargado correctamente (2 clases)")
except Exception as e:
    print(f"❌ Error cargando modelo: {e}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)

        clase = CLASSES[predicted_idx.item()]
        conf_val = round(confidence.item() * 100, 2)

        if clase == "enfermo":
            # Elegir una enfermedad aleatoria o la más probable
            patologia = list(GUIA_ENFERMEDADES.keys())[0]  # Puedes mejorar esto después
            detalle = GUIA_ENFERMEDADES[patologia]
            return {
                "estado": "ENFERMO",
                "confianza": conf_val,
                "detalle": detalle
            }
        else:
            return {
                "estado": "SANO",
                "confianza": conf_val,
                "detalle": None
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)