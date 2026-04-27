import pandas as pd
import numpy as np
import pymysql
import joblib
import json
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🤖 ENTRAÎNEMENT DU MODÈLE IA - TURATH")
print("=" * 60)

# ===== 1. CONNEXION À LA BASE DE DONNÉES =====
print("\n📊 Connexion à la base de données...")

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Asala123!',
        database='turath_ikbel',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    print("✅ Connecté à MySQL")
    
    with connection.cursor() as cursor:
        # Récupérer les données
        cursor.execute("""
            SELECT 
                pages_vues,
                temps_passe,
                ajout_panier,
                achat,
                montant_total,
                CASE 
                    WHEN pages_vues < 5 THEN 0
                    WHEN pages_vues < 10 THEN 1
                    WHEN pages_vues < 20 THEN 2
                    ELSE 3
                END as engagement_score
            FROM user_behavior
            WHERE achat IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 5000
        """)
        data = cursor.fetchall()
        print(f"✅ {len(data)} enregistrements chargés")
        
except Exception as e:
    print(f"⚠️ Erreur connexion: {e}")
    print("📊 Création de données synthétiques...")
    
    # Générer des données synthétiques
    np.random.seed(42)
    n_samples = 2000
    data = []
    for i in range(n_samples):
        pages = np.random.randint(1, 40)
        temps = np.random.randint(10, 600)
        panier = np.random.randint(0, 2)
        montant = np.random.uniform(0, 800)
        
        # Règle logique pour l'achat
        achat = 1 if (pages > 10 and temps > 60 and panier == 1) else 0
        
        data.append({
            'pages_vues': pages,
            'temps_passe': temps,
            'ajout_panier': panier,
            'achat': achat,
            'montant_total': montant,
            'engagement_score': 2 if pages > 15 else 1 if pages > 5 else 0
        })
    print(f"✅ {len(data)} données synthétiques créées")

# ===== 2. PRÉPARATION DES DONNÉES =====
print("\n📊 Préparation des données...")

df = pd.DataFrame(data)
print(f"📈 Aperçu des données:")
print(df.head())

# Séparer les features et la target
features = ['pages_vues', 'temps_passe', 'ajout_panier', 'montant_total', 'engagement_score']
X = df[features]
y = df['achat']

print(f"\n🎯 Features utilisées: {features}")
print(f"📊 Distribution des achats: {y.sum()} / {len(y)} ({y.sum()/len(y)*100:.1f}%)")

# ===== 3. NORMALISATION =====
print("\n🔄 Normalisation des données...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ===== 4. DIVISION TRAIN/TEST =====
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
print(f"📚 Données d'entraînement: {len(X_train)}")
print(f"📖 Données de test: {len(X_test)}")

# ===== 5. ENTRAÎNEMENT DES MODÈLES =====
print("\n🧠 Entraînement des modèles...")

models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
}

results = {}

for name, model in models.items():
    print(f"\n📊 Entraînement de {name}...")
    model.fit(X_train, y_train)
    
    # Prédiction
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_scaled, y, cv=5)
    
    results[name] = {
        'model': model,
        'accuracy': accuracy,
        'cv_mean': cv_scores.mean(),
        'cv_std': cv_scores.std()
    }
    
    print(f"   ✅ Accuracy: {accuracy:.2%}")
    print(f"   📊 CV Score: {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%})")

# ===== 6. SÉLECTION DU MEILLEUR MODÈLE =====
print("\n🏆 Sélection du meilleur modèle...")

best_model_name = max(results, key=lambda x: results[x]['accuracy'])
best_model = results[best_model_name]['model']
best_accuracy = results[best_model_name]['accuracy']

print(f"✅ Meilleur modèle: {best_model_name} avec {best_accuracy:.2%}")

# ===== 7. SAUVEGARDE DU MODÈLE =====
print("\n💾 Sauvegarde du modèle...")

os.makedirs('models', exist_ok=True)

# Sauvegarder le modèle
joblib.dump(best_model, 'models/best_model.pkl')
joblib.dump(scaler, 'models/scaler.pkl')

# Sauvegarder les features
with open('models/features.json', 'w') as f:
    json.dump(features, f)

# Sauvegarder les métriques
metrics = {
    'accuracy': best_accuracy,
    'model_name': best_model_name,
    'features': features,
    'training_samples': len(X_train)
}
with open('models/metrics.json', 'w') as f:
    json.dump(metrics, f)

print(f"✅ Modèle sauvegardé dans 'models/best_model.pkl'")
print(f"✅ Scaler sauvegardé dans 'models/scaler.pkl'")

# ===== 8. RAPPORT DE CLASSIFICATION =====
print("\n📋 Rapport de classification:")
y_pred = best_model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=['Non Achat', 'Achat']))

# ===== 9. IMPORTANCE DES FEATURES =====
if hasattr(best_model, 'feature_importances_'):
    print("\n🎯 Importance des features:")
    for name, importance in zip(features, best_model.feature_importances_):
        print(f"   {name}: {importance:.2%}")
elif hasattr(best_model, 'coef_'):
    print("\n🎯 Coefficients des features:")
    for name, coef in zip(features, best_model.coef_[0]):
        print(f"   {name}: {coef:.4f}")

print("\n" + "=" * 60)
print("🎉 ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS !")
print("=" * 60)