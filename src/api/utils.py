"""
Utilidades compartidas del backend.

  - APIException:     errores controlados que se devuelven como JSON.
  - generate_sitemap: página de la raíz del servidor en desarrollo (lista de rutas).
  - role_required:    decorador que protege endpoints por rol.
  - slugify:          convierte un nombre en un trozo de URL.
"""

import re
from html import escape
import unicodedata
from functools import wraps
from flask import jsonify, url_for
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


# ------------------------------------------------------------------
# ERRORES CONTROLADOS
# ------------------------------------------------------------------

class APIException(Exception):
    """Error previsto que app.py (@app.errorhandler) convierte en JSON con su
    mensaje y su código. Se puede lanzar desde cualquier función, no solo la vista.
    """

    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        """Cuerpo de la respuesta: el payload (si lo hay) más el mensaje."""
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


# ------------------------------------------------------------------
# PÁGINA DE BIENVENIDA DE LA API
# ------------------------------------------------------------------
# Lista las rutas en la raíz del servidor. app.py solo la muestra en
# desarrollo; en producción la raíz sirve el front.

def has_no_empty_params(rule):
    """True si la ruta no pide parámetros en la URL (como /single/<id>) y
    por tanto se puede enlazar tal cual."""
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


def generate_sitemap(app):
    """Devuelve el HTML con la lista de endpoints de la API."""
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Solo rutas visitables desde el navegador: GET y sin parámetros.
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    # escape(): las rutas salen del propio Flask, pero así ningún carácter
    # raro puede romper el HTML.
    links_html = "".join(f"<li><a href='{escape(y)}'>{escape(y)}</a></li>" for y in links)
    return f"""<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>API de CleanFlow</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px;">
  <h1>API de CleanFlow</h1>
  <p>El servidor está en marcha. Estas son las rutas que se pueden abrir en el navegador
  (las de la API van con el prefijo <code>/api</code>):</p>
  <ul>{links_html}</ul>
</body>
</html>"""


# ------------------------------------------------------------------
# PERMISOS POR ROL
# ------------------------------------------------------------------

def role_required(*roles):
    """Deja pasar solo a los roles indicados: @role_required("manager", "worker").

    Verifica el token por su cuenta (sin @jwt_required()): 401 si falta o no
    vale, 403 si el rol no encaja. ⚠️ Es la única barrera real de los roles:
    los guardianes del frontend se saltan editando el navegador.
    """
    # Tres niveles porque el decorador recibe argumentos:
    #   role_required("manager") -> decorator(fn) -> wrapper, que corre en cada petición.
    def decorator(fn):
        # Sin @wraps todas las vistas se llamarían "wrapper" y Flask
        # fallaría al registrar la segunda.
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Lo mismo que hace @jwt_required(): sin token válido, 401.
            verify_jwt_in_request()

            # Import local para evitar un import circular con models.py.
            from api.models import db, User
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)

            # El rol se lee de la BD en cada petición, nunca del frontend.
            if not user or user.role not in roles:
                return jsonify({
                    "message": "No tienes permiso para acceder a esto."
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ------------------------------------------------------------------
# SLUGS
# ------------------------------------------------------------------

def slugify(text):
    """Convierte un nombre en un trozo de URL.

        "Limpieza integral"       ->  "limpieza-integral"
        "Fin de obra (+6 horas)"  ->  "fin-de-obra-6-horas"
        "  Plánchado  Ñoño "      ->  "planchado-nono"

    No comprueba si ya existe: el sufijo para repetidos lo pone el endpoint.
    """
    # NFKD separa la tilde de la letra ("á" -> "a" + "´") y el encode a
    # ASCII con "ignore" tira la tilde.
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")

    text = text.lower()

    # Lo que no sea letra o número pasa a guion (varios seguidos, uno solo).
    text = re.sub(r"[^a-z0-9]+", "-", text)

    return text.strip("-")