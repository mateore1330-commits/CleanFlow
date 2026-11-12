"""
/admin: TODAS LAS TABLAS, PARA DESARROLLAR. SOLO EN LOCAL (FIX-05).

Flask-Admin enseña cada tabla y deja editar y borrar sin pedir
contraseña. En tu ordenador es cómodo para mirar los datos de prueba;
en la web publicada sería la llave maestra de todos los datos de los
usuarios. Por eso app.py solo llama a setup_admin con FLASK_DEBUG=1, y
en producción /admin devuelve 404.

Flask-Admin se importa dentro de la función: en producción ni se carga.

Usa la clave de Flask (app.secret_key, de FLASK_APP_KEY) para sus
formularios. La pone y la comprueba app.py al arrancar.
"""
import inspect

from . import models
from .models import db


def setup_admin(app):
    from flask_admin import Admin
    from flask_admin.contrib.sqla import ModelView
    from flask_admin.theme import Bootstrap4Theme

    admin = Admin(app, name="CleanFlow · Admin (solo local)", theme=Bootstrap4Theme(swatch="cerulean"))

    # Todas las clases de models.py que son tablas, cada una con su vista.
    for name, obj in inspect.getmembers(models):
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(obj, db.session))
