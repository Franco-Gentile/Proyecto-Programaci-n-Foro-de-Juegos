import requests, json, sys, os

BASE = "http://localhost:8000"
TIMEOUT = 10
results = []

def req(method, url, **kw):
    kw.setdefault("timeout", TIMEOUT)
    return requests.request(method, url, **kw)

def sreq(session, method, url, **kw):
    kw.setdefault("timeout", TIMEOUT)
    return session.request(method, url, **kw)

def log(num, desc, expected, actual, passed):
    status = "[OK]" if passed else "[FAIL]"
    results.append({"num": num, "desc": desc, "expected": expected, "actual": actual, "passed": passed})
    print(f"  {status} [{actual}] {desc}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def auth(token):
    return {"Authorization": f"Bearer {token}"} if token else {}

print("\n=== INICIANDO PRUEBAS TP4 ===")

section("0. CREACION DE USUARIOS DE PRUEBA")

# Login como ADMIN
r = req("POST", f"{BASE}/api/auth/login/", json={"username": "admin", "password": "admin"})
log("0.1", "Login ADMIN", 200, r.status_code, r.status_code == 200)
admin_token = r.json().get("access") if r.status_code == 200 else None

# Login como MODERATOR
r = req("POST", f"{BASE}/api/auth/login/", json={"username": "mod", "password": "mod1234"})
log("0.2", "Login MODERATOR", 200, r.status_code, r.status_code == 200)
mod_token = r.json().get("access") if r.status_code == 200 else None

# Login como USER existente (o registrar si no existe)
r = req("POST", f"{BASE}/api/auth/login/", json={"username": "testuser_tp4", "password": "pass1234"})
if r.status_code == 200:
    log("0.3", "Login como testuser_tp4 (existente)", 200, r.status_code, True)
else:
    r = req("POST", f"{BASE}/api/users/", json={"username": "testuser_tp4", "email": "testuser_tp4@mail.com", "password": "pass1234"})
    log("0.3", "Registrar USER testuser_tp4", 201, r.status_code, r.status_code == 201)
user_token = r.json().get("access") if r.status_code in [200, 201] else None

# Login como otro USER existente (o registrar)
r = req("POST", f"{BASE}/api/auth/login/", json={"username": "otheruser_tp4", "password": "pass1234"})
if r.status_code == 200:
    log("0.4", "Login como otheruser_tp4 (existente)", 200, r.status_code, True)
else:
    r = req("POST", f"{BASE}/api/users/", json={"username": "otheruser_tp4", "email": "otheruser_tp4@mail.com", "password": "pass1234"})
    log("0.4", "Registrar otheruser_tp4", 201, r.status_code, r.status_code == 201)
other_token = r.json().get("access") if r.status_code in [200, 201] else None

# Obtener categorias
r = req("GET", f"{BASE}/api/categories/", headers=auth(admin_token))
if r.status_code == 200:
    cats = r.json().get("results", [])
    valid_cat_id = cats[0]["id"] if cats else None
else:
    valid_cat_id = None

print(f"\n  Categoria valida ID: {valid_cat_id}")

# =====================================================
section("1. CRUD POR ROLES - CATEGORIAS")
# =====================================================

# ADMIN crea categoria
uid = os.urandom(3).hex()
r = req("POST", f"{BASE}/api/categories/", json={"name": f"Cat-Admin-{uid}", "description": "Creada por admin"}, headers=auth(admin_token))
log("1.1.1", "ADMIN crea categoria", 201, r.status_code, r.status_code == 201)
cat_id = r.json().get("id") if r.status_code == 201 else None

# MODERATOR crea categoria
uid = os.urandom(3).hex()
r = req("POST", f"{BASE}/api/categories/", json={"name": f"Cat-Mod-{uid}", "description": "Creada por mod"}, headers=auth(mod_token))
log("1.1.2", "MODERATOR crea categoria", 201, r.status_code, r.status_code == 201)

# USER crea categoria (debe fallar)
r = req("POST", f"{BASE}/api/categories/", json={"name": "Cat-Test-User", "description": "Intento user"}, headers=auth(user_token))
log("1.1.3", "USER crea categoria (debe fallar)", 403, r.status_code, r.status_code == 403)

# ADMIN edita categoria
if cat_id:
    uid2 = os.urandom(3).hex()
    r = req("PUT", f"{BASE}/api/categories/{cat_id}/", json={"name": f"Cat-Edit-{uid2}"}, headers=auth(admin_token))
    log("1.1.4", "ADMIN edita categoria", 200, r.status_code, r.status_code in [200])

# USER edita categoria (debe fallar)
if cat_id:
    r = req("PUT", f"{BASE}/api/categories/{cat_id}/", json={"name": "Cat-Hackeada"}, headers=auth(user_token))
    log("1.1.5", "USER edita categoria (debe fallar)", 403, r.status_code, r.status_code == 403)

# ADMIN borra categoria
uid = os.urandom(3).hex()
r = req("POST", f"{BASE}/api/categories/", json={"name": f"Cat-ToDel-{uid}"}, headers=auth(admin_token))
temp_id = r.json().get("id") if r.status_code == 201 else None
if temp_id:
    r = req("DELETE", f"{BASE}/api/categories/{temp_id}/", headers=auth(admin_token))
    log("1.1.6", "ADMIN borra categoria", 204, r.status_code, r.status_code == 204)

# USER borra categoria (debe fallar)
if cat_id:
    r = req("DELETE", f"{BASE}/api/categories/{cat_id}/", headers=auth(user_token))
    log("1.1.7", "USER borra categoria (debe fallar)", 403, r.status_code, r.status_code == 403)

# USER lista categorias
r = req("GET", f"{BASE}/api/categories/", headers=auth(user_token))
log("1.1.8", "USER lista categorias", 200, r.status_code, r.status_code == 200)

# =====================================================
section("2. CRUD POR ROLES - POSTS")
# =====================================================

if not valid_cat_id:
    print("  [SKIP] No hay categorias disponibles")
else:
    # USER crea post
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post de test", "content": "Contenido", "category_id": valid_cat_id}, headers=auth(user_token))
    log("1.2.1", "USER crea post propio", 201, r.status_code, r.status_code == 201)
    post_id = r.json().get("id") if r.status_code == 201 else None

    # USER (dueno) edita post
    if post_id:
        r = req("PATCH", f"{BASE}/api/posts/{post_id}/", json={"title": "Editado por dueno"}, headers=auth(user_token))
        log("1.2.2", "USER (dueno) edita post", 200, r.status_code, r.status_code == 200)

    # USER (otro) edita post ajeno
    if post_id and other_token:
        r = req("PATCH", f"{BASE}/api/posts/{post_id}/", json={"title": "Intento ajeno"}, headers=auth(other_token))
        log("1.2.3", "USER (otro) edita post ajeno (debe fallar)", 403, r.status_code, r.status_code == 403)

    # USER (dueno) borra post propio
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post a borrar", "content": "x", "category_id": valid_cat_id}, headers=auth(user_token))
    temp_pid = r.json().get("id") if r.status_code == 201 else None
    if temp_pid:
        r = req("DELETE", f"{BASE}/api/posts/{temp_pid}/", headers=auth(user_token))
        log("1.2.4", "USER (dueno) borra post propio", 204, r.status_code, r.status_code == 204)

    # USER (otro) borra post ajeno
    if post_id and other_token:
        r = req("DELETE", f"{BASE}/api/posts/{post_id}/", headers=auth(other_token))
        log("1.2.5", "USER (otro) borra post ajeno (debe fallar)", 403, r.status_code, r.status_code == 403)

    # ADMIN borra cualquier post
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post admin del", "content": "x", "category_id": valid_cat_id}, headers=auth(user_token))
    tmp = r.json().get("id") if r.status_code == 201 else None
    if tmp:
        r = req("DELETE", f"{BASE}/api/posts/{tmp}/", headers=auth(admin_token))
        log("1.2.6", "ADMIN borra cualquier post", 204, r.status_code, r.status_code == 204)

    # MODERATOR borra cualquier post
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post mod del", "content": "x", "category_id": valid_cat_id}, headers=auth(user_token))
    tmp = r.json().get("id") if r.status_code == 201 else None
    if tmp:
        r = req("DELETE", f"{BASE}/api/posts/{tmp}/", headers=auth(mod_token))
        log("1.2.7", "MODERATOR borra cualquier post", 204, r.status_code, r.status_code == 204)

    # USER lista posts
    r = req("GET", f"{BASE}/api/posts/", headers=auth(user_token))
    log("1.2.8", "USER lista posts", 200, r.status_code, r.status_code == 200)

# =====================================================
section("3. CRUD POR ROLES - COMENTARIOS")
# =====================================================

if not valid_cat_id:
    print("  [SKIP] No hay categorias disponibles")
else:
    # Asegurar un post
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post para comments", "content": "x", "category_id": valid_cat_id}, headers=auth(user_token))
    post_id = r.json().get("id") if r.status_code == 201 else 1

    # USER crea comentario
    r = req("POST", f"{BASE}/api/comments/", json={"content": "Comment test", "post_id": post_id}, headers=auth(user_token))
    log("1.3.1", "USER crea comentario", 201, r.status_code, r.status_code == 201)
    comment_id = r.json().get("id") if r.status_code == 201 else None

    # USER (dueno) borra comentario propio
    r = req("POST", f"{BASE}/api/comments/", json={"content": "Comment a borrar", "post_id": post_id}, headers=auth(user_token))
    tmp_cid = r.json().get("id") if r.status_code == 201 else None
    if tmp_cid:
        r = req("DELETE", f"{BASE}/api/comments/{tmp_cid}/", headers=auth(user_token))
        log("1.3.2", "USER (dueno) borra comment propio", 204, r.status_code, r.status_code == 204)

    # USER (otro) borra comment ajeno
    if comment_id and other_token:
        r = req("DELETE", f"{BASE}/api/comments/{comment_id}/", headers=auth(other_token))
        log("1.3.3", "USER (otro) borra comment ajeno (debe fallar)", 403, r.status_code, r.status_code == 403)

    # ADMIN borra cualquier comentario
    if comment_id:
        r = req("DELETE", f"{BASE}/api/comments/{comment_id}/", headers=auth(admin_token))
        log("1.3.4", "ADMIN borra cualquier comentario", 204, r.status_code, r.status_code == 204)

# =====================================================
section("4. CRUD POR ROLES - REPORTES")
# =====================================================

if not valid_cat_id:
    print("  [SKIP] No hay categorias disponibles")
else:
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Post a reportar", "content": "x", "category_id": valid_cat_id}, headers=auth(user_token))
    rpid = r.json().get("id") if r.status_code == 201 else 1

    # USER crea reporte
    r = req("POST", f"{BASE}/api/reports/", json={"reason": "Inapropiado", "post_id": rpid}, headers=auth(user_token))
    log("1.4.1", "USER crea reporte", 201, r.status_code, r.status_code == 201)
    report_id = r.json().get("id") if r.status_code == 201 else None

    # USER lista reportes (debe fallar)
    r = req("GET", f"{BASE}/api/reports/", headers=auth(user_token))
    log("1.4.2", "USER lista reportes (debe fallar)", 403, r.status_code, r.status_code == 403)

    # ADMIN lista reportes
    r = req("GET", f"{BASE}/api/reports/", headers=auth(admin_token))
    log("1.4.3", "ADMIN lista reportes", 200, r.status_code, r.status_code == 200)

    # ADMIN actualiza estado
    if report_id:
        r = req("PATCH", f"{BASE}/api/reports/{report_id}/", json={"status": "REVIEWED"}, headers=auth(admin_token))
        log("1.4.4", "ADMIN actualiza estado reporte", 200, r.status_code, r.status_code == 200)

# =====================================================
section("5. CRUD POR ROLES - USUARIOS")
# =====================================================

# USER lista usuarios (solo debe verse a si mismo)
r = req("GET", f"{BASE}/api/users/", headers=auth(user_token))
log("1.5.2", "USER lista usuarios", 200, r.status_code, r.status_code == 200)
if r.status_code == 200:
    count = len(r.json().get("results", []))
    log("1.5.2b", f"USER ve {count} usuario(s) (solo si mismo esperado=1)", 1, count, count == 1)

# ADMIN lista usuarios
r = req("GET", f"{BASE}/api/users/", headers=auth(admin_token))
log("1.5.3", "ADMIN lista usuarios", 200, r.status_code, r.status_code == 200)

# USER borra otro usuario (debe fallar)
r = req("GET", f"{BASE}/api/users/", headers=auth(admin_token))
if r.status_code == 200:
    users = r.json().get("results", [])
    other_id = None
    for u in users:
        if u["username"] == "otheruser_tp4":
            other_id = u["id"]
            break
    if other_id:
        r = req("DELETE", f"{BASE}/api/users/{other_id}/", headers=auth(user_token))
        log("1.5.4", "USER borra otro usuario (debe fallar)", 403, r.status_code, r.status_code == 403)

# =====================================================
section("6. LOGICA DE NEGOCIO")
# =====================================================

# 2.1 Email existente (username diferente, mismo email)
uid2 = os.urandom(4).hex()
r = req("POST", f"{BASE}/api/users/", json={"username": f"dupemail_{uid2}", "email": "testuser_tp4@mail.com", "password": "pass1234"})
log("2.1", "Registrar con email existente (username distinto)", 400, r.status_code, r.status_code == 400)

# 2.2 Username existente
r = req("POST", f"{BASE}/api/users/", json={"username": "testuser_tp4", "email": "otro@mail.com", "password": "pass1234"})
log("2.2", "Registrar con username existente", 400, r.status_code, r.status_code == 400)

# 2.3 Sin email
r = req("POST", f"{BASE}/api/users/", json={"username": "noemail", "password": "pass1234"})
log("2.3", "Registrar sin email", 400, r.status_code, r.status_code == 400)

# 2.4 Post con category_id inexistente
r = req("POST", f"{BASE}/api/posts/", json={"title": "Test", "content": "x", "category_id": 99999}, headers=auth(user_token))
log("2.4", "Post con category_id inexistente", 400, r.status_code, r.status_code == 400)

# 2.5 Comment con post_id inexistente
r = req("POST", f"{BASE}/api/comments/", json={"content": "x", "post_id": 99999}, headers=auth(user_token))
log("2.5", "Comment con post_id inexistente", 400, r.status_code, r.status_code == 400)

# 2.6 Reporte sin referencia
r = req("POST", f"{BASE}/api/reports/", json={"reason": "Sin ref"}, headers=auth(user_token))
log("2.6", "Reporte sin post_id ni comment_id", 400, r.status_code, r.status_code == 400)

# 2.7 Post inexistente
r = req("GET", f"{BASE}/api/posts/99999/", headers=auth(user_token))
log("2.7", "Obtener post inexistente", 404, r.status_code, r.status_code == 404)

# 2.8 Login incorrecto
r = req("POST", f"{BASE}/api/auth/login/", json={"username": "noexiste", "password": "mal"})
log("2.8", "Login credenciales incorrectas", 401, r.status_code, r.status_code == 401)

# 2.9 Sin token
r = req("GET", f"{BASE}/api/users/me/")
log("2.9", "Sin token en /me/", 401, r.status_code, r.status_code == 401)

# 2.10 Logout sin refresh token
r = req("POST", f"{BASE}/api/auth/logout/", headers=auth(user_token))
log("2.10", "Logout sin refresh token", 400, r.status_code, r.status_code == 400)

# =====================================================
section("7. FLUJO COMPLETO")
# =====================================================

# 3.1 Registro (o login si ya existe)
session_id = f"flowuser_{os.urandom(2).hex()}"
r = req("POST", f"{BASE}/api/users/", json={"username": session_id, "email": f"{session_id}@mail.com", "password": "flowpass"})
log("3.1", "Registro flowuser", 201, r.status_code, r.status_code == 201)
flow_username = session_id

# 3.2 Login
r = req("POST", f"{BASE}/api/auth/login/", json={"username": flow_username, "password": "flowpass"})
log("3.2", "Login flowuser", 200, r.status_code, r.status_code == 200)
flow_token = r.json().get("access") if r.status_code == 200 else None
flow_refresh = r.json().get("refresh") if r.status_code == 200 else None

# 3.3 Perfil
if flow_token:
    r = req("GET", f"{BASE}/api/users/me/", headers=auth(flow_token))
    log("3.3", "Perfil propio", 200, r.status_code, r.status_code == 200)

# 3.4 Crear post
if flow_token and valid_cat_id:
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Flow Post", "content": "Flujo completo", "category_id": valid_cat_id}, headers=auth(flow_token))
    log("3.4", "Crear post", 201, r.status_code, r.status_code == 201)
    flow_post_id = r.json().get("id") if r.status_code == 201 else None

# 3.5 Listar posts
if flow_token:
    r = req("GET", f"{BASE}/api/posts/", headers=auth(flow_token))
    log("3.5", "Listar posts", 200, r.status_code, r.status_code == 200)

# 3.6 Crear comentario
if flow_token and flow_post_id:
    r = req("POST", f"{BASE}/api/comments/", json={"content": "Flow comment", "post_id": flow_post_id}, headers=auth(flow_token))
    log("3.6", "Crear comentario", 201, r.status_code, r.status_code == 201)

# 3.7 Editar post
if flow_token and flow_post_id:
    r = req("PATCH", f"{BASE}/api/posts/{flow_post_id}/", json={"title": "Flow Post Editado"}, headers=auth(flow_token))
    log("3.7", "Editar post", 200, r.status_code, r.status_code == 200)

# 3.8 Reportar post
if flow_token and flow_post_id:
    r = req("POST", f"{BASE}/api/reports/", json={"reason": "Report flow", "post_id": flow_post_id}, headers=auth(flow_token))
    log("3.8", "Reportar post", 201, r.status_code, r.status_code == 201)

# 3.9 Logout
if flow_token and flow_refresh:
    r = req("POST", f"{BASE}/api/auth/logout/", json={"refresh": flow_refresh}, headers=auth(flow_token))
    log("3.9", "Logout con refresh", 205, r.status_code, r.status_code == 205)

# =====================================================
section("8. SEGURIDAD")
# =====================================================

# 4.4 Anonimo crea post
if valid_cat_id:
    r = req("POST", f"{BASE}/api/posts/", json={"title": "Hack", "content": "anon", "category_id": valid_cat_id})
    log("4.4", "Anonimo crea post (debe fallar)", 401, r.status_code, r.status_code == 401)

# 4.5 Anonimo lista usuarios
r = req("GET", f"{BASE}/api/users/")
log("4.5", "Anonimo lista usuarios (debe fallar)", 401, r.status_code, r.status_code == 401)

# =====================================================
section("RESUMEN FINAL")
# =====================================================
total = len(results)
passed = sum(1 for r in results if r["passed"])
failed = total - passed
print(f"\n  Total: {total} | Pasaron: {passed} | Fallaron: {failed}")
print(f"  Aprobacion: {passed*100//total}%\n")

if failed > 0:
    print("  Pruebas falladas:")
    for r in results:
        if not r["passed"]:
            print(f"    [FAIL] #{r['num']} - {r['desc']}")
            print(f"       Esperado: {r['expected']} | Obtenido: {r['actual']}")
