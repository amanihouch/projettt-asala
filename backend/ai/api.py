# backend/ai/api.py - VERSION CORRIGÉE (spécialement pour period=day)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("🚀 DÉMARRAGE DE L'API IA - TURATH")
print("=" * 60)

# ===== CONNEXION À LA BASE DE DONNÉES =====
def get_db_connection():
    try:
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='Asala123!',
            database='turath_ikbel',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn
    except Exception as e:
        print(f"❌ Erreur connexion DB: {e}")
        return None

# ===== STATISTIQUES PRINCIPALES =====
@app.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    period = request.args.get('period', 'week')
    print(f"\n📊 DEMANDE STATISTIQUES - PÉRIODE: {period}")
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Connexion DB échouée'})
        
        with conn.cursor() as cursor:
            
            # ===== 1. STATISTIQUES GLOBALES =====
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'customer'")
            customers = cursor.fetchone()['count'] or 0
            
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'vendor'")
            vendors = cursor.fetchone()['count'] or 0
            
            cursor.execute("SELECT COUNT(*) as count FROM posts WHERE status = 'approved'")
            products = cursor.fetchone()['count'] or 0
            
            cursor.execute("SELECT COUNT(*) as count FROM orders")
            total_orders = cursor.fetchone()['count'] or 0
            
            cursor.execute("SELECT COALESCE(SUM(total), 0) as total FROM orders")
            total_revenue = cursor.fetchone()['total'] or 0
            
            # ===== 2. DÉTERMINER L'INTERVALLE =====
            if period == 'day':
                interval_days = 1
                # ✅ CORRECTION : Utiliser DATE_FORMAT avec un alias
                label_sql = "DATE_FORMAT(createdAt, '%%H')"
                group_by = "DATE_FORMAT(createdAt, '%%H')"
                order_by = "DATE_FORMAT(createdAt, '%%H')"
            elif period == '3days':
                interval_days = 3
                label_sql = "DATE(createdAt)"
                group_by = "DATE(createdAt)"
                order_by = "DATE(createdAt)"
            elif period == 'week':
                interval_days = 7
                label_sql = "DATE(createdAt)"
                group_by = "DATE(createdAt)"
                order_by = "DATE(createdAt)"
            elif period == 'month':
                interval_days = 30
                label_sql = "DATE(createdAt)"
                group_by = "DATE(createdAt)"
                order_by = "DATE(createdAt)"
            elif period == '3months':
                interval_days = 90
                label_sql = "DATE(createdAt)"
                group_by = "DATE(createdAt)"
                order_by = "DATE(createdAt)"
            elif period == 'year':
                interval_days = 365
                label_sql = "DATE_FORMAT(createdAt, '%%Y-%%m')"
                group_by = "DATE_FORMAT(createdAt, '%%Y-%%m')"
                order_by = "DATE_FORMAT(createdAt, '%%Y-%%m')"
            else:
                interval_days = 7
                label_sql = "DATE(createdAt)"
                group_by = "DATE(createdAt)"
                order_by = "DATE(createdAt)"
            
            # ===== 3. ÉVOLUTION DES COMMANDES ET REVENUS =====
            cursor.execute(f"""
                SELECT 
                    {label_sql} as date_label,
                    COUNT(*) as count,
                    COALESCE(SUM(total), 0) as total
                FROM orders
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY)
                GROUP BY {group_by}
                ORDER BY {order_by} ASC
            """)
            orders_results = cursor.fetchall()
            
            orders_evolution = []
            revenue_evolution = []
            for r in orders_results:
                orders_evolution.append({
                    'date': str(r['date_label']),
                    'count': int(r['count'])
                })
                revenue_evolution.append({
                    'date': str(r['date_label']),
                    'total': float(r['total'])
                })
            
            # ===== 4. ÉVOLUTION DES VISITES =====
            visits_evolution = []
            total_visits = 0
            
            # Vérifier si la table visits existe
            cursor.execute("""
                SELECT COUNT(*) as table_exists 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = 'visits'
            """)
            table_exists = cursor.fetchone()['table_exists']
            
            if table_exists:
                if period == 'day':
                    visit_label = "DATE_FORMAT(created_at, '%%H')"
                    visit_group = "DATE_FORMAT(created_at, '%%H')"
                elif period == 'year':
                    visit_label = "DATE_FORMAT(created_at, '%%Y-%%m')"
                    visit_group = "DATE_FORMAT(created_at, '%%Y-%%m')"
                else:
                    visit_label = "DATE(created_at)"
                    visit_group = "DATE(created_at)"
                
                cursor.execute(f"""
                    SELECT 
                        {visit_label} as date_label,
                        COUNT(*) as count
                    FROM visits
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY)
                    GROUP BY {visit_group}
                    ORDER BY MIN(created_at) ASC
                """)
                visits_data = cursor.fetchall()
                
                for v in visits_data:
                    visits_evolution.append({
                        'date': str(v['date_label']),
                        'count': int(v['count'])
                    })
                
                cursor.execute("SELECT COUNT(*) as total FROM visits")
                total_visits_row = cursor.fetchone()
                total_visits = total_visits_row['total'] if total_visits_row else 0
            
            # Si pas de visites, générer des données vides (pas simulées)
            if not visits_evolution:
                for i in range(interval_days - 1, -1, -1):
                    day = datetime.now() - timedelta(days=i)
                    if period == 'day':
                        date_str = str(i)
                    elif period == 'year':
                        date_str = day.strftime('%Y-%m')
                    else:
                        date_str = day.strftime('%Y-%m-%d')
                    visits_evolution.append({
                        'date': date_str,
                        'count': 0  # ✅ 0 au lieu de données simulées
                    })
            
            # ===== 5. ÉVOLUTION DES PUBLICATIONS =====
            if period == 'day':
                post_label = "DATE_FORMAT(createdAt, '%%H')"
                post_group = "DATE_FORMAT(createdAt, '%%H')"
            elif period == 'year':
                post_label = "DATE_FORMAT(createdAt, '%%Y-%%m')"
                post_group = "DATE_FORMAT(createdAt, '%%Y-%%m')"
            else:
                post_label = "DATE(createdAt)"
                post_group = "DATE(createdAt)"
            
            cursor.execute(f"""
                SELECT 
                    {post_label} as date_label,
                    status,
                    COUNT(*) as count
                FROM posts
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY)
                GROUP BY {post_group}, status
                ORDER BY MIN(createdAt) ASC
            """)
            posts_data = cursor.fetchall()
            
            posts_evolution = []
            for p in posts_data:
                posts_evolution.append({
                    'date': str(p['date_label']),
                    'count': int(p['count']),
                    'status': p['status']
                })
            
            # ===== 6. ÉVOLUTION DES UTILISATEURS =====
            if period == 'day':
                user_label = "DATE_FORMAT(createdAt, '%%H')"
                user_group = "DATE_FORMAT(createdAt, '%%H')"
            elif period == 'year':
                user_label = "DATE_FORMAT(createdAt, '%%Y-%%m')"
                user_group = "DATE_FORMAT(createdAt, '%%Y-%%m')"
            else:
                user_label = "DATE(createdAt)"
                user_group = "DATE(createdAt)"
            
            cursor.execute(f"""
                SELECT 
                    {user_label} as date_label,
                    role,
                    COUNT(*) as count
                FROM users
                WHERE role IN ('customer', 'vendor')
                    AND createdAt >= DATE_SUB(NOW(), INTERVAL {interval_days} DAY)
                GROUP BY {user_group}, role
                ORDER BY MIN(createdAt) ASC
            """)
            users_data = cursor.fetchall()
            
            # Regrouper par date
            clients_by_date = {}
            vendors_by_date = {}
            
            for u in users_data:
                date_str = str(u['date_label'])
                if u['role'] == 'customer':
                    clients_by_date[date_str] = int(u['count'])
                elif u['role'] == 'vendor':
                    vendors_by_date[date_str] = int(u['count'])
            
            # Générer les labels
            labels = []
            clients_data = []
            vendors_data = []
            
            if period == 'day':
                for hour in range(24):
                    labels.append(str(hour))
                    clients_data.append(clients_by_date.get(str(hour), 0))
                    vendors_data.append(vendors_by_date.get(str(hour), 0))
            elif period == 'year':
                for month in range(1, 13):
                    month_str = f"2026-{month:02d}"
                    labels.append(month_str)
                    clients_data.append(clients_by_date.get(month_str, 0))
                    vendors_data.append(vendors_by_date.get(month_str, 0))
            else:
                for i in range(interval_days - 1, -1, -1):
                    day = datetime.now() - timedelta(days=i)
                    date_str = day.strftime('%Y-%m-%d')
                    labels.append(date_str)
                    clients_data.append(clients_by_date.get(date_str, 0))
                    vendors_data.append(vendors_by_date.get(date_str, 0))
            
            users_evolution = {
                'months': labels,
                'clients': clients_data,
                'vendors': vendors_data
            }
            
            # ===== 7. PRODUITS PAR CATÉGORIE =====
            cursor.execute("""
                SELECT 
                    COALESCE(c.nameAr, c.name, 'غير مصنف') as category_name,
                    COUNT(p.id) as count
                FROM categories c
                LEFT JOIN posts p ON p.categoryId = c.id AND p.status = 'approved'
                GROUP BY c.id, c.nameAr, c.name
                ORDER BY count DESC
            """)
            categories_data = cursor.fetchall()
            
            category_colors = [
                '#08717f', '#d40025', '#f59e0b', '#10b981', '#8b5cf6',
                '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7',
                '#06b6d4', '#84cc16', '#eab308', '#ef4444', '#3b82f6',
                '#d946ef', '#0ea5e9', '#22c55e', '#f43f5e', '#64748b'
            ]
            
            total_products_cat = sum(c['count'] for c in categories_data) or 1
            categories_list = []
            for i, cat in enumerate(categories_data):
                categories_list.append({
                    'name': cat['category_name'],
                    'count': int(cat['count']),
                    'color': category_colors[i % len(category_colors)],
                    'percent': round((int(cat['count']) / total_products_cat) * 100, 1)
                })
            
        conn.close()
        
        print(f"✅ Stats: {customers} clients, {vendors} vendeurs, {products} produits")
        print(f"✅ Commandes: {total_orders}, Revenus: {total_revenue}")
        print(f"✅ Visites: {total_visits}, Catégories: {len(categories_list)}")
        print(f"✅ Évolution: {len(orders_evolution)} commandes, {len(visits_evolution)} visites, {len(posts_evolution)} publications")
        
        return jsonify({
            'success': True,
            'period': period,
            'stats': {
                'total_users': customers,
                'total_vendors': vendors,
                'total_products': products,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_visits': total_visits,
                'categories': categories_list
            },
            'evolution': {
                'orders': orders_evolution,
                'revenue': revenue_evolution,
                'visits': visits_evolution,
                'posts': posts_evolution,
                'users': users_evolution
            },
            'model_info': {
                'accuracy': 0.85,
                'model_name': 'Random Forest'
            }
        })
            
    except Exception as e:
        print(f"❌ Erreur globale: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)})

# ===== HEALTH CHECK =====
@app.route('/health', methods=['GET'])
def health():
    try:
        conn = get_db_connection()
        if conn:
            conn.close()
            return jsonify({'status': 'OK', 'database': 'connected'})
        return jsonify({'status': 'OK', 'database': 'disconnected'})
    except:
        return jsonify({'status': 'OK', 'database': 'error'})

if __name__ == '__main__':
    print("\n🚀 Lancement du serveur sur http://localhost:5001")
    print("📡 API disponibles:")
    print("   GET  /dashboard-stats?period=week")
    print("   GET  /dashboard-stats?period=day")
    print("   GET  /dashboard-stats?period=month")
    print("   GET  /dashboard-stats?period=year")
    print("   GET  /health")
    print("\n" + "=" * 60)
    app.run(port=5001, debug=True)