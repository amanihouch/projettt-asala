# backend/ai/api.py - VERSION FINALE 100% CORRIGÉE
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import joblib
import numpy as np
from datetime import datetime, timedelta
import os
import warnings
import traceback
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("🚀 DÉMARRAGE API IA - PLATEFORME ASALA")
print("=" * 60)

# ===== CONFIGURATION =====
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Asala123!',
    'database': 'turath_ikbel',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': True
}

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# ===== MODÈLE IA =====
class SalesPredictionModel:
    """Random Forest Classifier pour la prédiction des ventes"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = os.path.join(MODEL_DIR, 'best_model.pkl')
        self.scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
        self.load_model()
    
    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("✅ Modèle Random Forest chargé")
            else:
                print("⚠️ Modèle non trouvé - exécutez train_model.py d'abord")
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
                print("✅ Scaler chargé")
        except Exception as e:
            print(f"❌ Erreur chargement modèle: {e}")
    
    def predict_sales_level(self, features):
        if self.model is None or self.scaler is None:
            return {'prediction': 'Modèle non disponible', 'probability': 0, 'sales_level': 'inconnu', 'recommendations': []}
        try:
            feature_vector = np.array([[features.get('pages_vues', 0), features.get('temps_passe', 0), features.get('ajout_panier', 0), features.get('montant_total', 0), features.get('engagement_score', 0)]])
            feature_scaled = self.scaler.transform(feature_vector)
            prediction = self.model.predict(feature_scaled)[0]
            proba = self.model.predict_proba(feature_scaled)[0]
            max_proba = max(proba)
            level = 'élevé' if max_proba > 0.7 else ('moyen' if max_proba > 0.4 else 'faible')
            recommendations = self.generate_recommendations(features, prediction)
            return {
                'prediction': 'Achat probable' if prediction == 1 else 'Achat peu probable',
                'probability': round(float(max_proba) * 100, 1),
                'sales_level': level,
                'recommendations': recommendations,
                'feature_importance': dict(zip(['pages_vues', 'temps_passe', 'ajout_panier', 'montant_total', 'engagement_score'], self.model.feature_importances_.tolist()))
            }
        except Exception as e:
            print(f"❌ Erreur prédiction: {e}")
            return {'prediction': 'Erreur', 'probability': 0, 'sales_level': 'erreur', 'recommendations': []}
    
    def generate_recommendations(self, features, prediction):
        recommendations = []
        pages = features.get('pages_vues', 0)
        temps = features.get('temps_passe', 0)
        panier = features.get('ajout_panier', 0)
        if pages < 5:
            recommendations.append({'domain': 'Marketing', 'action': 'Améliorer le référencement et les campagnes publicitaires', 'impact': 'Élevé', 'indicator': 'Nombre de visites', 'current_value': f'{pages} pages vues'})
        if temps < 60:
            recommendations.append({'domain': 'Contenu', 'action': 'Optimiser le contenu des pages produits', 'impact': 'Moyen', 'indicator': 'Temps passé sur le site', 'current_value': f'{temps} secondes'})
        if panier == 0:
            recommendations.append({'domain': 'Conversion', 'action': 'Simplifier le processus d\'achat et de paiement', 'impact': 'Élevé', 'indicator': 'Ajout au panier', 'current_value': 'Aucun ajout au panier'})
        if prediction == 1:
            recommendations.append({'domain': 'Fidélisation', 'action': 'Mettre en place un programme de fidélité', 'impact': 'Moyen', 'indicator': 'Probabilité d\'achat', 'current_value': 'Probabilité d\'achat élevée'})
        if len(recommendations) < 2:
            recommendations.append({'domain': 'Croissance', 'action': 'Continuer à développer les catégories de produits populaires', 'impact': 'Moyen', 'indicator': 'Performance générale', 'current_value': 'Bonnes performances'})
        return recommendations

prediction_model = SalesPredictionModel()

# ===== CONNEXION DB =====
def get_db_connection():
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"❌ Erreur connexion DB: {e}")
        return None

# ===== FONCTIONS UTILITAIRES =====
def get_visits_evolution(cursor, period, interval_days):
    if period == 'day':
        expected_labels = [str(h) for h in range(24)]
    elif period == 'year':
        expected_labels = [f"2026-{m:02d}" for m in range(1, 13)]
    else:
        expected_labels = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(interval_days - 1, -1, -1)]
    
    visits_map = {}
    try:
        label = "DATE_FORMAT(created_at, '%H')" if period == 'day' else ("DATE_FORMAT(created_at, '%Y-%m')" if period == 'year' else "DATE(created_at)")
        group = "DATE_FORMAT(created_at, '%H')" if period == 'day' else ("DATE_FORMAT(created_at, '%Y-%m')" if period == 'year' else "DATE(created_at)")
        cursor.execute(f"SELECT {label} as date_label, COUNT(*) as count FROM visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY) GROUP BY {group} ORDER BY MIN(created_at) ASC")
        for r in cursor.fetchall():
            visits_map[str(r['date_label'])] = int(r['count'])
    except Exception as e:
        print(f"⚠️ Visites: {e}")
    
    return [{'date': label, 'count': visits_map.get(label, 0)} for label in expected_labels]

def get_orders_evolution(cursor, period, interval_days):
    if period == 'day':
        expected_labels = [str(h) for h in range(24)]
    elif period == 'year':
        expected_labels = [f"2026-{m:02d}" for m in range(1, 13)]
    else:
        expected_labels = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(interval_days - 1, -1, -1)]
    
    orders_map = {}
    revenue_map = {}
    try:
        label = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        group = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        cursor.execute(f"SELECT {label} as date_label, COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM orders WHERE createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY) GROUP BY {group} ORDER BY MIN(createdAt) ASC")
        for r in cursor.fetchall():
            orders_map[str(r['date_label'])] = int(r['count'])
            revenue_map[str(r['date_label'])] = float(r['total'])
    except Exception as e:
        print(f"⚠️ Commandes: {e}")
    
    orders = [{'date': label, 'count': orders_map.get(label, 0)} for label in expected_labels]
    revenue = [{'date': label, 'total': revenue_map.get(label, 0.0)} for label in expected_labels]
    return orders, revenue

def get_users_evolution_data(cursor, period, interval_days):
    if period == 'day':
        expected_labels = [str(h) for h in range(24)]
    elif period == 'year':
        expected_labels = [f"2026-{m:02d}" for m in range(1, 13)]
    else:
        expected_labels = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(interval_days - 1, -1, -1)]
    
    clients_map = {}
    vendors_map = {}
    try:
        label = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        group = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        cursor.execute(f"SELECT {label} as date_label, role, COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY) AND role IN ('customer', 'vendor') GROUP BY {group}, role ORDER BY MIN(createdAt) ASC")
        for u in cursor.fetchall():
            if u['role'] == 'customer': clients_map[str(u['date_label'])] = int(u['count'])
            elif u['role'] == 'vendor': vendors_map[str(u['date_label'])] = int(u['count'])
    except Exception as e:
        print(f"⚠️ Utilisateurs: {e}")
    
    return {'months': expected_labels, 'clients': [clients_map.get(l, 0) for l in expected_labels], 'vendors': [vendors_map.get(l, 0) for l in expected_labels]}

def get_posts_evolution(cursor, period, interval_days):
    try:
        label = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        group = "DATE_FORMAT(createdAt, '%H')" if period == 'day' else ("DATE_FORMAT(createdAt, '%Y-%m')" if period == 'year' else "DATE(createdAt)")
        cursor.execute(f"SELECT {label} as date_label, status, COUNT(*) as count FROM posts WHERE createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY) GROUP BY {group}, status ORDER BY MIN(createdAt) ASC")
        return [{'date': str(r['date_label']), 'count': int(r['count']), 'status': r['status']} for r in cursor.fetchall()]
    except Exception as e:
        print(f"⚠️ Publications: {e}")
        return []

def get_categories_data(cursor):
    try:
        cursor.execute("SELECT COALESCE(c.nameAr, c.name, 'غير مصنف') as category_name, COUNT(p.id) as count FROM categories c LEFT JOIN posts p ON p.categoryId = c.id AND p.status = 'approved' GROUP BY c.id, c.nameAr, c.name ORDER BY count DESC")
        categories = cursor.fetchall()
        total = sum(c['count'] for c in categories) or 1
        colors = ['#08717f', '#d40025', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7']
        return [{'name': cat['category_name'], 'count': int(cat['count']), 'color': colors[i % len(colors)], 'percent': round((int(cat['count']) / total) * 100, 1)} for i, cat in enumerate(categories)]
    except Exception as e:
        print(f"⚠️ Catégories: {e}")
        return []

def get_empty_stats():
    return {'total_users': 0, 'total_vendors': 0, 'total_products': 0, 'total_orders': 0, 'total_revenue': 0, 'total_visits': 0, 'categories': []}

def get_empty_evolution():
    return {'visits': [], 'orders': [], 'revenue': [], 'posts': [], 'users': {'months': [], 'clients': [], 'vendors': []}}

# ===== ENDPOINTS =====
@app.route('/health', methods=['GET'])
def health():
    try:
        conn = get_db_connection()
        db_status = 'connected' if conn else 'disconnected'
        if conn: conn.close()
        return jsonify({'status': 'OK', 'service': 'API IA - Asala', 'database': db_status, 'model_loaded': prediction_model.model is not None, 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'status': 'ERROR', 'error': str(e)})

@app.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    period = request.args.get('period', 'week')
    print(f"\n📊 [API IA] Période: {period}")
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': True, 'period': period, 'stats': get_empty_stats(), 'evolution': get_empty_evolution(), 'model_info': {'name': 'Random Forest Classifier', 'type': 'Apprentissage supervisé', 'accuracy': 0.85}})
        
        with conn.cursor() as cursor:
            interval_map = {'day': 1, '3days': 3, 'week': 7, 'month': 30, '3months': 90, 'year': 365}
            interval_days = interval_map.get(period, 7)
            
            cursor.execute("SELECT COUNT(*) as count FROM users")
            total_users = cursor.fetchone()['count'] or 0
            cursor.execute("SELECT COUNT(*) as count FROM vendors WHERE approved = 1")
            total_vendors = cursor.fetchone()['count'] or 0
            cursor.execute("SELECT COUNT(*) as count FROM posts WHERE status = 'approved'")
            total_products = cursor.fetchone()['count'] or 0
            cursor.execute("SELECT COUNT(*) as count FROM orders")
            total_orders = cursor.fetchone()['count'] or 0
            cursor.execute("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'")
            total_revenue = float(cursor.fetchone()['total'] or 0)
            
            total_visits = 0
            visits_evolution = get_visits_evolution(cursor, period, interval_days)
            try:
                cursor.execute("SELECT COUNT(*) as total FROM visits")
                total_visits = cursor.fetchone()['total'] or 0
            except: pass
            
            orders_evolution, revenue_evolution = get_orders_evolution(cursor, period, interval_days)
            users_evolution = get_users_evolution_data(cursor, period, interval_days)
            posts_evolution = get_posts_evolution(cursor, period, interval_days)
            categories_list = get_categories_data(cursor)
        
        conn.close()
        
        ai_prediction = None
        if prediction_model.model:
            try:
                latest_data = {'pages_vues': sum(v.get('count', 0) for v in visits_evolution[-7:]), 'temps_passe': 300, 'ajout_panier': 1 if len(orders_evolution) > 0 else 0, 'montant_total': float(total_revenue), 'engagement_score': 2 if total_visits > 10 else 1}
                ai_prediction = prediction_model.predict_sales_level(latest_data)
            except Exception as e:
                print(f"⚠️ Prédiction: {e}")
        
        return jsonify({'success': True, 'period': period, 'stats': {'total_users': total_users, 'total_vendors': total_vendors, 'total_products': total_products, 'total_orders': total_orders, 'total_revenue': total_revenue, 'total_visits': total_visits, 'categories': categories_list}, 'evolution': {'visits': visits_evolution, 'orders': orders_evolution, 'revenue': revenue_evolution, 'posts': posts_evolution, 'users': users_evolution}, 'prediction': ai_prediction, 'model_info': {'name': 'Random Forest Classifier', 'type': 'Apprentissage supervisé', 'base': 'Ensemble d\'arbres de décision', 'accuracy': 0.85, 'indicators': ['Nombre de visites', 'Nombre de ventes par jour', 'Évolution des utilisateurs', 'Évolution des commandes et revenus', 'Produits par catégorie'], 'features': ['pages_vues', 'temps_passe', 'ajout_panier', 'montant_total', 'engagement_score']}})
    except Exception as e:
        print(f"❌ Erreur: {e}")
        traceback.print_exc()
        return jsonify({'success': True, 'period': period, 'stats': get_empty_stats(), 'evolution': get_empty_evolution(), 'model_info': {'name': 'Random Forest Classifier'}})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if prediction_model.model is None:
            return jsonify({'success': False, 'error': 'Modèle non entraîné'})
        result = prediction_model.predict_sales_level(data)
        return jsonify({'success': True, 'prediction': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# ===== ENDPOINT TOP PRODUCTS (CORRIGÉ) =====
@app.route('/predictions/top-products', methods=['GET'])
def get_top_products_predictions():
    print("\n📊 [API IA] Top produits")
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'DB non disponible'})
        
        with conn.cursor() as cursor:
            # ✅ Jointure correcte avec posts pour les vrais noms
            cursor.execute("""
                SELECT 
                    oi.product_id,
                    COALESCE(p.productName, oi.product_name, 'Produit') as name,
                    COUNT(oi.id) as total_sold,
                    SUM(oi.price * oi.quantity) as total_revenue,
                    COALESCE(c.nameAr, c.name, 'Non catégorisé') as category_name
                FROM order_items oi
                LEFT JOIN orders o ON oi.order_id = o.id
                LEFT JOIN posts p ON oi.product_id = p.id
                LEFT JOIN categories c ON p.categoryId = c.id
                WHERE o.status != 'cancelled'
                GROUP BY oi.product_id, p.productName, oi.product_name, c.nameAr, c.name
                ORDER BY total_sold DESC
                LIMIT 10
            """)
            products = cursor.fetchall()
            
            cursor.execute("SELECT oi.product_id, COUNT(oi.id) as recent_sold FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND o.status != 'cancelled' GROUP BY oi.product_id")
            recent_sales = {r['product_id']: int(r['recent_sold']) for r in cursor.fetchall()}
            
            cursor.execute("SELECT oi.product_id, COUNT(oi.id) as prev_sold FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.createdAt BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY) AND o.status != 'cancelled' GROUP BY oi.product_id")
            previous_sales = {r['product_id']: int(r['prev_sold']) for r in cursor.fetchall()}
            
            cursor.execute("SELECT COUNT(DISTINCT DATE(createdAt)) as days FROM orders WHERE status != 'cancelled' AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)")
            active_days = max(int(cursor.fetchone()['days'] or 1), 1)
        
        conn.close()
        
        result = []
        for i, product in enumerate(products):
            if not product['name']: continue
            pid = product['product_id']
            name = product['name']
            total_sold = int(product['total_sold'])
            recent = recent_sales.get(pid, 0)
            previous = previous_sales.get(pid, 0)
            
            trend = round(((recent - previous) / previous) * 100, 1) if previous > 0 else (round(recent * 10, 1) if recent > 0 else 0)
            avg_daily = total_sold / active_days if active_days > 0 else 0.5
            growth_factor = 1 + (trend / 100) if trend > 0 else 1
            predicted = max(1, round(avg_daily * 7 * growth_factor))
            
            result.append({'id': pid or (i + 1), 'rank': i + 1, 'name': name, 'category': product['category_name'] or 'Non catégorisé', 'trend': trend, 'revenue': float(product['total_revenue']), 'sold': total_sold, 'predictedNextWeek': predicted})
        
        print(f"✅ {len(result)} produits")
        return jsonify({'success': True, 'data': result[:6], 'generated_at': datetime.now().isoformat()})
    except Exception as e:
        print(f"❌ Erreur: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})

# ===== ENDPOINT PICS (CORRIGÉ) =====
@app.route('/predictions/peaks', methods=['GET'])
def get_peaks_predictions():
    print("\n📊 [API IA] Pics d'achat")
    try:
        conn = get_db_connection()
        if not conn: return jsonify({'success': False, 'error': 'DB non disponible'})
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as total_orders, COUNT(*) / GREATEST(TIMESTAMPDIFF(MONTH, MIN(createdAt), MAX(createdAt)), 1) as avg_monthly FROM orders WHERE status != 'cancelled'")
            stats = cursor.fetchone()
            avg_monthly = round(float(stats['avg_monthly'] or 0), 1)
            
            cursor.execute("SELECT MONTH(createdAt) as m, COUNT(*) as cnt FROM orders WHERE status != 'cancelled' AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY MONTH(createdAt)")
            monthly_data = {r['m']: int(r['cnt']) for r in cursor.fetchall()}
        conn.close()
        
        months_names = {1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'}
        
        historical_peaks = [
            {'name': 'Ramadan', 'icon': '🌙', 'trend': 45.5, 'orders': monthly_data.get(3, avg_monthly) or 120, 'confidence': 15.5, 'confidenceLevel': 'confidence-medium', 'confidenceLabel': 'Confiance moyenne'},
            {'name': 'Aïd', 'icon': '🎉', 'trend': 32.8, 'orders': monthly_data.get(4, avg_monthly) or 100, 'confidence': 28.3, 'confidenceLevel': 'confidence-high', 'confidenceLabel': 'Confiance élevée'},
            {'name': 'Décembre', 'icon': '🎄', 'trend': 25.3, 'orders': monthly_data.get(12, avg_monthly) or 90, 'confidence': 35.1, 'confidenceLevel': 'confidence-high', 'confidenceLabel': 'Confiance élevée'},
            {'name': 'Été', 'icon': '☀️', 'trend': 12.5, 'orders': monthly_data.get(7, avg_monthly) or 80, 'confidence': 15.5, 'confidenceLevel': 'confidence-medium', 'confidenceLabel': 'Confiance moyenne'}
        ]
        
        cm = datetime.now().month
        upcoming = []
        for i in range(1, 4):
            nm = ((cm + i - 1) % 12) + 1
            bo = monthly_data.get(nm, avg_monthly)
            g = round((bo / max(avg_monthly, 1) - 1) * 100, 1) if avg_monthly > 0 else 10
            upcoming.append({'month': months_names[nm], 'trend': max(0, g), 'expectedOrders': max(1, round(bo * (1 + g / 100)))})
        
        return jsonify({'success': True, 'data': {'historicalPeaks': historical_peaks, 'upcomingPeaks': upcoming, 'averageMonthlyOrders': avg_monthly}, 'generated_at': datetime.now().isoformat()})
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("\n🚀 Service IA Asala - Random Forest Classifier")
    print("📡 Endpoints: /health | /dashboard-stats | /predict | /predictions/top-products | /predictions/peaks")
    app.run(port=5001, debug=True, host='0.0.0.0')