import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, WeightedRandomSampler
import matplotlib.pyplot as plt
import os
from collections import Counter

data_dir = './dataset_hojas'
model_path = 'modelo_hoja.pth'

device = torch.device("cpu")
print(f"Dispositivo: {device}")

# ================= TRANSFORMACIONES MEJORADAS =================
transform_train = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(30),
    transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.2),
    transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.9, 1.1)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

transform_val = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder(root=f'{data_dir}/train', transform=transform_train)
val_dataset = datasets.ImageFolder(root=f'{data_dir}/val', transform=transform_val)

print(f"Clases: {train_dataset.classes}")
print(f"Imágenes train: {len(train_dataset)}")

# ================= BALANCEO DE CLASES =================
labels = [label for _, label in train_dataset]
class_counts = Counter(labels)
print("Distribución actual:", class_counts)

# Pesos inversos para balancear
weights = [1.0 / class_counts[label] for label in labels]
sampler = WeightedRandomSampler(weights, len(weights))

train_loader = DataLoader(train_dataset, batch_size=16, sampler=sampler)
val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)

# Modelo
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0005)

# ================= ENTRENAMIENTO =================
best_acc = 0.0
num_epochs = 25

for epoch in range(num_epochs):
    model.train()
    correct = 0
    total = 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_acc = 100 * correct / total

    # Validación
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    val_acc = 100 * correct / total if total > 0 else 0

    print(f"Época {epoch+1:2d}/{num_epochs} | Train: {train_acc:.2f}% | Val: {val_acc:.2f}%")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), model_path)
        print(f"   → Mejor modelo guardado ({val_acc:.2f}%)")

print(f"\n✅ Entrenamiento terminado. Mejor Accuracy: {best_acc:.2f}%")