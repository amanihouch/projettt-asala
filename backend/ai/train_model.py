# backend/ai/train_model.py
import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🤖 ENTRAÎNEMENT DU MODÈLE IA - TURATH")
print("=" * 60)

# Créer le dossier models
os.makedirs('models', exist_ok=True)

# ===== GÉNÉRATION DE DONNÉES SYNTHÉTIQUES =====
print("\n📊 Génération des données d'entraînement...")

np.random.seed(42)
n_samples = 5000

data = []
for i in range(n_samples):
    pages_vues = np.random.randint(1, 50)
    temps_passe = np.random.randint(10, 900)
    ajout_panier = np.random.randint(0, 2)
    montant_total = np.random.uniform(0, 1000)
    
    if pages_vues > 20:
        engagement_score = 3
    elif pages_vues > 10:
        engagement_score = 2
    elif pages_vues > 5:
        engagement_score = 1
    else:
        engagement_score = 0
    
    proba_achat = 0
    proba_achat += min(pages_vues / 50, 0.4)
    proba_achat += min(temps_passe / 600, 0.3)
    proba_achat += ajout_panier * 0.3
    
    achat = 1 if np.random.random() < proba_achat else 0
    
    data.append({
        'pages_vues': pages_vues,
        'temps_passe': temps_passe,
        'ajout_panier': ajout_panier,
        'montant_total': montant_total,
        'engagement_score': engagement_score,
        'achat': achat
    })

df = pd.DataFrame(data)
print(f"✅ {len(df)} données générées")
print(f"📊 Taux d'achat: {df['achat'].sum() / len(df) * 100:.1f}%")

# ===== PRÉPARATION DES DONNÉES =====
print("\n📊 Préparation des données...")

features = ['pages_vues', 'temps_passe', 'ajout_panier', 'montant_total', 'engagement_score']
X = df[features]
y = df['achat']

print(f"🎯 Features utilisées: {features}")

# ===== NORMALISATION =====
print("\n🔄 Normalisation des données...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ===== DIVISION TRAIN/TEST =====
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
print(f"📚 Données entraînement: {len(X_train)}")
print(f"📖 Données test: {len(X_test)}")

# ===== ENTRAÎNEMENT =====
print("\n🧠 Entraînement du modèle Random Forest...")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("✅ Modèle entraîné avec succès")

# ===== ÉVALUATION =====
print("\n📊 Évaluation du modèle...")

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"✅ Accuracy: {accuracy:.2%}")
print("\n📋 Rapport de classification:")
print(classification_report(y_test, y_pred, target_names=['Non Achat', 'Achat']))

# ===== IMPORTANCE DES FEATURES =====
print("\n🎯 Importance des features:")
for name, importance in zip(features, model.feature_importances_):
    print(f"   {name}: {importance:.2%}")

# ===== SAUVEGARDE =====
print("\n💾 Sauvegarde du modèle...")

joblib.dump(model, 'models/best_model.pkl')
print("✅ Modèle sauvegardé: models/best_model.pkl")

joblib.dump(scaler, 'models/scaler.pkl')
print("✅ Scaler sauvegardé: models/scaler.pkl")

with open('models/features.json', 'w', encoding='utf-8') as f:
    json.dump(features, f, ensure_ascii=False, indent=2)
print("✅ Features sauvegardées: models/features.json")

metrics = {
    'accuracy': float(accuracy),
    'model_name': 'Random Forest',
    'features': features,
    'training_samples': len(X_train),
    'test_samples': len(X_test)
}

with open('models/metrics.json', 'w', encoding='utf-8') as f:
    json.dump(metrics, f, ensure_ascii=False, indent=2)
print("✅ Métriques sauvegardées: models/metrics.json")

print("\n" + "=" * 60)
print("🎉 ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS !")
print("=" * 60)

# Test du modèle
print("\n🧪 Test du modèle avec un exemple:")
test_user = np.array([[15, 120, 1, 250, 2]])
test_scaled = scaler.transform(test_user)
prediction = model.predict(test_scaled)[0]
probabilite = model.predict_proba(test_scaled)[0][1]

result_text = "✅ ACHETERA" if prediction == 1 else "❌ N'ACHETERA PAS"
print(f"   Utilisateur: 15 pages, 120 secondes, panier ajouté, 250 TND")
print(f"   Prédiction: {result_text}")
print(f"   Probabilité: {probabilite:.1%}")